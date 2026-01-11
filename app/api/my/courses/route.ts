import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import User from '@/lib/db/models/User';
import Progress from '@/lib/db/models/Progress';
import { requireAuth } from '@/lib/auth/rbac';

interface PopulatedCourse {
    _id: { toString: () => string };
    totalLessons?: number;
    [key: string]: unknown;
}

interface ProgressDoc {
    isCompleted: boolean;
    lastWatchedPosition?: number;
    [key: string]: unknown;
}

interface LastProgressDoc {
    lesson?: {
        _id?: { toString: () => string };
        title?: string;
    };
    lastWatchedPosition?: number;
}

// GET /api/my/courses - Get user's enrolled courses or created courses
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'enrolled' or 'created'
        const includeProgress = searchParams.get('progress') === 'true';

        await connectDB();

        let courses;

        if (type === 'created' && ['teacher', 'admin'].includes(user.role)) {
            // Get courses created by the user
            courses = await Course.find({ instructor: user.id })
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json({ courses });
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

            // Add progress data if requested
            if (includeProgress) {
                const coursesWithProgress = await Promise.all(
                    (courses as unknown as PopulatedCourse[]).map(async (course: PopulatedCourse) => {
                        const courseId = course._id.toString();

                        // Get all progress records for this course
                        const progressRecords = await Progress.find({
                            user: user.id,
                            course: courseId
                        }).lean();

                        const completedLessons = (progressRecords as unknown as ProgressDoc[]).filter(
                            (p: ProgressDoc) => p.isCompleted
                        ).length;

                        const totalLessons = course.totalLessons || 0;
                        const percentage = totalLessons > 0
                            ? Math.round((completedLessons / totalLessons) * 100)
                            : 0;

                        // Find last watched lesson
                        const lastProgressResult = await Progress.findOne({
                            user: user.id,
                            course: courseId
                        })
                            .sort({ updatedAt: -1 })
                            .populate('lesson', 'title')
                            .lean();

                        const lastProgress = lastProgressResult as unknown as LastProgressDoc | null;

                        return {
                            course,
                            progress: {
                                completedLessons,
                                totalLessons,
                                percentage,
                                lastWatchedLesson: lastProgress
                                    ? {
                                        lessonId: lastProgress.lesson?._id?.toString(),
                                        title: lastProgress.lesson?.title || 'Unknown',
                                        lastPosition: lastProgress.lastWatchedPosition || 0
                                    }
                                    : null
                            }
                        };
                    })
                );

                return NextResponse.json({ courses: coursesWithProgress });
            }

            return NextResponse.json({ courses });
        }
    } catch (error) {
        console.error('Get my courses error:', error);
        return NextResponse.json(
            { error: 'কোর্স লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
