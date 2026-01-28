import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { auth } from '@/lib/auth/auth.config';
import Course from '@/lib/db/models/Course';

// PATCH /api/courses/[courseId]/complete - Mark course as completed
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || !['teacher', 'admin'].includes(session.user.role)) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { courseId } = await params;
        await connectDB();

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check instructor access
        const isInstructor = course.instructors?.some(
            (id: any) => id.toString() === session.user.id // eslint-disable-line @typescript-eslint/no-explicit-any
        );
        if (!isInstructor && session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Toggle completion status
        course.isCompleted = !course.isCompleted;
        course.completedAt = course.isCompleted ? new Date() : undefined;
        await course.save();

        return NextResponse.json({
            success: true,
            isCompleted: course.isCompleted,
            message: course.isCompleted
                ? 'কোর্স সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে'
                : 'কোর্স সম্পন্ন চিহ্ন সরানো হয়েছে',
        });
    } catch (error) {
        console.error('Course completion error:', error);
        return NextResponse.json(
            { error: 'কোর্স আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
