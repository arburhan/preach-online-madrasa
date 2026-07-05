import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import { getCurrentUser } from '@/lib/auth/rbac';

// PATCH /api/admin/courses/[courseId]/restore - Restore a trashed course
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'admin') {
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

        if (!course.isDeleted) {
            return NextResponse.json(
                { error: 'কোর্সটি ট্র্যাশে নেই' },
                { status: 400 }
            );
        }

        // Restore the course
        await Course.findByIdAndUpdate(courseId, {
            isDeleted: false,
            $unset: { deletedAt: 1, deletedBy: 1 },
        });

        return NextResponse.json({
            message: 'কোর্সটি সফলভাবে পুনরুদ্ধার করা হয়েছে',
        });
    } catch (error) {
        console.error('Restore course error:', error);
        return NextResponse.json(
            { error: 'কোর্স পুনরুদ্ধার করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
