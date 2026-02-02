import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Section from '@/lib/db/models/Section';
import { requireAuth } from '@/lib/auth/rbac';

// GET /api/admin/sections?courseId=xxx or ?subjectId=xxx
export async function GET(req: NextRequest) {
    try {
        await requireAuth();
        await connectDB();

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');
        const subjectId = searchParams.get('subjectId');

        const query: any = {};
        if (courseId) query.course = courseId;
        if (subjectId) query.subject = subjectId;

        const sections = await Section.find(query)
            .populate('lessons')
            .sort({ order: 1 })
            .lean();

        return NextResponse.json({ sections });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch sections' },
            { status: 500 }
        );
    }
}

// POST /api/admin/sections
export async function POST(req: NextRequest) {
    try {
        await requireAuth();
        await connectDB();

        const body = await req.json();
        const { titleBn, titleEn, courseId, subjectId, order } = body;

        if (!titleBn) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        if (!courseId && !subjectId) {
            return NextResponse.json(
                { error: 'Either courseId or subjectId is required' },
                { status: 400 }
            );
        }

        const section = await Section.create({
            titleBn,
            titleEn,
            course: courseId || undefined,
            subject: subjectId || undefined,
            order: order || 0,
            lessons: [],
        });

        return NextResponse.json({ section }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create section' },
            { status: 500 }
        );
    }
}
