import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import { getCurrentUser } from '@/lib/auth/rbac';

// DELETE /api/admin/courses/[courseId]/permanent-delete - Permanently delete a trashed course
export async function DELETE(
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
                { error: 'শুধুমাত্র ট্র্যাশে থাকা কোর্স স্থায়ীভাবে মুছে ফেলা যায়' },
                { status: 400 }
            );
        }

        // Delete all associated lessons
        await Lesson.deleteMany({ course: courseId });

        // Delete all associated exams
        await Exam.deleteMany({ course: courseId });

        // Permanently delete the course
        await Course.findByIdAndDelete(courseId);

        return NextResponse.json({
            message: 'কোর্সটি স্থায়ীভাবে মুছে ফেলা হয়েছে',
        });
    } catch (error) {
        console.error('Permanent delete course error:', error);
        return NextResponse.json(
            { error: 'কোর্স মুছতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
