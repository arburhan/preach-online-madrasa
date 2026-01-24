import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import Course from '@/lib/db/models/Course';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function StudentCoursePage({ params }: PageProps) {
    const user = await requireAuth();
    const { slug } = await params;

    if (user.role !== 'student') {
        redirect('/unauthorized');
    }

    await connectDB();

    // Resolve slug to course ID
    let course = await Course.findOne({ slug }).select('_id').lean();

    if (!course) {
        // Fallback to ID lookup
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        if (isValidObjectId(slug)) {
            course = await Course.findById(slug).select('_id').lean();
        }
    }

    if (!course) {
        redirect('/student/browse');
    }

    const courseId = course._id.toString();

    // Get lessons for this course
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessons: any[] = await Lesson.find({ course: courseId })
        .sort({ order: 1 })
        .lean();

    if (lessons.length === 0) {
        redirect(`/student/browse/${slug}?error=no_content`);
    }

    // Import Progress model and find user's progress
    const Progress = (await import('@/lib/db/models/Progress')).default;

    const progresses = await Progress.find({
        user: user.id,
        course: courseId
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
    // Use slug in redirect URL
    redirect(`/student/watch/${slug}/${targetLessonId}`);
}
