import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { auth } from '@/lib/auth/auth.config';
import Course from '@/lib/db/models/Course';
import Exam from '@/lib/db/models/Exam';
import ExamResult from '@/lib/db/models/ExamResult';
import Student from '@/lib/db/models/Student';

// GET /api/courses/[courseId]/statistics - Get course-level exam statistics
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || !['teacher', 'admin'].includes(session.user.role)) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { courseId } = await params;
        await connectDB();

        // Verify course exists and user has access
        const course = await Course.findById(courseId).lean();
        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check instructor access
        const isInstructor = course.instructors?.some(
            (id: any) => id.toString() === session.user.id // eslint-disable-line @typescript-eslint/no-explicit-any
        );
        if (!isInstructor && session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Get all exams for this course
        const exams = await Exam.find({ course: courseId })
            .select('_id titleBn totalMarks passMarks')
            .lean();

        if (exams.length === 0) {
            return NextResponse.json({
                totalEnrolled: 0,
                totalExams: 0,
                completedAllExams: 0,
                notStarted: 0,
                partiallyCompleted: 0,
                examStats: [],
                topStudents: [],
            });
        }

        // Get all enrolled students for this course
        const enrolledStudents = await Student.find({
            'enrolledCourses.course': courseId
        }).select('_id name email').lean();

        const totalEnrolled = enrolledStudents.length;

        // Get all exam results for this course
        const allResults = await ExamResult.find({
            course: courseId
        }).populate('student', 'name email').lean();

        // Calculate per-exam statistics
        const examStats = [];
        for (const exam of exams) {
            const examResults = allResults.filter(
                (r: any) => r.exam?.toString() === exam._id.toString()
            );

            const passed = examResults.filter((r: any) => r.obtainedMarks >= exam.passMarks).length;
            const failed = examResults.filter((r: any) => r.obtainedMarks < exam.passMarks).length;
            const taken = examResults.length;
            const notTaken = totalEnrolled - taken;
            const avgScore = taken > 0
                ? examResults.reduce((sum: number, r: any) => sum + r.obtainedMarks, 0) / taken
                : 0;

            examStats.push({
                _id: exam._id.toString(),
                titleBn: exam.titleBn,
                totalMarks: exam.totalMarks,
                passMarks: exam.passMarks,
                taken,
                passed,
                failed,
                notTaken,
                averageScore: Math.round(avgScore * 100) / 100,
            });
        }

        // Calculate student completion stats
        const studentExamCounts = new Map<string, { count: number; totalMarks: number; student: any }>();

        for (const result of allResults as any[]) {
            const studentId = result.student?._id?.toString();
            if (!studentId) continue;

            const current = studentExamCounts.get(studentId) || {
                count: 0,
                totalMarks: 0,
                student: result.student
            };
            current.count++;
            current.totalMarks += result.obtainedMarks || 0;
            studentExamCounts.set(studentId, current);
        }

        let completedAllExams = 0;
        let partiallyCompleted = 0;
        let notStarted = totalEnrolled;

        for (const [, data] of studentExamCounts) {
            if (data.count >= exams.length) {
                completedAllExams++;
                notStarted--;
            } else if (data.count > 0) {
                partiallyCompleted++;
                notStarted--;
            }
        }

        // Top students (by total marks across all exams)
        const topStudentsArr = Array.from(studentExamCounts.entries())
            .filter(([, data]) => data.count >= exams.length) // Only those who completed all exams
            .sort((a, b) => b[1].totalMarks - a[1].totalMarks)
            .slice(0, 10)
            .map(([, data], index) => ({
                rank: index + 1,
                _id: data.student?._id?.toString(),
                name: data.student?.name || 'Unknown',
                email: data.student?.email || '',
                totalMarks: data.totalMarks,
                examsCompleted: data.count,
            }));

        return NextResponse.json({
            courseName: course.titleBn,
            totalEnrolled,
            totalExams: exams.length,
            completedAllExams,
            partiallyCompleted,
            notStarted: Math.max(0, notStarted),
            examStats,
            topStudents: topStudentsArr,
        });
    } catch (error) {
        console.error('Course statistics error:', error);
        return NextResponse.json(
            { error: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
