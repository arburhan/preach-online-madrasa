import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import LongCourse from '@/lib/db/models/LongCourse';
import Semester from '@/lib/db/models/Semester';
import Section from '@/lib/db/models/Section';
import Lesson from '@/lib/db/models/Lesson';
import Progress from '@/lib/db/models/Progress';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, FileText } from 'lucide-react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { ProgramLessonPlaylist } from '@/components/programs/ProgramLessonPlaylist';
import NoteEditor from '@/components/notes/NoteEditor';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        programId: string;
        semesterId: string;
    }>;
    searchParams: Promise<{ lesson?: string }>;
}

export default async function StudentSemesterWatchPage({ params, searchParams }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/signin');
    }

    const { programId, semesterId } = await params;
    const { lesson: lessonId } = await searchParams;

    await connectDB();

    // Find program by slug or ID
    const isValidObjectId = /^[a-f\d]{24}$/i.test(programId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programQuery: any = {};
    if (isValidObjectId) {
        programQuery.$or = [{ slug: programId }, { _id: programId }];
    } else {
        programQuery.slug = programId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program: any = await LongCourse.findOne(programQuery)
        .select('titleBn slug')
        .lean();

    if (!program) {
        notFound();
    }

    // Check if user is enrolled and get completion data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const student: any = await Student.findById(session.user.id)
        .select('enrolledPrograms')
        .lean();

    const enrollment = student?.enrolledPrograms?.find(
        (e: { program: { toString: () => string } }) => e.program?.toString() === program._id.toString()
    );

    const isEnrolled = !!enrollment;
    const isAdmin = session.user.role === 'admin';

    if (!isEnrolled && !isAdmin) {
        redirect(`/programs/${program.slug || program._id}`);
    }

    // Get all semesters for this program to check lock status
    const allSemesters = await Semester.find({ program: program._id })
        .sort({ number: 1 })
        .select('_id number')
        .lean();

    // Find the current semester index
    const currentSemesterIndex = allSemesters.findIndex(
        (s: { _id: { toString: () => string } }) => s._id.toString() === semesterId
    );

    // Check if semester is locked (previous semester not completed)
    const completedSemesterIds = new Set(
        enrollment?.completedSemesters?.map((id: { toString: () => string }) => id.toString()) || []
    );

    if (currentSemesterIndex > 0 && !isAdmin) {
        const previousSemesterId = allSemesters[currentSemesterIndex - 1]._id.toString();
        if (!completedSemesterIds.has(previousSemesterId)) {
            redirect(`/student/programs/${program.slug || program._id}?locked=true`);
        }
    }

    // Get semester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const semester: any = await Semester.findById(semesterId)
        .select('titleBn number level descriptionBn')
        .lean();

    if (!semester) {
        notFound();
    }

    // Get all sections with lessons for this semester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sections: any[] = await Section.find({ semester: semesterId })
        .sort({ order: 1 })
        .populate({
            path: 'lessons',
            select: '_id titleBn duration order isFree videoUrl videoSource videoKey descriptionBn attachments',
            options: { sort: { order: 1 } }
        })
        .lean();

    // Get flat list of all lessons (serialized)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allLessons = sections.flatMap(s =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s.lessons || []).map((l: any) => ({
            _id: l._id.toString(),
            titleBn: l.titleBn,
            duration: l.duration,
            order: l.order
        }))
    );

    // Serialize sections for client component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedSections = sections.map((s: any) => ({
        _id: s._id.toString(),
        titleBn: s.titleBn,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lessons: (s.lessons || []).map((l: any) => ({
            _id: l._id.toString(),
            titleBn: l.titleBn,
            duration: l.duration,
            order: l.order
        }))
    }));

    // Get user's progress for all lessons in this semester
    const progresses = await Progress.find({
        user: session.user.id,
        $or: [
            { course: semesterId },
            { lesson: { $in: allLessons.map(l => l._id) } }
        ]
    }).lean();

    // Get completed lesson IDs as array
    const completedLessonIds = progresses
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((p: any) => p.isCompleted)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => p.lesson.toString());

    // Find the index of the last completed lesson
    const lastCompletedIndex = allLessons.reduce((acc, lesson, idx) => {
        return completedLessonIds.includes(lesson._id) ? idx : acc;
    }, -1);

    // Find current lesson (from query param or first lesson)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentLesson: any = null;
    if (lessonId) {
        currentLesson = await Lesson.findById(lessonId).lean();
    }
    if (!currentLesson && allLessons.length > 0) {
        // Get full lesson data for first lesson
        currentLesson = await Lesson.findById(allLessons[0]._id).lean();
    }

    if (!currentLesson) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">কোনো পাঠ নেই</h2>
                    <p className="text-muted-foreground mb-4">এই সেমিস্টারে এখনো কোনো পাঠ যোগ করা হয়নি।</p>
                    <Link href={`/student/programs/${programId}`} className="text-primary hover:underline">
                        ← সেমিস্টার তালিকায় ফিরুন
                    </Link>
                </div>
            </div>
        );
    }

    // Get current lesson index for navigation and lock check
    const currentLessonId = currentLesson._id.toString();
    const currentLessonIndex = allLessons.findIndex(l => l._id === currentLessonId);

    // Check if current lesson is locked
    const isCurrentLessonLocked = !isAdmin && currentLessonIndex > 0 && currentLessonIndex > lastCompletedIndex + 1;

    if (isCurrentLessonLocked) {
        const firstUnlockedIndex = lastCompletedIndex + 1;
        const firstUnlockedLesson = allLessons[firstUnlockedIndex] || allLessons[0];
        redirect(`/student/programs/${programId}/semesters/${semesterId}?lesson=${firstUnlockedLesson._id}`);
    }

    const previousLessonId = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1]._id : null;
    const nextLessonId = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1]._id : null;

    // Infer video source
    let videoSource = currentLesson.videoSource;
    const isYoutube = currentLesson.videoUrl && (currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be'));
    if (isYoutube) {
        videoSource = 'youtube';
    } else if (!videoSource) {
        videoSource = currentLesson.videoKey ? 'r2' : 'r2';
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                {/* Back Link */}
                <Link
                    href={`/student/programs/${programId}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {program.titleBn} - সেমিস্টার তালিকা
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Video Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        <div className="bg-black rounded-xl overflow-hidden">
                            <VideoPlayer
                                lessonId={currentLessonId}
                                courseId={semesterId}
                                videoUrl={currentLesson.videoUrl || ''}
                                videoSource={videoSource || 'r2'}
                                previousLessonId={previousLessonId}
                                nextLessonId={nextLessonId}
                                basePath={`/student/programs/${programId}/semesters/${semesterId}?lesson=`}
                            />
                        </div>

                        {/* Lesson Info */}
                        <div className="bg-card rounded-xl border p-6">
                            <h1 className="text-2xl font-bold mb-2">{currentLesson.titleBn}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                {currentLesson.duration && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{Math.floor(currentLesson.duration / 60)} মিনিট</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{semester.titleBn}</span>
                                </div>
                            </div>

                            {currentLesson.descriptionBn && (
                                <div>
                                    <h3 className="font-semibold mb-2">বিবরণ</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {currentLesson.descriptionBn}
                                    </p>
                                </div>
                            )}

                            {/* Attachments */}
                            {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="font-semibold mb-3">সংযুক্ত ফাইল</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {currentLesson.attachments.map((file: any, index: number) => (
                                            <a
                                                key={index}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                                            >
                                                <div className="bg-primary/10 p-2 rounded">
                                                    <BookOpen className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">
                                                        {file.name || 'সংযুক্ত ফাইল'}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div className="bg-card rounded-xl border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5" />
                                <h3 className="font-semibold">নোট</h3>
                            </div>
                            <NoteEditor lessonId={currentLessonId} courseId={semesterId} />
                        </div>
                    </div>

                    {/* Playlist Sidebar - Client Component */}
                    <div className="lg:col-span-1">
                        <ProgramLessonPlaylist
                            sections={serializedSections}
                            allLessons={allLessons}
                            completedLessonIds={completedLessonIds}
                            currentLessonId={currentLessonId}
                            programId={programId}
                            semesterId={semesterId}
                            isAdmin={isAdmin}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
