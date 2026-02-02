import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Progress from '@/lib/db/models/Progress';

// POST /api/progress/update - Update progress for a lesson
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { lessonId, courseId, progress, currentTime, duration } = body;

        if (!lessonId || !courseId) {
            return NextResponse.json(
                { error: 'lessonId এবং courseId প্রয়োজন' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find or create progress record
        let progressRecord = await Progress.findOne({
            user: user.id,
            lesson: lessonId,
            course: courseId
        });

        if (progressRecord) {
            // Update existing
            progressRecord.lastWatchedPosition = currentTime || 0;
            progressRecord.watchedDuration = currentTime || 0;
            progressRecord.totalDuration = duration || 0;
            progressRecord.progressPercentage = Math.min(progress || 0, 100);
            await progressRecord.save();
        } else {
            // Create new
            progressRecord = await Progress.create({
                user: user.id,
                lesson: lessonId,
                course: courseId,
                lastWatchedPosition: currentTime || 0,
                watchedDuration: currentTime || 0,
                totalDuration: duration || 0,
                progressPercentage: Math.min(progress || 0, 100),
                isCompleted: false
            });
        }

        return NextResponse.json({
            message: 'Progress saved',
            progress: progressRecord
        });
    } catch (error) {
        console.error('Update progress error:', error);
        return NextResponse.json(
            { error: 'Progress সংরক্ষণ করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
