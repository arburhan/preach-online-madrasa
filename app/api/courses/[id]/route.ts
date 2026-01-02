import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import { getCurrentUser } from '@/lib/auth/rbac';

// GET /api/courses/[id] - Get course details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const course = await Course.findById(params.id)
            .populate('instructor', 'name image teacherBio teacherQualifications')
            .lean();

        if (!course) {
            return NextResponse.json(
                { error: 'কোর্স পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Get lessons for this course
        const lessons = await Lesson.find({ course: params.id })
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
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 401 }
            );
        }

        await connectDB();

        const course = await Course.findById(params.id);

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
                { error: 'আপনার এই কোর্স সম্পাদনার অনুমতি নেই' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const updatedCourse = await Course.findByIdAndUpdate(
            params.id,
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

// DELETE /api/courses/[id] - Delete course
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'অনুমোদন প্রয়োজন' },
                { status: 401 }
            );
        }

        await connectDB();

        const course = await Course.findById(params.id);

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
                { error: 'আপনার এই কোর্স মুছার অনুমতি নেই' },
                { status: 403 }
            );
        }

        // Delete all lessons associated with this course
        await Lesson.deleteMany({ course: params.id });

        // Delete the course
        await Course.findByIdAndDelete(params.id);

        return NextResponse.json({
            message: 'কোর্স মুছে ফেলা হয়েছে',
        });
    } catch (error) {
        console.error('Delete course error:', error);
        return NextResponse.json(
            { error: 'কোর্স মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
