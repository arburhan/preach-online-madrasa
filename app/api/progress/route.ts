import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Progress from '@/lib/db/models/Progress';
import { requireAuth } from '@/lib/auth/rbac';

// POST /api/progress - Update or create progress
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { lessonId, courseId, watchedDuration, totalDuration, lastWatchedPosition } = body;

        if (!lessonId || !courseId) {
            return NextResponse.json(
                { error: 'পাঠ এবং কোর্স ID আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find existing progress or create new
        let progress = await Progress.findOne({
            user: user.id,
            lesson: lessonId,
        });

        if (progress) {
            // Update existing progress
            progress.watchedDuration = watchedDuration || progress.watchedDuration;
            progress.totalDuration = totalDuration || progress.totalDuration;
            progress.lastWatchedPosition = lastWatchedPosition !== undefined
                ? lastWatchedPosition
                : progress.lastWatchedPosition;
            await progress.save(); // This will trigger pre-save hook for percentage calc
        } else {
            // Create new progress
            progress = await Progress.create({
                user: user.id,
                lesson: lessonId,
                course: courseId,
                watchedDuration: watchedDuration || 0,
                totalDuration: totalDuration || 0,
                lastWatchedPosition: lastWatchedPosition || 0,
            });
        }

        return NextResponse.json({
            message: 'অগ্রগতি সংরক্ষণ করা হয়েছে',
            progress,
        });
    } catch (error) {
        console.error('Update progress error:', error);
        return NextResponse.json(
            { error: 'অগ্রগতি সংরক্ষণ করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}

// GET /api/progress?courseId=xxx - Get user's progress for a course
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json(
                { error: 'কোর্স ID আবশ্যক' },
                { status: 400 }
            );
        }

        await connectDB();

        const progressList = await Progress.find({
            user: user.id,
            course: courseId,
        })
            .populate('lesson', 'titleBn titleEn order')
            .sort({ 'lesson.order': 1 })
            .lean();

        // Calculate overall course progress
        const totalLessons = progressList.length;
        const completedLessons = progressList.filter(p => p.isCompleted).length;
        const overallProgress = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return NextResponse.json({
            progress: progressList,
            stats: {
                totalLessons,
                completedLessons,
                overallProgress,
            },
        });
    } catch (error) {
        console.error('Get progress error:', error);
        return NextResponse.json(
            { error: 'অগ্রগতি লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
