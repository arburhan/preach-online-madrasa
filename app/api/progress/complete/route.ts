import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Progress from '@/lib/db/models/Progress';

// POST /api/progress/complete - Mark a lesson as completed
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { lessonId, courseId } = body;

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

        if (progressRecord && !progressRecord.isCompleted) {
            progressRecord.isCompleted = true;
            progressRecord.completedAt = new Date();
            progressRecord.progressPercentage = 100;
            await progressRecord.save();
        } else if (!progressRecord) {
            // Create as completed
            progressRecord = await Progress.create({
                user: user.id,
                lesson: lessonId,
                course: courseId,
                isCompleted: true,
                completedAt: new Date(),
                progressPercentage: 100,
                watchedDuration: 0,
                totalDuration: 0,
                lastWatchedPosition: 0
            });
        }

        return NextResponse.json({
            message: 'Lesson marked as complete',
            progress: progressRecord
        });
    } catch (error) {
        console.error('Complete lesson error:', error);
        return NextResponse.json(
            { error: 'Lesson complete করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
