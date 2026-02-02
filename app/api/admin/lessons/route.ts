import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import Section from '@/lib/db/models/Section';
import { requireAuth } from '@/lib/auth/rbac';

// POST /api/admin/lessons
export async function POST(req: NextRequest) {
    try {
        await requireAuth();
        await connectDB();

        const body = await req.json();
        const {
            sectionId,
            titleBn,
            titleEn,
            descriptionBn,
            videoSource,
            videoUrl,
            videoKey,
            duration,
            order,
        } = body;

        if (!sectionId || !titleBn || !videoSource || !videoUrl) {
            return NextResponse.json(
                { error: 'Required fields missing' },
                { status: 400 }
            );
        }

        // Create lesson
        const lesson = await Lesson.create({
            section: sectionId,
            titleBn,
            titleEn,
            descriptionBn,
            videoSource,
            videoUrl,
            videoKey,
            duration: duration || 0,
            order: order || 0,
            resources: [],
            attachments: [],
        });

        // Add lesson to section
        await Section.findByIdAndUpdate(sectionId, {
            $push: { lessons: lesson._id },
        });

        return NextResponse.json({ lesson }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create lesson' },
            { status: 500 }
        );
    }
}
