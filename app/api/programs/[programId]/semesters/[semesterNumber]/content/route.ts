import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import ExamResult from '@/lib/db/models/ExamResult';
import Progress from '@/lib/db/models/Progress';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Module from '@/lib/db/models/Module';
import LongCourse from '@/lib/db/models/LongCourse';
import { auth } from '@/lib/auth/auth.config';

// GET /api/programs/[programId]/semesters/[semesterNumber]/content
// Get unified content (lessons + exams) for semester watch page
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; semesterNumber: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'অননুমোদিত অ্যাক্সেস' },
                { status: 401 }
            );
        }

        const { programId, semesterNumber: semesterNumStr } = await params;
        const semesterNumber = parseInt(semesterNumStr);

        await connectDB();

        // Find semester
        const semester = await ProgramSemester.findOne({
            program: programId,
            semesterNumber,
        }).lean();

        if (!semester) {
            return NextResponse.json(
                { error: 'সেমিস্টার পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        // Check if semester is active (not draft) for non-admin users
        const isAdmin = session.user.role === 'admin';
        const isTeacher = session.user.role === 'teacher';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!isAdmin && !isTeacher && (semester as any).status === 'draft') {
            return NextResponse.json(
                { error: 'এই সেমিস্টার এখনো প্রকাশিত হয়নি' },
                { status: 403 }
            );
        }

        const semesterId = semester._id;

        // Fetch lessons with module
        const lessons = await Lesson.find({ programSemester: semesterId })
            .sort({ order: 1 })
            .select('_id titleBn titleEn duration order isFree videoUrl module')
            .lean();

        // Fetch exams with module (only published)
        const exams = await Exam.find({
            programSemester: semesterId,
            status: 'published'
        })
            .sort({ order: 1 })
            .select('_id titleBn titleEn order totalMarks passMarks questions duration module')
            .lean();

        // Fetch modules for lesson-based programs
        const program = await LongCourse.findById(programId).select('contentMode').lean();
        const isLessonBased = (program as any)?.contentMode === 'lesson-based'; // eslint-disable-line @typescript-eslint/no-explicit-any
        const modules = isLessonBased
            ? await Module.find({ programSemester: semesterId })
                .sort({ order: 1 })
                .select('_id titleBn order')
                .lean()
            : [];

        // Get user's progress for lessons
        const lessonIds = lessons.map(l => l._id);
        const progresses = await Progress.find({
            user: session.user.id,
            lesson: { $in: lessonIds }
        }).lean();

        const completedLessonIds = new Set(
            progresses
                .filter((p: any) => p.isCompleted) // eslint-disable-line @typescript-eslint/no-explicit-any
                .map((p: any) => p.lesson?.toString()) // eslint-disable-line @typescript-eslint/no-explicit-any
        );

        // Get user's exam results
        const examIds = exams.map(e => e._id);
        const examResults = await ExamResult.find({
            student: session.user.id,
            exam: { $in: examIds },
            isLatest: true,
        }).lean();

        const examResultsMap = new Map();
        examResults.forEach((result: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const examId = result.exam.toString();
            examResultsMap.set(examId, result);
        });

        // Combine and sort content
        const content: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Add lessons
        lessons.forEach((lesson: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            content.push({
                type: 'lesson',
                _id: lesson._id.toString(),
                order: lesson.order || 0,
                titleBn: lesson.titleBn,
                titleEn: lesson.titleEn,
                duration: lesson.duration,
                videoUrl: lesson.videoUrl,
                isCompleted: completedLessonIds.has(lesson._id.toString()),
                isLocked: false,
                module: lesson.module?.toString(),
            });
        });

        // Add exams
        exams.forEach((exam: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const examId = exam._id.toString();
            const result = examResultsMap.get(examId);
            const isPassed = result ? result.percentage >= 40 : false;

            content.push({
                type: 'exam',
                _id: examId,
                order: exam.order || 999,
                titleBn: exam.titleBn,
                titleEn: exam.titleEn,
                totalMarks: exam.totalMarks,
                passMarks: exam.passMarks,
                questionCount: exam.questions?.length || 0,
                duration: exam.duration,
                isCompleted: !!result,
                isPassed,
                isLocked: false,
                obtainedMarks: result?.marks,
                percentage: result?.percentage,
                module: exam.module?.toString(),
            });
        });

        // Sort by order
        content.sort((a, b) => a.order - b.order);

        // Calculate locked status (sequential unlocking)
        // Lock if previous EXAM was not passed
        for (let i = 1; i < content.length; i++) {
            const prevContent = content[i - 1];
            const currentContent = content[i];

            // Lock if previous content was an EXAM that wasn't passed
            if (prevContent.type === 'exam' && !prevContent.isPassed) {
                currentContent.isLocked = true;
            }

            // Propagate lock status
            if (content[i - 1].isLocked) {
                currentContent.isLocked = true;
            }
        }

        // Check if all content is completed
        const allLessonsCompleted = content
            .filter(c => c.type === 'lesson')
            .every(c => c.isCompleted);
        const allExamsPassed = content
            .filter(c => c.type === 'exam')
            .every(c => c.isPassed);

        return NextResponse.json({
            content,
            modules: modules.map((m: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                _id: m._id.toString(),
                titleBn: m.titleBn,
                order: m.order || 0,
            })),
            isLessonBased,
            semester: {
                _id: semester._id.toString(),
                semesterNumber: semester.semesterNumber,
                titleBn: semester.titleBn,
                isCompleted: semester.isCompleted,
            },
            allContentCompleted: allLessonsCompleted && allExamsPassed,
        });
    } catch (error) {
        console.error('Get semester content error:', error);
        return NextResponse.json(
            { error: 'কন্টেন্ট লোড করতে সমস্যা হয়েছে' },
            { status: 500 }
        );
    }
}
