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
        const { userId } = body;

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

        if (teacher.isApproved) {
            return NextResponse.json(
                { error: 'এই শিক্ষক ইতিমধ্যে অনুমোদিত' },
                { status: 400 }
            );
        }

        // Approve the teacher
        teacher.isApproved = true;
        teacher.approvalStatus = 'approved';
        await teacher.save();

        return NextResponse.json({
            message: 'শিক্ষক সফলভাবে অনুমোদিত হয়েছেন',
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
            }
        });
    } catch (error) {
        console.error('Teacher approval error:', error);
        return NextResponse.json(
            { error: 'শিক্ষক অনুমোদনে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
