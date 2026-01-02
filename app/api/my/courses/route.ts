import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import User from '@/lib/db/models/User';
import { requireAuth } from '@/lib/auth/rbac';

// GET /api/my/courses - Get user's enrolled courses or created courses
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'enrolled' or 'created'

        await connectDB();

        let courses;

        if (type === 'created' && ['teacher', 'admin'].includes(user.role)) {
            // Get courses created by the user
            courses = await Course.find({ instructor: user.id })
                .sort({ createdAt: -1 })
                .lean();
        } else {
            // Get enrolled courses
            const userData = await User.findById(user.id)
                .populate({
                    path: 'enrolledCourses',
                    populate: {
                        path: 'instructor',
                        select: 'name image',
                    },
                })
                .lean();

            courses = userData?.enrolledCourses || [];
        }

        return NextResponse.json({ courses });
    } catch (error) {
        console.error('Get my courses error:', error);
        return NextResponse.json(
            { error: 'কোর্স লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
