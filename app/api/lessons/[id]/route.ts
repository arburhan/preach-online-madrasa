import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import Course, { ICourse } from '@/lib/db/models/Course';
import { getCurrentUser } from '@/lib/auth/rbac';

// GET /api/lessons/[id] - Get lesson details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectDB();

        const lesson = await Lesson.findById(id)
            .populate('course', 'titleBn titleEn instructors')
            .lean();

        if (!lesson) {
            return NextResponse.json(
                { error: 'পাঠ পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if user has access to this lesson
        // For now, we'll allow authenticated users to view
        // In production, you'd check enrollment status

        return NextResponse.json({ lesson });
    } catch (error) {
        console.error('Get lesson error:', error);
        return NextResponse.json(
            { error: 'পাঠ লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT /api/lessons/[id] - Update lesson
export async function PUT(
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

        const lesson = await Lesson.findById(id).populate('course');

        if (!lesson) {
            return NextResponse.json(
                { error: 'পাঠ পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if user is the course instructor or admin
        const course = lesson.course as unknown as ICourse;
        const isInstructor = course.instructors && course.instructors.some(
            (inst) => inst.toString() === user.id
        );

        if (!isInstructor && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'আপনার এই পাঠ সম্পাদনার অনুমতি নেই' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const updatedLesson = await Lesson.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            message: 'পাঠ আপডেট হয়েছে',
            lesson: updatedLesson,
        });
    } catch (error) {
        console.error('Update lesson error:', error);
        return NextResponse.json(
            { error: 'পাঠ আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE /api/lessons/[id] - Delete lesson
export async function DELETE(
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

        const lesson = await Lesson.findById(id).populate('course');

        if (!lesson) {
            return NextResponse.json(
                { error: 'পাঠ পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if user is the course instructor or admin
        const course = lesson.course as unknown as ICourse;
        const isInstructor = course.instructors && course.instructors.some(
            (inst) => inst.toString() === user.id
        );

        if (!isInstructor && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'আপনার এই পাঠ মুছার অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Delete the lesson
        await Lesson.findByIdAndDelete(id);

        // Update course total lessons count
        await Course.findByIdAndUpdate(lesson.course, {
            $inc: { totalLessons: -1 },
        });

        return NextResponse.json({
            message: 'পাঠ মুছে ফেলা হয়েছে',
        });
    } catch (error) {
        console.error('Delete lesson error:', error);
        return NextResponse.json(
            { error: 'পাঠ মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
