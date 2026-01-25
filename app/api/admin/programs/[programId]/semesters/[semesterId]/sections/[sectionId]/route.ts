import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Section from '@/lib/db/models/Section';
import Semester from '@/lib/db/models/Semester';
import Lesson from '@/lib/db/models/Lesson';
import { requireAuth } from '@/lib/auth/rbac';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterId: string; sectionId: string }> }
) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 });
        }

        const { semesterId, sectionId } = await params;
        await connectDB();

        // 1. Delete the Section
        const section = await Section.findByIdAndDelete(sectionId);
        if (!section) {
            return NextResponse.json({ error: 'সেকশন পাওয়া যায়নি' }, { status: 404 });
        }

        // 2. Delete all lessons in this section
        await Lesson.deleteMany({ section: sectionId });

        // 3. Remove reference from Semester
        await Semester.findByIdAndUpdate(semesterId, {
            $pull: { sections: sectionId }
        });

        return NextResponse.json({ message: 'সেকশন মুছে ফেলা হয়েছে' });

    } catch (error) {
        console.error('Section deletion error:', error);
        return NextResponse.json(
            { error: 'সেকশন মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
