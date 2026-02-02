import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Teacher from '@/lib/db/models/Teacher';

export async function POST(request: NextRequest) {
    try {
        const {
            name,
            email,
            password,
            role,
            gender,
            fatherName,
            motherName,
            mobileNumber,
            address,
            qualifications
        } = await request.json();

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
                { error: 'শিক্ষকদের জন্য লিঙ্গ নির্বাচন আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already exists in any model
        const existingStudent = await Student.findOne({ email });
        const existingTeacher = await Teacher.findOne({ email });

        if (existingStudent || existingTeacher) {
            return NextResponse.json(
                { error: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user based on role
        if (role === 'teacher') {
            // Create Teacher
            const teacher = await Teacher.create({
                name,
                email,
                password: hashedPassword,
                gender,
                provider: 'credentials',
                fatherName,
                motherName,
                mobileNumber,
                address,
                qualifications,
                isApproved: false,
                approvalStatus: 'pending',
            });

            return NextResponse.json(
                {
                    message: 'শিক্ষক নিবন্ধন সফল হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।',
                    userId: teacher._id,
                },
                { status: 201 }
            );
        } else {
            // Create Student (default)
            const student = await Student.create({
                name,
                email,
                password: hashedPassword,
                gender: gender || undefined,
                provider: 'credentials',
            });

            return NextResponse.json(
                {
                    message: 'নিবন্ধন সফল হয়েছে',
                    userId: student._id,
                },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'নিবন্ধন করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
