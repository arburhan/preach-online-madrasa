import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import Progress from '@/lib/db/models/Progress';
import ExamResult from '@/lib/db/models/ExamResult';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        courseId: string;
    }>;
}

// This page auto-redirects to the last watched content or first content
export default async function WatchCourseResumeEntry({ params }: PageProps) {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    const { courseId: paramCourseId } = await params;

    await connectDB();

    // Check if user is enrolled
    const user = await Student.findById(session.user.id)
        .select('enrolledCourses')
        .lean();

    // Try to find course by ID or Slug
    let course = null;
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId(paramCourseId)) {
        course = await Course.findById(paramCourseId).lean();
    }

    if (!course) {
        course = await Course.findOne({ slug: paramCourseId }).lean();
    }

    if (!course) {
        redirect('/student/browse');
    }

    const courseId = course._id.toString();

    // Find user's enrollment for this course
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollment = user?.enrolledCourses?.find((e: any) => {
        if (e?.toString && typeof e.toString === 'function' && !e.course) {
            return e.toString() === courseId;
        }
        return e?.course?.toString() === courseId;
    });

    // Check for last watched content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastWatchedId = (enrollment as any)?.lastWatchedLesson?.toString();

    // Check if all content is completed - redirect to certificate
    const lessons = await Lesson.find({ course: course._id }).select('_id').lean();
    const exams = await Exam.find({ course: course._id }).select('_id').lean();

    const lessonIds = lessons.map(l => l._id.toString());
    const examIds = exams.map(e => e._id.toString());

    // Check completion status
    const completedProgress = await Progress.find({
        user: session.user.id,
        lesson: { $in: lessonIds },
        isCompleted: true
    }).lean();

    // Exam pass check - percentage >= 40 means passed (D grade or above)
    const passedExams = await ExamResult.find({
        student: session.user.id,
        exam: { $in: examIds },
        percentage: { $gte: 40 },
        isLatest: true
    }).lean();

    const allLessonsCompleted = lessonIds.length > 0 && completedProgress.length >= lessonIds.length;
    const allExamsPassed = examIds.length === 0 || passedExams.length >= examIds.length;

    if (allLessonsCompleted && allExamsPassed) {
        // All content done, redirect to certificate
        redirect(`/student/watch/${paramCourseId}/certificate-${courseId}`);
    }

    if (lastWatchedId) {
        // Validate the lastWatched content still exists
        const lesson = await Lesson.findById(lastWatchedId).lean();
        if (lesson && lesson.course?.toString() === courseId) {
            redirect(`/student/watch/${paramCourseId}/${lastWatchedId}`);
        }

        const exam = await Exam.findById(lastWatchedId).lean();
        if (exam && exam.course?.toString() === courseId) {
            redirect(`/student/watch/${paramCourseId}/${lastWatchedId}`);
        }
    }

    // No last watched or invalid - redirect to first content
    // First try lessons
    const firstLesson = await Lesson.findOne({ course: course._id })
        .sort({ order: 1 })
        .lean();

    if (firstLesson) {
        redirect(`/student/watch/${paramCourseId}/${firstLesson._id.toString()}`);
    }

    // Then try exams
    const firstExam = await Exam.findOne({ course: course._id })
        .sort({ order: 1 })
        .lean();

    if (firstExam) {
        redirect(`/student/watch/${paramCourseId}/${firstExam._id.toString()}`);
    }

    // No content found - redirect to browse
    redirect(`/student/browse/${paramCourseId}`);
}
