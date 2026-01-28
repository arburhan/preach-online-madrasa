import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId } = await request.json();

        if (!courseId || !lessonId) {
            return NextResponse.json(
                { error: 'courseId and lessonId are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Update the user's last watched lesson for this course
        await Student.findByIdAndUpdate(
            session.user.id,
            {
                $set: {
                    'enrolledCourses.$[elem].lastWatchedLesson': lessonId,
                },
            },
            {
                arrayFilters: [{ 'elem.course': new mongoose.Types.ObjectId(courseId) }],
                new: true,
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating last watched lesson:', error);
        return NextResponse.json(
            { error: 'Failed to update last watched lesson' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json(
                { error: 'courseId is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await Student.findById(session.user.id)
            .select('enrolledCourses')
            .lean();

        if (!user || !user.enrolledCourses) {
            return NextResponse.json(
                { lastWatchedLessonId: null },
                { status: 200 }
            );
        }

        // Find the enrollment for this course
        const enrollment = user.enrolledCourses.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (e: any) => e.course.toString() === courseId
        );

        return NextResponse.json({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lastWatchedLessonId: (enrollment as any)?.lastWatchedLesson?.toString() || null,
        });
    } catch (error) {
        console.error('Error fetching last watched lesson:', error);
        return NextResponse.json(
            { error: 'Failed to fetch last watched lesson' },
            { status: 500 }
        );
    }
}
