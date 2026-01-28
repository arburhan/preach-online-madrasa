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
        const courseId = searchParams.get('courseId');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (semesterId) {
            query.semester = semesterId;
        }

        if (courseId) {
            query.course = courseId;
        }

        // Students only see published exams
        if (session.user.role === 'student') {
            query.status = 'published';
        }

        const exams = await Exam.find(query)
            .populate('course', 'titleBn slug')
            .populate('semester', 'number titleBn level')
            .populate('subject', 'titleBn')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
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

// POST - Create a new exam (admin/teacher)
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || !['admin', 'teacher'].includes(session.user.role)) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const {
            course,
            semester,
            subject,
            titleBn,
            titleEn,
            type,
            totalMarks,
            passMarks,
            duration,
            questions,
            hasTiming = false,
            startTime,
            endTime,
            status = 'draft',
        } = body;

        // Determine examFor based on provided data
        let examFor: 'course' | 'semester' | 'subject';
        if (course) {
            examFor = 'course';
        } else if (subject) {
            examFor = 'subject';
        } else if (semester) {
            examFor = 'semester';
        } else {
            return NextResponse.json(
                { error: 'কোর্স বা সেমিস্টার নির্বাচন করুন' },
                { status: 400 }
            );
        }

        // Validation
        if (!titleBn || !type || !totalMarks || !passMarks || !duration) {
            return NextResponse.json(
                { error: 'সব আবশ্যক ফিল্ড পূরণ করুন' },
                { status: 400 }
            );
        }

        // If timing is enabled, validate start/end times
        if (hasTiming && (!startTime || !endTime)) {
            return NextResponse.json(
                { error: 'সময়সীমা সক্রিয় থাকলে শুরু ও শেষের সময় দিতে হবে' },
                { status: 400 }
            );
        }

        const exam = await Exam.create({
            examFor,
            course: course || undefined,
            semester: semester || undefined,
            subject: subject || undefined,
            titleBn,
            titleEn,
            type,
            totalMarks,
            passMarks,
            duration,
            questions: questions || [],
            hasTiming,
            startTime: hasTiming && startTime ? new Date(startTime) : undefined,
            endTime: hasTiming && endTime ? new Date(endTime) : undefined,
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

