import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Subject from '@/lib/db/models/Subject';
import Semester from '@/lib/db/models/Semester';
import { requireAuth } from '@/lib/auth/rbac';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterId: string }> }
) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 });
        }

        const { semesterId } = await params;
        const body = await request.json();

        await connectDB();

        // Validate Semester exists
        const semester = await Semester.findById(semesterId);
        if (!semester) {
            return NextResponse.json({ error: 'সেমিস্টার পাওয়া যায়নি' }, { status: 404 });
        }

        // Get max order to append to end
        const lastSubject = await Subject.findOne({ semester: semesterId }).sort({ order: -1 });
        const newOrder = (lastSubject?.order || 0) + 1;

        // Create Subject
        const subject = await Subject.create({
            semester: semesterId,
            type: body.type || 'islamic',
            titleBn: body.titleBn,
            titleEn: body.titleEn,
            descriptionBn: body.descriptionBn,
            // descriptionEn: body.descriptionEn, // Optional
            maleInstructors: body.maleInstructors || [],
            femaleInstructors: body.femaleInstructors || [],
            thumbnail: body.thumbnail,
            totalLessons: 0,
            order: newOrder,
            isActive: true,
            sections: [], // Initialize empty sections
            contentBn: body.contentBn // Lexical JSON
        });

        // Add subject to semester's subjects array
        await Semester.findByIdAndUpdate(semesterId, {
            $push: { subjects: subject._id }
        });

        return NextResponse.json(subject, { status: 201 });

    } catch (error) {
        console.error('Subject creation error:', error);
        return NextResponse.json(
            { error: 'বিষয় তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
