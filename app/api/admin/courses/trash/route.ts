import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import { getCurrentUser } from '@/lib/auth/rbac';

// GET /api/admin/courses/trash - Get all trashed courses
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'অনুমতি নেই' },
                { status: 403 }
            );
        }

        await connectDB();

        const courses = await Course.find({ isDeleted: true })
            .sort({ deletedAt: -1 })
            .lean();

        // Calculate remaining days for each course
        const now = new Date();
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

        const trashedCourses = courses.map((course) => {
            const deletedAt = course.deletedAt ? new Date(course.deletedAt) : new Date();
            const expiresAt = new Date(deletedAt.getTime() + THIRTY_DAYS_MS);
            const remainingMs = expiresAt.getTime() - now.getTime();
            const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

            return {
                _id: course._id.toString(),
                titleBn: course.titleBn,
                titleEn: course.titleEn || '',
                thumbnail: course.thumbnail || '',
                status: course.status,
                deletedAt: course.deletedAt,
                remainingDays,
                expiresAt: expiresAt.toISOString(),
            };
        });

        return NextResponse.json({ courses: trashedCourses });
    } catch (error) {
        console.error('Get trashed courses error:', error);
        return NextResponse.json(
            { error: 'ট্র্যাশ লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
