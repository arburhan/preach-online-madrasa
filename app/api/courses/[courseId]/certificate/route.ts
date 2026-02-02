import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { auth } from '@/lib/auth/auth.config';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import ExamResult from '@/lib/db/models/ExamResult';
import Progress from '@/lib/db/models/Progress';
import Student from '@/lib/db/models/Student';

// GET /api/courses/[courseId]/certificate - Check certificate eligibility
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { courseId } = await params;
        await connectDB();

        // Get course info
        const course = await Course.findById(courseId)
            .populate('instructors', 'name')
            .lean();

        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if course is marked as completed
        if (!course.isCompleted) {
            return NextResponse.json({
                eligible: false,
                reason: 'কোর্স এখনো শেষ হয়নি',
            });
        }

        // Get student info
        const student = await Student.findById(session.user.id)
            .select('name email')
            .lean();

        if (!student) {
            return NextResponse.json(
                { error: 'শিক্ষার্থী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if enrolled
        const isEnrolled = await Student.exists({
            _id: session.user.id,
            'enrolledCourses.course': courseId,
        });

        if (!isEnrolled) {
            return NextResponse.json({
                eligible: false,
                reason: 'আপনি এই কোর্সে নথিভুক্ত নন',
            });
        }

        // Get all lessons for this course
        const lessons = await Lesson.find({ course: courseId }).select('_id').lean();
        const lessonIds = lessons.map(l => l._id.toString());

        // Get all exams for this course
        const exams = await Exam.find({ course: courseId }).select('_id passMarks').lean();

        // Check lesson completion
        const completedLessons = await Progress.countDocuments({
            user: session.user.id,
            course: courseId,
            lesson: { $in: lessonIds },
            isCompleted: true,
        });

        const allLessonsCompleted = completedLessons >= lessons.length;

        // Check exam pass status
        let allExamsPassed = true;
        for (const exam of exams) {
            const result = await ExamResult.findOne({
                student: session.user.id,
                exam: exam._id,
            }).sort({ createdAt: -1 }).lean();

            if (!result || (result as any).obtainedMarks < exam.passMarks) { // eslint-disable-line @typescript-eslint/no-explicit-any
                allExamsPassed = false;
                break;
            }
        }

        const eligible = allLessonsCompleted && allExamsPassed && lessons.length > 0;

        if (!eligible) {
            let reason = '';
            if (!allLessonsCompleted) {
                reason = `আপনি ${completedLessons}/${lessons.length} টি পাঠ সম্পন্ন করেছেন`;
            } else if (!allExamsPassed) {
                reason = 'আপনি সব পরীক্ষায় পাশ করেননি';
            } else {
                reason = 'কোর্সে কোনো পাঠ নেই';
            }
            return NextResponse.json({ eligible: false, reason });
        }

        // Get instructor names
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const instructorNames = (course.instructors as any[])
            ?.map((i: any) => i.name) // eslint-disable-line @typescript-eslint/no-explicit-any
            .filter(Boolean)
            .join(', ') || 'প্রশিক্ষক';

        // Generate certificate data
        const certificateData = {
            studentName: (student as any).name, // eslint-disable-line @typescript-eslint/no-explicit-any
            studentEmail: (student as any).email, // eslint-disable-line @typescript-eslint/no-explicit-any
            courseName: course.titleBn,
            courseNameEn: course.titleEn,
            instructorName: instructorNames,
            completionDate: new Date().toISOString(),
            totalLessons: lessons.length,
            totalExams: exams.length,
            certificateId: `PREACH-${courseId.slice(-6).toUpperCase()}-${session.user.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        };

        return NextResponse.json({
            eligible: true,
            certificate: certificateData,
        });
    } catch (error) {
        console.error('Certificate eligibility error:', error);
        return NextResponse.json(
            { error: 'সার্টিফিকেট যাচাই করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
