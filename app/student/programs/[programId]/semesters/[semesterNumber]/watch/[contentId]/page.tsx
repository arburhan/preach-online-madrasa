import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import LongCourse from '@/lib/db/models/LongCourse';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import SemesterWatchClient from '@/components/watch/SemesterWatchClient';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        programId: string;
        semesterNumber: string;
        contentId: string;
    }>;
}

export default async function SemesterWatchContentPage({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/signin');
    }

    const { programId, semesterNumber: semesterNumStr, contentId } = await params;
    const semesterNumber = parseInt(semesterNumStr);

    await connectDB();

    // Find program
    const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (isValidObjectId(programId)) {
        query.$or = [{ slug: programId }, { _id: programId }];
    } else {
        query.slug = programId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program: any = await LongCourse.findOne(query).lean();
    if (!program) {
        notFound();
    }

    // Check enrollment
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

    // Find semester
    const semester = await ProgramSemester.findOne({
        program: program._id,
        semesterNumber,
    }).lean();

    if (!semester) {
        notFound();
    }

    // Check if contentId is a lesson or exam
    let lesson = null;
    let isExam = false;

    if (isValidObjectId(contentId)) {
        lesson = await Lesson.findById(contentId).lean();

        if (!lesson || lesson.programSemester?.toString() !== semester._id.toString()) {
            // Not a lesson for this semester, check if it's an exam
            const exam = await Exam.findById(contentId).lean();

            if (exam && exam.programSemester?.toString() === semester._id.toString()) {
                isExam = true;
            } else {
                // Not found in this semester
                redirect(`/student/programs/${programId}/semesters/${semesterNumber}`);
            }
        }
    } else {
        redirect(`/student/programs/${programId}/semesters/${semesterNumber}`);
    }

    // Prepare lesson data if it's a lesson
    let initialLesson = null;
    if (lesson && !isExam) {
        // Infer or correct video source
        let videoSource = lesson.videoSource;
        const isYoutube = lesson.videoUrl && (lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be'));

        if (isYoutube) {
            videoSource = 'youtube';
        } else if (!videoSource) {
            videoSource = 'r2';
        }

        initialLesson = {
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
    }

    return (
        <SemesterWatchClient
            programId={program._id.toString()}
            semesterNumber={semesterNumber}
            contentId={contentId}
            semesterTitle={semester.titleBn || `সেমিস্টার ${semesterNumber}`}
            programTitle={program.titleBn}
            initialLesson={initialLesson || undefined}
        />
    );
}
