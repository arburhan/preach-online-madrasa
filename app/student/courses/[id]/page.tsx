import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function StudentCoursePage({ params }: PageProps) {
    const user = await requireAuth();
    const { id } = await params;

    if (user.role !== 'student') {
        redirect('/unauthorized');
    }

    await connectDB();

    // Get lessons for this course
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessons: any[] = await Lesson.find({ course: id })
        .sort({ order: 1 })
        .lean();

    if (lessons.length === 0) {
        redirect('/student');
    }

    // Import Progress model and find user's progress
    const Progress = (await import('@/lib/db/models/Progress')).default;

    const progresses = await Progress.find({
        user: user.id,
        course: id
    }).lean();

    // Determine target lesson based on progress
    let targetLessonId: string;

    if (progresses.length === 0) {
        // No progress - start from first lesson
        targetLessonId = lessons[0]._id.toString();
    } else {
        // Get completed lesson IDs
        const completedLessonIds = new Set(
            progresses
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((p: any) => p.isCompleted)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((p: any) => p.lesson.toString())
        );

        // Find first incomplete lesson
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const firstIncompleteLesson = lessons.find((lesson: any) =>
            !completedLessonIds.has(lesson._id.toString())
        );

        if (firstIncompleteLesson) {
            targetLessonId = firstIncompleteLesson._id.toString();
        } else {
            // All completed - go to last lesson
            targetLessonId = lessons[lessons.length - 1]._id.toString();
        }
    }

    // Auto-redirect to resume learning
    redirect(`/student/watch/${id}/${targetLessonId}`);
}
