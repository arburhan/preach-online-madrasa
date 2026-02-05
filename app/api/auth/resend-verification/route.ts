import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Teacher from '@/lib/db/models/Teacher';
import { sendVerificationEmail } from '@/lib/email/mailer';

// POST /api/auth/resend-verification
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'ইমেইল প্রয়োজন' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check in Student collection
        let user = await Student.findOne({ email });
        let userType = 'student';

        // If not found in Student, check Teacher
        if (!user) {
            user = await Teacher.findOne({ email });
            userType = 'teacher';
        }

        if (!user) {
            return NextResponse.json(
                { error: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return NextResponse.json(
                { error: 'আপনার ইমেইল ইতিমধ্যে ভেরিফাই হয়েছে' },
                { status: 400 }
            );
        }

        // Check if user is OAuth user (no password = OAuth)
        if (user.provider === 'google') {
            return NextResponse.json(
                { error: 'Google অ্যাকাউন্টের জন্য ভেরিফিকেশন প্রয়োজন নেই' },
                { status: 400 }
            );
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = verificationExpires;
        await user.save();

        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationToken);

        if (!emailSent) {
            return NextResponse.json(
                { error: 'ইমেইল পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'নতুন ভেরিফিকেশন ইমেইল পাঠানো হয়েছে। আপনার ইনবক্স চেক করুন।',
            userType,
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            { error: 'ইমেইল পাঠাতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
