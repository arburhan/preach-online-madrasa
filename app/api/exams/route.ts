import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Exam from '@/lib/db/models/Exam';
import { auth } from '@/lib/auth/auth.config';

// GET - Get all exams (admin) or published exams (student)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const semesterId = searchParams.get('semesterId');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (semesterId) {
            query.semester = semesterId;
        }

        // Students only see published exams
        if (session.user.role === 'student') {
            query.status = 'published';
        }

        const exams = await Exam.find(query)
            .populate('semester', 'number titleBn level')
            .populate('subject', 'titleBn')
            .populate('createdBy', 'name')
            .sort({ startTime: -1 })
            .lean();

        return NextResponse.json(exams);
    } catch (error) {
        console.error('Get exams error:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create a new exam (admin only)
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
        const {
            semester,
            subject,
            titleBn,
            titleEn,
            type,
            totalMarks,
            passMarks,
            duration,
            questions,
            startTime,
            endTime,
            status = 'draft',
        } = body;

        // Validation
        if (!semester || !titleBn || !type || !totalMarks || !passMarks || !duration || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'সব আবশ্যক ফিল্ড পূরণ করুন' },
                { status: 400 }
            );
        }

        const exam = await Exam.create({
            semester,
            subject: subject || undefined,
            titleBn,
            titleEn,
            type,
            totalMarks,
            passMarks,
            duration,
            questions: questions || [],
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status,
            createdBy: session.user.id,
        });

        return NextResponse.json(exam, { status: 201 });
    } catch (error) {
        console.error('Create exam error:', error);
        return NextResponse.json(
            { error: 'পরীক্ষা তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
