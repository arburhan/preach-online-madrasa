import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import Course from '@/lib/db/models/Course';
import { getCurrentUser } from '@/lib/auth/rbac';

// POST /api/courses/[id]/lessons - Create new lesson
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || !['teacher', 'admin'].includes(user.role)) {
            return NextResponse.json(
                { error: 'অনুমতি নেই' },
                { status: 403 }
            );
        }

        const { id } = await params;
        await connectDB();

        const course = await Course.findById(id);

        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if user is the instructor or admin
        if (
            course.instructor.toString() !== user.id &&
            user.role !== 'admin'
        ) {
            return NextResponse.json(
                { error: 'আপনার এই কোর্সে পাঠ যোগ করার অনুমতি নেই' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            titleBn,
            videoUrl,
            videoKey,
        } = body;

        if (!titleBn || !videoUrl || !videoKey) {
            return NextResponse.json(
                { error: 'পাঠের শিরোনাম এবং ভিডিও আবশ্যক' },
                { status: 400 }
            );
        }

        const lesson = await Lesson.create({
            ...body,
            course: id,
        });

        // Update course total lessons count
        await Course.findByIdAndUpdate(id, {
            $inc: { totalLessons: 1 },
        });

        return NextResponse.json(
            {
                message: 'পাঠ তৈরি হয়েছে',
                lesson,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create lesson error:', error);
        return NextResponse.json(
            { error: 'পাঠ তৈরি করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
