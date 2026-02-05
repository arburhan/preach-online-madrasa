import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Teacher from '@/lib/db/models/Teacher';

// GET /api/auth/verify-email?token=xxx
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'ভেরিফিকেশন টোকেন প্রয়োজন' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check in Student collection
        let user = await Student.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() },
        });

        let userType = 'student';

        // If not found in Student, check Teacher
        if (!user) {
            user = await Teacher.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: new Date() },
            });
            userType = 'teacher';
        }

        if (!user) {
            return NextResponse.json(
                { error: 'অবৈধ বা মেয়াদোত্তীর্ণ ভেরিফিকেশন লিংক' },
                { status: 400 }
            );
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        return NextResponse.json({
            message: 'ইমেইল সফলভাবে ভেরিফাই হয়েছে! এখন আপনি লগইন করতে পারবেন।',
            verified: true,
            userType,
        });

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'ভেরিফিকেশন করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
