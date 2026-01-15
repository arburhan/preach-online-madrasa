import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import ExamResult from '@/lib/db/models/ExamResult';
import { auth } from '@/lib/auth/auth.config';

// GET - Get exam results
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
        const semesterId = searchParams.get('semesterId');
        const examId = searchParams.get('examId');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        // Students can only see their own results
        if (session.user.role === 'student') {
            query.student = session.user.id;
        }

        if (semesterId) {
            query.semester = semesterId;
        }

        if (examId) {
            query.exam = examId;
        }

        const results = await ExamResult.find(query)
            .populate('exam', 'titleBn type totalMarks passMarks')
            .populate('semester', 'number titleBn')
            .populate('student', 'name email')
            .sort({ submittedAt: -1 })
            .lean();

        return NextResponse.json(results);
    } catch (error) {
        console.error('Get results error:', error);
        return NextResponse.json(
            { error: 'রেজাল্ট লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT - Grade written answers (admin/teacher only)
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role === 'student') {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const { resultId, gradedAnswers, obtainedMarks } = await request.json();

        if (!resultId || typeof obtainedMarks !== 'number') {
            return NextResponse.json(
                { error: 'সব আবশ্যক ফিল্ড পূরণ করুন' },
                { status: 400 }
            );
        }

        const result = await ExamResult.findByIdAndUpdate(
            resultId,
            {
                answers: gradedAnswers,
                obtainedMarks,
                status: 'graded',
                gradedAt: new Date(),
                gradedBy: session.user.id,
            },
            { new: true }
        );

        if (!result) {
            return NextResponse.json(
                { error: 'রেজাল্ট পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Grade result error:', error);
        return NextResponse.json(
            { error: 'গ্রেড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
