import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course, { CourseStatus } from '@/lib/db/models/Course';
import { getCurrentUser } from '@/lib/auth/rbac';

// POST /api/courses/[id]/publish - Publish a course
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
        const isInstructor = Array.isArray(course.instructors)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? course.instructors.some((inst: any) => inst.toString() === user.id)
            : false;

        if (!isInstructor && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'আপনার এই কোর্স প্রকাশের অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Validate course has content
        if (course.totalLessons === 0) {
            return NextResponse.json(
                { error: 'কোর্সে কমপক্ষে একটি পাঠ থাকতে হবে' },
                { status: 400 }
            );
        }

        // Publish the course
        course.status = CourseStatus.PUBLISHED;
        course.publishedAt = new Date();
        await course.save();

        return NextResponse.json({
            message: 'কোর্স প্রকাশিত হয়েছে',
            course,
        });
    } catch (error) {
        console.error('Publish course error:', error);
        return NextResponse.json(
            { error: 'কোর্স প্রকাশ করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE /api/courses/[id]/publish - Unpublish a course
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

        const course = await Course.findById(id);

        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if user is the instructor or admin
        const isInstructor = Array.isArray(course.instructors)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? course.instructors.some((inst: any) => inst.toString() === user.id)
            : false;

        if (!isInstructor && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'আপনার এই কোর্স অপ্রকাশের অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Unpublish the course
        course.status = CourseStatus.DRAFT;
        await course.save();

        return NextResponse.json({
            message: 'কোর্স অপ্রকাশিত হয়েছে',
            course,
        });
    } catch (error) {
        console.error('Unpublish course error:', error);
        return NextResponse.json(
            { error: 'কোর্স অপ্রকাশ করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
