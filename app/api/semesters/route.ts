import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Semester, { SemesterLevel } from '@/lib/db/models/Semester';
import { auth } from '@/lib/auth/auth.config';

// GET - Get all semesters
export async function GET() {
    try {
        await connectDB();

        const semesters = await Semester.find()
            .populate('subjects')
            .sort({ number: 1 })
            .lean();

        return NextResponse.json(semesters);
    } catch (error) {
        console.error('Get semesters error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create a new semester
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const { number, level, titleBn, titleEn, descriptionBn, descriptionEn, duration, status } = body;

        // Validation
        if (!number || !level || !titleBn || !descriptionBn) {
            return NextResponse.json(
                { error: 'সব আবশ্যক ফিল্ড পূরণ করুন' },
                { status: 400 }
            );
        }

        // Check if semester number already exists
        const existingSemester = await Semester.findOne({ number });
        if (existingSemester) {
            return NextResponse.json(
                { error: 'এই নম্বরের সেমিস্টার ইতিমধ্যে আছে' },
                { status: 400 }
            );
        }

        // Create semester
        const semester = await Semester.create({
            number,
            level: level as SemesterLevel,
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            duration: duration || 3,
            status: status || 'inactive',
        });

        return NextResponse.json(semester, { status: 201 });
    } catch (error) {
        console.error('Create semester error:', error);
        return NextResponse.json(
            { error: 'সেমিস্টার তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
