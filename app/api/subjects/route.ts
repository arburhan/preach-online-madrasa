import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Subject, { SubjectType } from '@/lib/db/models/Subject';
import Semester from '@/lib/db/models/Semester';
import { auth } from '@/lib/auth/auth.config';

// GET - Get subjects (optionally filtered by semester)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const semesterId = searchParams.get('semesterId');

        const query = semesterId ? { semester: semesterId } : {};

        const subjects = await Subject.find(query)
            .populate('semester', 'number level titleBn')
            .populate('maleInstructors', 'name image gender')
            .populate('femaleInstructors', 'name image gender')
            .sort({ order: 1 })
            .lean();

        return NextResponse.json(subjects);
    } catch (error) {
        console.error('Get subjects error:', error);
        return NextResponse.json(
            { error: 'বিষয় লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// POST - Create a new subject
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
            type,
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            maleInstructors,
            femaleInstructors,
            thumbnail,
            order,
            liveClassLinks,
        } = body;

        // Validation
        if (!semester || !type || !titleBn || !descriptionBn) {
            return NextResponse.json(
                { error: 'সব আবশ্যক ফিল্ড পূরণ করুন' },
                { status: 400 }
            );
        }

        // Check if semester exists
        const semesterDoc = await Semester.findById(semester);
        if (!semesterDoc) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Create subject
        const subject = await Subject.create({
            semester,
            type: type as SubjectType,
            titleBn,
            titleEn,
            descriptionBn,
            descriptionEn,
            maleInstructors: maleInstructors || [],
            femaleInstructors: femaleInstructors || [],
            thumbnail,
            order: order || 0,
            liveClassLinks,
        });

        // Add subject to semester's subjects array
        await Semester.findByIdAndUpdate(semester, {
            $push: { subjects: subject._id }
        });

        return NextResponse.json(subject, { status: 201 });
    } catch (error) {
        console.error('Create subject error:', error);
        return NextResponse.json(
            { error: 'বিষয় তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
