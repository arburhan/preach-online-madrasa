import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import WatchPageClient from '@/components/watch/WatchPageClient';
import mongoose from 'mongoose';

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

    const { courseId: paramCourseId, lessonId } = await params;

    await connectDB();

    // Check if user is enrolled (Fetch user data)
    const user = await Student.findById(session.user.id)
        .select('enrolledCourses role')
        .lean();

    // Try to find course by ID or Slug
    let course = null;
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId(paramCourseId)) {
        course = await Course.findById(paramCourseId)
            .populate('instructors', 'name')
            .lean();
    }

    if (!course) {
        course = await Course.findOne({ slug: paramCourseId })
            .populate('instructors', 'name')
            .lean();
    }

    if (!course) {
        redirect('/student/browse');
    }

    const courseId = course._id.toString();

    // Check access
    const isEnrolled = user?.enrolledCourses?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => {
            if (e?.toString && typeof e.toString === 'function' && !e.course) {
                return e.toString() === courseId;
            }
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

    // If it's a certificate view, render client directly
    // Note: We don't update lastWatchedLesson for certificate since it's not a valid ObjectId
    // Resume logic should handle completed courses by checking if all content is done
    if (lessonId.startsWith('certificate-')) {
        return (
            <WatchPageClient
                courseId={courseId}
                contentId={lessonId}
                courseTitle={course.titleBn}
            />
        );
    }

    // Get current lesson or exam - try lesson first
    let lesson = null;
    if (isValidObjectId(lessonId)) {
        lesson = await Lesson.findById(lessonId).lean();
    }

    if (!lesson || lesson.course?.toString() !== courseId) {
        // Not a lesson, check if it's an exam
        const Exam = (await import('@/lib/db/models/Exam')).default;
        const exam = isValidObjectId(lessonId) ? await Exam.findById(lessonId).lean() : null;

        if (exam && exam.course?.toString() === courseId) {
            // Track this exam as last watched content
            if (session?.user?.id && isEnrolled) {
                try {
                    await Student.findByIdAndUpdate(
                        session.user.id,
                        {
                            $set: {
                                'enrolledCourses.$[elem].lastWatchedLesson': lessonId,
                                'enrolledCourses.$[elem].lastWatchedAt': new Date(),
                            },
                        },
                        {
                            arrayFilters: [{ 'elem.course': new mongoose.Types.ObjectId(courseId) }],
                        }
                    );
                } catch (err) {
                    console.error('Failed to update last watched exam:', err);
                }
            }

            // This is an exam, let WatchPageClient handle it
            return (
                <WatchPageClient
                    courseId={courseId}
                    contentId={lessonId}
                    courseTitle={course.titleBn}
                />
            );
        }

        // Neither lesson nor exam found
        redirect(`/student/browse/${courseId}`);
    }

    // Track this lesson/exam as last watched content
    if (session?.user?.id && isEnrolled) {
        try {
            await Student.findByIdAndUpdate(
                session.user.id,
                {
                    $set: {
                        // Track the current content (lesson or exam) as last watched
                        'enrolledCourses.$[elem].lastWatchedLesson': lessonId,
                        'enrolledCourses.$[elem].lastWatchedAt': new Date(),
                    },
                },
                {
                    arrayFilters: [{ 'elem.course': new mongoose.Types.ObjectId(courseId) }],
                }
            );
        } catch (err) {
            console.error('Failed to update last watched content:', err);
        }
    }

    // Infer or correct video source
    let videoSource = lesson.videoSource;
    const isYoutube = lesson.videoUrl && (lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be'));

    if (isYoutube) {
        videoSource = 'youtube';
    } else if (!videoSource) {
        videoSource = 'r2';
    }

    // Serialize current lesson data for client
    const currentLessonData = {
        titleBn: lesson.titleBn,
        descriptionBn: lesson.descriptionBn,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl || '',
        videoSource: (videoSource || 'r2') as 'r2' | 'youtube' | 'file',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachments: (lesson.attachments || []).map((att: any) => ({
            name: att.name,
            url: att.url,
            type: att.type,
            ...(att._id && { _id: att._id.toString() }),
        })),
    };

    return (
        <WatchPageClient
            courseId={courseId}
            contentId={lessonId}
            courseTitle={course.titleBn}
            initialLesson={currentLessonData}
        />
    );
}
