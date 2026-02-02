import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import RetakeRequest, { RetakeRequestStatus } from '@/lib/db/models/RetakeRequest';
import ExamResult from '@/lib/db/models/ExamResult';
import Exam from '@/lib/db/models/Exam';
import { auth } from '@/lib/auth/auth.config';

// GET - Fetch retake requests
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
        const examId = searchParams.get('examId');
        const status = searchParams.get('status') || RetakeRequestStatus.PENDING;

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { status };

        // If student is checking their own request by examId, allow it
        if (examId && session.user.role === 'student') {
            query.exam = examId;
            query.student = session.user.id;
        } else if (['admin', 'teacher'].includes(session.user.role)) {
            // Teachers/admins can view all requests
            if (courseId) query.course = courseId;
            if (semesterId) query.semester = semesterId;
        } else {
            // Students can only view their own requests
            query.student = session.user.id;
        }

        const requests = await RetakeRequest.find(query)
            .populate('student', 'name email')
            .populate('exam', 'titleBn totalMarks passMarks')
            .populate('previousResult', 'obtainedMarks totalMarks')
            .sort({ requestedAt: -1 })
            .lean();

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Get retake requests error:', error);
        return NextResponse.json(
            { error: 'অনুরোধ লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Submit retake request (for students)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const { examId, reason } = await request.json();

        if (!examId) {
            return NextResponse.json(
                { error: 'পরীক্ষার আইডি আবশ্যক' },
                { status: 400 }
            );
        }

        // Get the exam
        const exam = await Exam.findById(examId).lean();
        if (!exam) {
            return NextResponse.json(
                { error: 'পরীক্ষা পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Get the latest result
        const result = await ExamResult.findOne({
            student: session.user.id,
            exam: examId,
            isLatest: true,
        }).lean();

        if (!result) {
            return NextResponse.json(
                { error: 'আপনি এই পরীক্ষা দেননি' },
                { status: 400 }
            );
        }

        // Check if failed
        const passed = result.obtainedMarks >= exam.passMarks;
        if (passed) {
            return NextResponse.json(
                { error: 'আপনি এই পরীক্ষায় পাস করেছেন' },
                { status: 400 }
            );
        }

        // Check if already has pending request
        const existingRequest = await RetakeRequest.findOne({
            student: session.user.id,
            exam: examId,
            status: RetakeRequestStatus.PENDING,
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: 'আপনি ইতিমধ্যে অনুরোধ করেছেন' },
                { status: 400 }
            );
        }

        // Create retake request
        const retakeRequest = await RetakeRequest.create({
            student: session.user.id,
            exam: examId,
            course: exam.course,
            semester: exam.semester,
            previousResult: result._id,
            reason: reason || '',
        });

        return NextResponse.json(
            {
                message: 'অনুরোধ সফলভাবে জমা দেওয়া হয়েছে',
                request: retakeRequest,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create retake request error:', error);
        return NextResponse.json(
            { error: 'অনুরোধ জমা দিতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
