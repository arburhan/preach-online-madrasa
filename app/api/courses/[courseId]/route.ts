import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import { getCurrentUser } from '@/lib/auth/rbac';

// GET /api/courses/[id] - Get course details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;
        await connectDB();

        const course = await Course.findById(courseId)
            .populate('instructors', 'name image bio qualifications')
            .lean();

        if (!course || course.isDeleted) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Get lessons for this course
        const lessons = await Lesson.find({ course: courseId })
            .sort({ order: 1 })
            .select('-videoKey') // Don't send video key to client
            .lean();

        return NextResponse.json({
            course,
            lessons,
        });
    } catch (error) {
        console.error('Get course error:', error);
        return NextResponse.json(
            { error: 'কোর্স লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// PUT /api/courses/[id] - Update course
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || !['teacher', 'admin'].includes(user.role)) {
            return NextResponse.json(
                { error: 'অনুমতি নেই' },
                { status: 403 }
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

        // Check if user is one of the instructors or admin
        // instructors may be raw ObjectIds or populated objects
        const isInstructor = Array.isArray(course.instructors)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? course.instructors.some((inst: any) =>
                (inst._id?.toString() === user.id) || (inst.toString() === user.id)
            )
            : false;

        if (!isInstructor && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'আপনার এই কোর্স সম্পাদনার অনুমতি নেই' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: body },
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            message: 'কোর্স আপডেট হয়েছে',
            course: updatedCourse,
        });
    } catch (error) {
        console.error('Update course error:', error);
        return NextResponse.json(
            { error: 'কোর্স আপডেট করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// DELETE /api/courses/[id] - Soft delete course (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'শুধুমাত্র অ্যাডমিন কোর্স মুছে ফেলতে পারবে' },
                { status: 403 }
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

        if (course.isDeleted) {
            return NextResponse.json(
                { error: 'কোর্সটি ইতিমধ্যে মুছে ফেলা হয়েছে' },
                { status: 400 }
            );
        }

        // Soft delete - move to trash
        await Course.findByIdAndUpdate(courseId, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: user.id,
        });

        return NextResponse.json({
            message: 'কোর্সটি ট্র্যাশে সরানো হয়েছে। ৩০ দিনের মধ্যে পুনরুদ্ধার করতে পারবেন।',
        });
    } catch (error) {
        console.error('Delete course error:', error);
        return NextResponse.json(
            { error: 'কোর্স মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
