import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Section from '@/lib/db/models/Section';
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

        // Get max order
        const lastSection = await Section.findOne({ semester: semesterId }).sort({ order: -1 });
        const newOrder = (lastSection?.order || 0) + 1;

        // Create Section
        const section = await Section.create({
            semester: semesterId,
            titleBn: body.titleBn,
            titleEn: body.titleEn,
            order: newOrder,
            lessons: []
        });

        // Add section to semester
        await Semester.findByIdAndUpdate(semesterId, {
            $push: { sections: section._id }
        });

        return NextResponse.json(section, { status: 201 });

    } catch (error) {
        console.error('Section creation error:', error);
        return NextResponse.json(
            { error: 'সেকশন তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
