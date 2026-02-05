import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Teacher from '@/lib/db/models/Teacher';
import { sendPasswordResetEmail } from '@/lib/email/mailer';

// POST /api/auth/forgot-password
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

        // Generate password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        console.log('Generated token:', resetToken.substring(0, 10) + '...');

        // Try to update Student first
        let updatedUser = await Student.findOneAndUpdate(
            { email },
            {
                $set: {
                    passwordResetToken: resetToken,
                    passwordResetExpires: resetExpires,
                }
            },
            { new: true }
        );

        let userType = 'student';

        // If not found in Student, try Teacher
        if (!updatedUser) {
            updatedUser = await Teacher.findOneAndUpdate(
                { email },
                {
                    $set: {
                        passwordResetToken: resetToken,
                        passwordResetExpires: resetExpires,
                    }
                },
                { new: true }
            );
            userType = 'teacher';
        }

        // If user not found in either collection
        if (!updatedUser) {
            // Return success to prevent email enumeration
            return NextResponse.json({
                message: 'যদি এই ইমেইল দিয়ে অ্যাকাউন্ট থাকে, তাহলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।',
            });
        }

        // Check if user is OAuth user (no password = OAuth)
        if (updatedUser.provider === 'google' && !updatedUser.password) {
            // Clear the token we just set
            if (userType === 'student') {
                await Student.findOneAndUpdate({ email }, { $unset: { passwordResetToken: 1, passwordResetExpires: 1 } });
            } else {
                await Teacher.findOneAndUpdate({ email }, { $unset: { passwordResetToken: 1, passwordResetExpires: 1 } });
            }
            return NextResponse.json(
                { error: 'এই ইমেইল Google অ্যাকাউন্টের সাথে যুক্ত। Google দিয়ে লগইন করুন।' },
                { status: 400 }
            );
        }

        console.log('Token saved for user:', updatedUser.email);
        console.log('Saved token:', updatedUser.passwordResetToken?.substring(0, 10) + '...');

        // Send password reset email
        const emailSent = await sendPasswordResetEmail(email, resetToken);

        if (!emailSent) {
            return NextResponse.json(
                { error: 'ইমেইল পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।',
            userType,
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
