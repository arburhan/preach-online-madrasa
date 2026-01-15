import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import User, { UserRole } from '@/lib/db/models/User';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role, gender, fatherName, motherName, mobileNumber, address, teacherQualifications } = await request.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'সব ফিল্ড পূরণ করুন' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
                { status: 400 }
            );
        }

        // Gender validation for teachers
        if (role === 'teacher' && !gender) {
            return NextResponse.json(
                { error: 'লিঙ্গ নির্বাচন করুন' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role === 'teacher' ? UserRole.TEACHER : UserRole.STUDENT,
            provider: 'credentials',
            gender: gender || undefined,
            isTeacherApproved: false,
            // Teacher specific fields
            ...(role === 'teacher' && {
                fatherName,
                motherName,
                mobileNumber,
                address,
                teacherQualifications,
            }),
        });

        return NextResponse.json(
            {
                message: 'নিবন্ধন সফল হয়েছে',
                userId: user._id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'নিবন্ধন করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
