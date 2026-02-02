import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Admin, SystemSetting } from '@/lib/db/models';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check if registration is open
        let setting = await SystemSetting.findOne();

        // If no setting exists, create default (Open)
        if (!setting) {
            setting = await SystemSetting.create({ isAdminRegistrationOpen: true });
        }

        if (!setting.isAdminRegistrationOpen) {
            return NextResponse.json(
                { error: 'অ্যাডমিন নিবন্ধন বর্তমানে বন্ধ আছে' },
                { status: 403 }
            );
        }

        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'সকল তথ্য আবশ্যক' },
                { status: 400 }
            );
        }

        // Check uniqueness in Admin collection
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return NextResponse.json(
                { error: 'এই ইমেইল ইতিমধ্যে নিবন্ধিত' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await Admin.create({
            name,
            email,
            password: hashedPassword,
            provider: 'credentials',
        });

        return NextResponse.json({ message: 'অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে' });

    } catch (error) {
        console.error('Admin register error:', error);
        return NextResponse.json(
            { error: 'নিবন্ধন করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
