import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import Section from '@/lib/db/models/Section';
import { requireAuth } from '@/lib/auth/rbac';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterId: string; sectionId: string; lessonId: string }> }
) {
    try {
        const user = await requireAuth();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 });
        }

        const { sectionId, lessonId } = await params;
        await connectDB();

        // 1. Delete the Lesson
        const lesson = await Lesson.findByIdAndDelete(lessonId);
        if (!lesson) {
            return NextResponse.json({ error: 'পাঠ পাওয়া যায়নি' }, { status: 404 });
        }

        // 2. Remove reference from Section
        await Section.findByIdAndUpdate(sectionId, {
            $pull: { lessons: lessonId }
        });

        return NextResponse.json({ message: 'পাঠ মুছে ফেলা হয়েছে' });

    } catch (error) {
        console.error('Lesson deletion error:', error);
        return NextResponse.json(
            { error: 'পাঠ মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
