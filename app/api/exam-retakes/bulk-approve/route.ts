import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import RetakeRequest, { RetakeRequestStatus } from '@/lib/db/models/RetakeRequest';
import ExamResult from '@/lib/db/models/ExamResult';
import { auth } from '@/lib/auth/auth.config';

// POST - Bulk approve retake requests (teachers only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || !['admin', 'teacher'].includes(session.user.role)) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const { requestIds } = await request.json();

        if (!Array.isArray(requestIds) || requestIds.length === 0) {
            return NextResponse.json(
                { error: 'অনুরোধ আইডি তালিকা আবশ্যক' },
                { status: 400 }
            );
        }

        // Get all pending requests
        const requests = await RetakeRequest.find({
            _id: { $in: requestIds },
            status: RetakeRequestStatus.PENDING,
        });

        if (requests.length === 0) {
            return NextResponse.json(
                { error: 'কোনো অনুমোদনযোগ্য অনুরোধ পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        const now = new Date();
        const resultIds = requests.map(r => r.previousResult);

        // Update all requests
        await RetakeRequest.updateMany(
            { _id: { $in: requestIds }, status: RetakeRequestStatus.PENDING },
            {
                $set: {
                    status: RetakeRequestStatus.APPROVED,
                    reviewedBy: session.user.id,
                    reviewedAt: now,
                },
            }
        );

        // Update all exam results to allow retake
        await ExamResult.updateMany(
            { _id: { $in: resultIds } },
            { $set: { canRetake: true } }
        );

        return NextResponse.json({
            message: `${requests.length}টি অনুরোধ অনুমোদিত হয়েছে`,
            count: requests.length,
        });
    } catch (error) {
        console.error('Bulk approve retake requests error:', error);
        return NextResponse.json(
            { error: 'অনুরোধ অনুমোদন করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
