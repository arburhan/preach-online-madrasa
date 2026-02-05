import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import { requireAuth } from '@/lib/auth/rbac';

// POST /api/user/profile/gender-change-request - Submit gender change request
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();

        if (user.role !== 'student') {
            return NextResponse.json(
                { error: 'শুধুমাত্র শিক্ষার্থীরা এই অনুরোধ করতে পারবেন' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { reason } = body;

        if (!reason || reason.trim().length < 10) {
            return NextResponse.json(
                { error: 'অনুগ্রহ করে পরিবর্তনের কারণ বিস্তারিত লিখুন (কমপক্ষে ১০ অক্ষর)' },
                { status: 400 }
            );
        }

        await connectDB();

        const student = await Student.findById(user.id);

        if (!student) {
            return NextResponse.json(
                { error: 'শিক্ষার্থী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        if (!student.gender) {
            return NextResponse.json(
                { error: 'আপনি এখনো জেন্ডার সিলেক্ট করেননি। প্রোফাইল থেকে সিলেক্ট করুন।' },
                { status: 400 }
            );
        }

        // Check if there's already a pending request
        if (student.genderChangeRequest?.status === 'pending') {
            return NextResponse.json(
                { error: 'আপনার একটি অনুরোধ ইতিমধ্যে পেন্ডিং আছে' },
                { status: 400 }
            );
        }

        // Create gender change request
        student.genderChangeRequest = {
            status: 'pending',
            requestedAt: new Date(),
            reason: reason.trim()
        };

        await student.save();

        return NextResponse.json({
            message: 'জেন্ডার পরিবর্তনের অনুরোধ সফলভাবে জমা হয়েছে। অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।',
            status: 'pending'
        });

    } catch (error) {
        console.error('Gender change request error:', error);
        return NextResponse.json(
            { error: 'অনুরোধ জমা দিতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// GET /api/user/profile/gender-change-request - Get current request status
export async function GET() {
    try {
        const user = await requireAuth();

        if (user.role !== 'student') {
            return NextResponse.json({ request: null });
        }

        await connectDB();

        const student = await Student.findById(user.id).select('genderChangeRequest').lean();

        if (!student) {
            return NextResponse.json(
                { error: 'শিক্ষার্থী পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            request: student.genderChangeRequest || null
        });

    } catch (error) {
        console.error('Get gender change request error:', error);
        return NextResponse.json(
            { error: 'তথ্য লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
