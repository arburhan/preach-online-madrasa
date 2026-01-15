import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Teacher from '@/lib/db/models/Teacher';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { userId, reason } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'ইউজার আইডি প্রয়োজন' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find the teacher
        const teacher = await Teacher.findById(userId);

        if (!teacher) {
            return NextResponse.json(
                { error: 'শিক্ষক পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Delete the teacher account
        await Teacher.findByIdAndDelete(userId);

        return NextResponse.json({
            message: 'শিক্ষক প্রত্যাখ্যান করা হয়েছে',
            reason: reason || 'কোনো কারণ উল্লেখ করা হয়নি'
        });
    } catch (error) {
        console.error('Teacher rejection error:', error);
        return NextResponse.json(
            { error: 'শিক্ষক প্রত্যাখ্যানে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
