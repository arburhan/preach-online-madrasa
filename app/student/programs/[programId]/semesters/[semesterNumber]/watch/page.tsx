import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import LongCourse from '@/lib/db/models/LongCourse';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import Progress from '@/lib/db/models/Progress';
import ExamResult from '@/lib/db/models/ExamResult';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ programId: string; semesterNumber: string }>;
}

// This page auto-redirects to the first content or last watched content
export default async function SemesterWatchEntry({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/signin');
    }

    const { programId, semesterNumber: semesterNumStr } = await params;
    const semesterNumber = parseInt(semesterNumStr);

    await connectDB();

    // Find program
    const isValidObjectId = /^[a-f\d]{24}$/i.test(programId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (isValidObjectId) {
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

    // Get lessons and exams
    const lessons = await Lesson.find({ programSemester: semester._id })
        .sort({ order: 1 })
        .select('_id order')
        .lean();

    const exams = await Exam.find({
        programSemester: semester._id,
        status: 'published'
    })
        .sort({ order: 1 })
        .select('_id order passMarks')
        .lean();

    // Combine content
    const allContent = [
        ...lessons.map(l => ({
            _id: l._id.toString(),
            order: l.order || 0,
            type: 'lesson' as const
        })),
        ...exams.map(e => ({
            _id: e._id.toString(),
            order: e.order || 999,
            type: 'exam' as const,
            passMarks: (e as any).passMarks // eslint-disable-line @typescript-eslint/no-explicit-any
        })),
    ].sort((a, b) => a.order - b.order);

    if (allContent.length === 0) {
        // No content - redirect back to semester page
        redirect(`/student/programs/${programId}/semesters/${semesterNumber}`);
    }

    // Get user progress to find last watched or first unlocked
    const lessonIds = lessons.map(l => l._id);
    const examIds = exams.map(e => e._id);

    const completedLessons = await Progress.find({
        user: session.user.id,
        lesson: { $in: lessonIds },
        isCompleted: true,
    }).select('lesson').lean();

    const completedLessonIds = new Set(
        completedLessons.map(p => p.lesson?.toString())
    );

    const passedExams = await ExamResult.find({
        student: session.user.id,
        exam: { $in: examIds },
        percentage: { $gte: 40 },
        isLatest: true,
    }).select('exam').lean();

    const passedExamIds = new Set(
        passedExams.map(r => r.exam?.toString())
    );

    // Find first unlocked incomplete content
    let targetContentId = allContent[0]._id;

    for (let i = 0; i < allContent.length; i++) {
        const item = allContent[i];
        const isCompleted = item.type === 'lesson'
            ? completedLessonIds.has(item._id)
            : passedExamIds.has(item._id);

        // Check if locked (previous exam not passed)
        let isLocked = false;
        if (i > 0) {
            const prev = allContent[i - 1];
            if (prev.type === 'exam' && !passedExamIds.has(prev._id)) {
                isLocked = true;
            }
        }

        if (!isLocked && !isCompleted) {
            targetContentId = item._id;
            break;
        }

        // If we completed everything, go to the last content
        if (i === allContent.length - 1 && isCompleted) {
            targetContentId = item._id;
        }
    }

    redirect(`/student/programs/${programId}/semesters/${semesterNumber}/watch/${targetContentId}`);
}
