import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import Section from '@/lib/db/models/Section';
import { requireAuth } from '@/lib/auth/rbac';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterId: string; sectionId: string }> }
) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 });
        }

        const { semesterId, sectionId } = await params;
        const body = await request.json();

        await connectDB();

        // Validate Section exists
        const section = await Section.findById(sectionId);
        if (!section) {
            return NextResponse.json({ error: 'সেকশন পাওয়া যায়নি' }, { status: 404 });
        }

        // Get max order
        const lastLesson = await Lesson.findOne({ section: sectionId }).sort({ order: -1 });
        const newOrder = (lastLesson?.order || 0) + 1;

        // Create Lesson
        const lesson = await Lesson.create({
            section: sectionId,
            semester: semesterId, // Also link to semester for easier querying
            titleBn: body.titleBn,
            titleEn: body.titleEn,
            descriptionBn: body.descriptionBn,
            videoSource: body.videoSource || 'youtube',
            videoUrl: body.videoUrl,
            videoKey: body.videoKey, // Added for R2
            duration: body.duration || 0,
            order: newOrder,
            isFree: body.isFree || false,
            instructorGender: body.instructorGender, // Optional specific gender
            attachments: body.attachments || [], // Added attachments support
            resources: []
        });

        // Add lesson to section
        await Section.findByIdAndUpdate(sectionId, {
            $push: { lessons: lesson._id }
        });

        return NextResponse.json(lesson, { status: 201 });

    } catch (error) {
        console.error('Lesson creation error:', error);
        return NextResponse.json(
            { error: 'পাঠ তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
