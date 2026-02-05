import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Teacher from '@/lib/db/models/Teacher';

// POST /api/auth/reset-password
export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'টোকেন এবং পাসওয়ার্ড প্রয়োজন' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
                { status: 400 }
            );
        }

        await connectDB();

        console.log('Looking for token:', token.substring(0, 10) + '...');
        console.log('Current time:', new Date());

        // Check in Student collection - first without time check
        let user = await Student.findOne({
            passwordResetToken: token,
        });

        if (user) {
            console.log('Found user in Student with token');
            console.log('Token expires:', user.passwordResetExpires);
            // Now check if expired
            if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
                return NextResponse.json(
                    { error: 'রিসেট লিংকের মেয়াদ শেষ হয়ে গেছে। নতুন লিংক অনুরোধ করুন।' },
                    { status: 400 }
                );
            }
        }

        let userType = 'student';

        // If not found in Student, check Teacher
        if (!user) {
            user = await Teacher.findOne({
                passwordResetToken: token,
            });

            if (user) {
                console.log('Found user in Teacher with token');
                console.log('Token expires:', user.passwordResetExpires);
                // Now check if expired
                if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
                    return NextResponse.json(
                        { error: 'রিসেট লিংকের মেয়াদ শেষ হয়ে গেছে। নতুন লিংক অনুরোধ করুন।' },
                        { status: 400 }
                    );
                }
            }
            userType = 'teacher';
        }

        if (!user) {
            console.log('No user found with this token');
            return NextResponse.json(
                { error: 'অবৈধ রিসেট লিংক। অনুগ্রহ করে নতুন লিংক অনুরোধ করুন।' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // Also verify email if not already verified
        if (!user.isEmailVerified) {
            user.isEmailVerified = true;
        }

        await user.save();

        return NextResponse.json({
            message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! এখন আপনি লগইন করতে পারবেন।',
            userType,
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
