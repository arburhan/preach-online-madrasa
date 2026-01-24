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

        // Check if user is one of the instructors or admin
        const isAssigned = course.instructors?.some(
            (instructorId: any) => instructorId.toString() === user.id // eslint-disable-line
        );

        if (!isAssigned && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'আপনি এই কোর্সে পাঠ যোগ করার অনুমতি পাননি' },
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

        let { videoSource } = body;

        // If videoSource is missing, infer it
        if (!videoSource) {
            if (videoKey) {
                videoSource = 'r2';
            } else if (videoUrl && (videoUrl.includes('youtube') || videoUrl.includes('youtu.be'))) {
                videoSource = 'youtube';
            } else {
                // Default fallback if unable to determine
                videoSource = 'r2';
            }
        }

        const lesson = await Lesson.create({
            ...body,
            videoSource,
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

// GET /api/courses/[id]/lessons - Get all lessons for a course
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const lessons = await Lesson.find({ course: id })
            .sort({ order: 1 })
            .select('_id titleBn order duration isFree')
            .lean();

        return NextResponse.json({ lessons });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lessons' },
            { status: 500 }
        );
    }
}
