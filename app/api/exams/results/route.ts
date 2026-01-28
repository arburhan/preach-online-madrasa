import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import ExamResult from '@/lib/db/models/ExamResult';
import { auth } from '@/lib/auth/auth.config';

// GET - Fetch exam results for a course (for students)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        const semesterId = searchParams.get('semesterId');

        if (!courseId && !semesterId) {
            return NextResponse.json(
                { error: 'কোর্স বা সেমিস্টার আইডি আবশ্যক' },
                { status: 400 }
            );
        }

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {
            student: session.user.id,
            isLatest: true,
        };

        if (courseId) query.course = courseId;
        if (semesterId) query.semester = semesterId;

        // Get all latest exam results
        const results = await ExamResult.find(query)
            .populate('exam', 'titleBn totalMarks passMarks')
            .lean();

        // Transform results to include pass/fail status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedResults = results.map((result: any) => ({
            examId: result.exam._id.toString(),
            titleBn: result.exam.titleBn,
            obtainedMarks: result.obtainedMarks,
            totalMarks: result.totalMarks,
            passMarks: result.exam.passMarks,
            passed: result.obtainedMarks >= result.exam.passMarks,
            canRetake: result.canRetake || false,
            attemptNumber: result.attemptNumber || 1,
            grade: result.grade,
            percentage: result.percentage,
        }));

        return NextResponse.json(transformedResults);
    } catch (error) {
        console.error('Get exam results error:', error);
        return NextResponse.json(
            { error: 'ফলাফল লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
