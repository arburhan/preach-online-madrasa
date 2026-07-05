import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import { getCurrentUser } from '@/lib/auth/rbac';

// POST /api/admin/courses/cleanup - Cleanup courses older than 30 days in trash
export async function POST() {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অনুমতি নেই' },
                { status: 403 }
            );
        }

        await connectDB();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find all expired trashed courses
        const expiredCourses = await Course.find({
            isDeleted: true,
            deletedAt: { $lte: thirtyDaysAgo },
        }).lean();

        if (expiredCourses.length === 0) {
            return NextResponse.json({
                message: 'মুছে ফেলার মতো কোনো মেয়াদোত্তীর্ণ কোর্স নেই',
                deletedCount: 0,
            });
        }

        const courseIds = expiredCourses.map((c) => c._id);

        // Delete all associated lessons
        await Lesson.deleteMany({ course: { $in: courseIds } });

        // Delete all associated exams
        await Exam.deleteMany({ course: { $in: courseIds } });

        // Permanently delete the courses
        const result = await Course.deleteMany({ _id: { $in: courseIds } });

        return NextResponse.json({
            message: `${result.deletedCount} টি মেয়াদোত্তীর্ণ কোর্স স্থায়ীভাবে মুছে ফেলা হয়েছে`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Cleanup courses error:', error);
        return NextResponse.json(
            { error: 'ক্লিনআপ করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
