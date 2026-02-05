import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Teacher from '@/lib/db/models/Teacher';
import { sendVerificationEmail } from '@/lib/email/mailer';

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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
                isEmailVerified: false,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
            });

            // Send verification email
            const emailSent = await sendVerificationEmail(email, verificationToken);

            if (!emailSent) {
                console.error('Failed to send verification email to teacher:', email);
            }

            return NextResponse.json(
                {
                    message: 'শিক্ষক নিবন্ধন সফল হয়েছে। অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।',
                    userId: teacher._id,
                    requiresVerification: true,
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
                isEmailVerified: false,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
            });

            // Send verification email
            const emailSent = await sendVerificationEmail(email, verificationToken);

            if (!emailSent) {
                console.error('Failed to send verification email to student:', email);
            }

            return NextResponse.json(
                {
                    message: 'নিবন্ধন সফল হয়েছে। অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।',
                    userId: student._id,
                    requiresVerification: true,
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
