import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Exam from '@/lib/db/models/Exam';
import ExamResult from '@/lib/db/models/ExamResult';
import Course from '@/lib/db/models/Course';
import { auth } from '@/lib/auth/auth.config';

// GET - Get exam statistics (teachers only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        // Check authentication
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অনুমোদিত নন' },
                { status: 401 }
            );
        }

        // Check if user is teacher
        if (session.user.role !== 'teacher') {
            return NextResponse.json(
                { error: 'শুধুমাত্র শিক্ষকরা পরীক্ষার পরিসংখ্যান দেখতে পারবেন' },
                { status: 403 }
            );
        }

        await connectDB();

        // Find the exam with course populated
        const exam = await Exam.findById(id).populate('course');

        if (!exam) {
            return NextResponse.json(
                { error: 'পরীক্ষা পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if teacher has access (either created the exam or is a course instructor)
        const hasAccess =
            exam.createdBy?.toString() === session.user.id ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (exam.course as any)?.instructors?.some(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (instructorId: any) => instructorId.toString() === session.user.id
            );

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'এই পরীক্ষার পরিসংখ্যান দেখার অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Get all exam results for this exam
        const results = await ExamResult.find({
            exam: id,
            isRetake: { $ne: true } // Only count first attempts
        });

        // Calculate passed/failed based on percentage >= 40%
        const passed = results.filter(r => r.percentage >= 40).length;
        const failed = results.filter(r => r.percentage < 40).length;

        // For courses without formal enrollment, use students who have attempted
        // Otherwise get from course.enrolledCount
        const course = await Course.findById(exam.course);
        const totalStudents = course?.enrolledCount || results.length;
        const notTaken = totalStudents - results.length;

        // Calculate average score
        const averageScore = results.length > 0
            ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
            : 0;

        return NextResponse.json({
            totalStudents,
            passed,
            failed,
            notTaken,
            averageScore: Math.round(averageScore * 10) / 10,
        });
    } catch (error) {
        console.error('Error fetching exam statistics:', error);
        return NextResponse.json(
            { error: 'পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে' },
            { status: 500 }
        );
    }
}
