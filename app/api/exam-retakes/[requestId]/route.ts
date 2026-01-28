import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import RetakeRequest, { RetakeRequestStatus } from '@/lib/db/models/RetakeRequest';
import ExamResult from '@/lib/db/models/ExamResult';
import { auth } from '@/lib/auth/auth.config';
import mongoose from 'mongoose';

// PUT - Approve/reject retake request (teachers only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || !['admin', 'teacher'].includes(session.user.role)) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { requestId } = await params;
        await connectDB();

        const { status } = await request.json();

        if (!status || ![RetakeRequestStatus.APPROVED, RetakeRequestStatus.REJECTED].includes(status)) {
            return NextResponse.json(
                { error: 'অবৈধ স্ট্যাটাস' },
                { status: 400 }
            );
        }

        const retakeRequest = await RetakeRequest.findById(requestId);
        if (!retakeRequest) {
            return NextResponse.json(
                { error: 'অনুরোধ পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        if (retakeRequest.status !== RetakeRequestStatus.PENDING) {
            return NextResponse.json(
                { error: 'এই অনুরোধটি ইতিমধ্যে প্রক্রিয়া করা হয়েছে' },
                { status: 400 }
            );
        }

        // Update request status
        retakeRequest.status = status;
        retakeRequest.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
        retakeRequest.reviewedAt = new Date();
        await retakeRequest.save();

        // If approved, update the exam result to allow retake
        if (status === RetakeRequestStatus.APPROVED) {
            await ExamResult.findByIdAndUpdate(retakeRequest.previousResult, {
                canRetake: true,
            });
        }

        return NextResponse.json({
            message: status === RetakeRequestStatus.APPROVED
                ? 'অনুরোধ অনুমোদিত হয়েছে'
                : 'অনুরোধ প্রত্যাখ্যান করা হয়েছে',
            request: retakeRequest,
        });
    } catch (error) {
        console.error('Update retake request error:', error);
        return NextResponse.json(
            { error: 'অনুরোধ আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE - Cancel retake request (students only, for their own pending requests)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { requestId } = await params;
        await connectDB();

        const retakeRequest = await RetakeRequest.findById(requestId);
        if (!retakeRequest) {
            return NextResponse.json(
                { error: 'অনুরোধ পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Students can only delete their own pending requests
        if (
            session.user.role === 'student' &&
            (retakeRequest.student.toString() !== session.user.id ||
                retakeRequest.status !== RetakeRequestStatus.PENDING)
        ) {
            return NextResponse.json(
                { error: 'আপনি এই অনুরোধ বাতিল করতে পারবেন না' },
                { status: 403 }
            );
        }

        await RetakeRequest.findByIdAndDelete(requestId);

        return NextResponse.json({ message: 'অনুরোধ বাতিল করা হয়েছে' });
    } catch (error) {
        console.error('Delete retake request error:', error);
        return NextResponse.json(
            { error: 'অনুরোধ বাতিল করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
