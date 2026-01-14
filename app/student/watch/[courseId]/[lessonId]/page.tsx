import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { LessonPlaylist } from '@/components/video/LessonPlaylist';


import { BookOpen, Clock, FileText } from 'lucide-react';
import NoteEditor from '@/components/notes/NoteEditor';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        courseId: string;
        lessonId: string;
    }>;
}

export default async function WatchLessonPage({ params }: PageProps) {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    const { courseId, lessonId } = await params;

    await connectDB();

    // Check if user is enrolled or lesson is free
    const user = await User.findById(session.user.id)
        .select('enrolledCourses role')
        .lean();

    const course = await Course.findById(courseId)
        .populate('instructors', 'name')
        .lean();

    if (!course) {
        redirect('/student/browse');
    }

    // Check access
    // Support both old format (ObjectId) and new format ({course, lastWatchedLesson, enrolledAt})
    const isEnrolled = user?.enrolledCourses?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => {
            // Old format: e is just an ObjectId
            if (e?.toString && typeof e.toString === 'function' && !e.course) {
                return e.toString() === courseId;
            }
            // New format: e is an object with course property
            return e?.course?.toString() === courseId;
        }
    ) || false;
    const isInstructor = Array.isArray(course.instructors)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? course.instructors.some((inst: any) => inst._id?.toString() === session.user.id)
        : false;
    const isAdmin = session.user.role === 'admin';

    if (!isEnrolled && !isInstructor && !isAdmin) {
        redirect(`/student/browse/${courseId}`);
    }

    // Get current lesson
    const lesson = await Lesson.findById(lessonId).lean();

    if (!lesson || lesson.course.toString() !== courseId) {
        redirect(`/student/browse/${courseId}`);
    }

    // Get all lessons for playlist
    const allLessons = await Lesson.find({ course: courseId })
        .sort({ order: 1 })
        .select('_id titleBn duration order isFree')
        .lean();

    // Get user's progress for all lessons in this course
    const Progress = (await import('@/lib/db/models/Progress')).default;
    const progresses = await Progress.find({
        user: session.user.id,
        course: courseId
    }).lean();

    // Get completed lesson IDs
    const completedLessonIds = new Set(
        progresses
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((p: any) => p.isCompleted)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => p.lesson.toString())
    );

    // Serialize lessons for client component with completion status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedLessons = allLessons.map((lesson: any) => ({
        _id: lesson._id.toString(),
        titleBn: lesson.titleBn,
        duration: lesson.duration || 0,
        order: lesson.order,
        isFree: lesson.isFree || false,
        isCompleted: completedLessonIds.has(lesson._id.toString()),
    }));

    // Get current lesson index
    const currentLessonIndex = serializedLessons.findIndex(l => l._id === lessonId);

    // Calculate previous and next lesson IDs
    const previousLessonId = currentLessonIndex > 0
        ? serializedLessons[currentLessonIndex - 1]._id
        : null;

    const nextLessonId = currentLessonIndex < serializedLessons.length - 1
        ? serializedLessons[currentLessonIndex + 1]._id
        : null;

    // Track this lesson as last watched (don't await to avoid blocking page load)
    fetch('/api/progress/lastWatchedLesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            courseId,
            lessonId,
        }),
    }).catch(error => {
        console.error('Failed to update last watched lesson:', error);
    });

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                {/* Back to Course Button */}
                <Link
                    href={`/student/browse/${courseId}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    ← কোর্সে ফিরে যান
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Video Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        <div className="bg-black rounded-xl overflow-hidden">
                            <VideoPlayer
                                lessonId={lessonId}
                                courseId={courseId}
                                videoUrl={lesson.videoUrl || ''}
                                previousLessonId={previousLessonId}
                                nextLessonId={nextLessonId}
                            />
                        </div>

                        {/* Lesson Info */}
                        <div className="bg-card rounded-xl border p-6">
                            <h1 className="text-2xl font-bold mb-2">{lesson.titleBn}</h1>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                {lesson.duration && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{Math.floor(lesson.duration / 60)} মিনিট</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{course.titleBn}</span>
                                </div>
                            </div>

                            {lesson.descriptionBn && (
                                <div>
                                    <h3 className="font-semibold mb-2">বিবরণ</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {lesson.descriptionBn}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div className="bg-card rounded-xl border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5" />
                                <h3 className="font-semibold">নোট</h3>
                            </div>
                            <NoteEditor lessonId={lessonId} courseId={courseId} />
                        </div>
                    </div>

                    {/* Playlist Sidebar */}
                    <div className="lg:col-span-1">
                        <LessonPlaylist
                            courseId={courseId}
                            currentLessonId={lessonId}
                            lessons={serializedLessons}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
