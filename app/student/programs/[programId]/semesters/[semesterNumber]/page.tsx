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
import Module from '@/lib/db/models/Module';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, PlayCircle, CheckCircle, Clock, Lock, Play } from 'lucide-react';
import { canAccessSemester } from '@/lib/utils/semester-progression';
import { Button } from '@/components/ui/button';
import StudentModuleAccordion from '@/components/student/StudentModuleAccordion';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ programId: string; semesterNumber: string }>;
}

export default async function StudentSemesterPage({ params }: PageProps) {
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

    // Check access to this semester
    const accessCheck = await canAccessSemester(
        session.user.id,
        program._id.toString(),
        semesterNumber
    );

    if (!accessCheck.canAccess && !isAdmin) {
        redirect(`/student/programs/${programId}`);
    }

    // Find semester
    const semester = await ProgramSemester.findOne({
        program: program._id,
        semesterNumber,
    }).lean();

    // If semester doesn't exist, show empty state
    if (!semester) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
                    <div className="bg-card p-8 rounded-2xl border">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">সেমিস্টার তৈরি হয়নি</h1>
                        <p className="text-muted-foreground mb-6">
                            এই সেমিস্টারের কন্টেন্ট এখনো যোগ করা হয়নি। শীঘ্রই কন্টেন্ট যোগ করা হবে।
                        </p>
                        <Link href={`/student/programs/${programId}`}>
                            <Button>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                প্রোগ্রামে ফিরে যান
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Fetch lessons and exams
    const lessons = await Lesson.find({ programSemester: semester._id })
        .sort({ order: 1 })
        .lean();

    const exams = await Exam.find({
        programSemester: semester._id,
        status: 'published'
    })
        .sort({ order: 1 })
        .lean();

    // Fetch modules if lesson-based content
    const isLessonBased = program.contentMode === 'lesson-based';
    const modules = isLessonBased
        ? await Module.find({ programSemester: semester._id })
            .sort({ order: 1 })
            .lean()
        : [];

    // Combine content for display
    const allContent: {
        type: 'lesson' | 'exam';
        _id: string;
        order: number;
        titleBn: string;
        duration?: number;
        totalMarks?: number;
        passMarks?: number;
        module?: string;
    }[] = [
        ...lessons.map((l: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            type: 'lesson' as const,
            _id: l._id.toString(),
            order: l.order || 0,
            titleBn: l.titleBn,
            duration: l.duration,
            module: l.module?.toString(),
        })),
        ...exams.map((e: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            type: 'exam' as const,
            _id: e._id.toString(),
            order: e.order || 999,
            titleBn: e.titleBn,
            totalMarks: e.totalMarks,
            passMarks: e.passMarks,
            duration: e.duration,
            module: e.module?.toString(),
        })),
    ].sort((a, b) => a.order - b.order);

    // Get student's progress for lessons
    const lessonIds = lessons.map(l => l._id);
    const lessonProgress = await Progress.find({
        user: session.user.id,
        lesson: { $in: lessonIds },
    }).lean();

    const completedLessonIds = new Set(
        lessonProgress
            .filter(p => p.isCompleted)
            .map(p => p.lesson?.toString())
    );

    // Get student's exam results
    const examIds = exams.map(e => e._id);
    const examResults = await ExamResult.find({
        student: session.user.id,
        exam: { $in: examIds },
        isLatest: true,
    }).lean();

    const examResultMap = new Map(
        examResults.map(r => [r.exam?.toString(), r])
    );

    // Calculate lock status for each content
    const contentWithLock: (typeof allContent[0] & { isLocked: boolean })[] = [];

    for (let i = 0; i < allContent.length; i++) {
        const item = allContent[i];
        let isLocked = false;

        if (i > 0) {
            const prev = allContent[i - 1];
            // Check if previous was an exam that wasn't passed
            if (prev.type === 'exam') {
                const prevResult: any = examResultMap.get(prev._id); // eslint-disable-line @typescript-eslint/no-explicit-any
                const prevPassed = prevResult && prevResult.percentage >= 40;
                if (!prevPassed) {
                    isLocked = true;
                }
            }
            // Propagate lock from previous item
            if (contentWithLock[i - 1]?.isLocked) {
                isLocked = true;
            }
        }

        contentWithLock.push({ ...item, isLocked });
    }

    // Calculate overall progress
    const completedCount = allContent.filter(item => {
        if (item.type === 'lesson') {
            return completedLessonIds.has(item._id);
        } else {
            const result: any = examResultMap.get(item._id); // eslint-disable-line @typescript-eslint/no-explicit-any
            return result && result.percentage >= 40;
        }
    }).length;

    const progressPercent = allContent.length > 0
        ? Math.round((completedCount / allContent.length) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-8">
                <div className="container mx-auto px-4">
                    <Link
                        href={`/student/programs/${programId}`}
                        className="inline-flex items-center text-purple-200 hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        প্রোগ্রামে ফিরে যান
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                সেমিস্টার {semesterNumber}: {semester.titleBn || `সেমিস্টার ${semesterNumber}`}
                            </h1>
                            <p className="text-purple-200">{program.titleBn}</p>
                        </div>

                        {/* Start/Continue Button */}
                        {allContent.length > 0 && (
                            <Link href={`/student/programs/${programId}/semesters/${semesterNumber}/watch`}>
                                <Button size="lg" className="bg-white text-purple-700 hover:bg-white/90">
                                    <Play className="h-5 w-5 mr-2" />
                                    {completedCount > 0 ? 'চালিয়ে যান' : 'শুরু করুন'}
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                            <BookOpen className="h-4 w-4" />
                            {lessons.length} পাঠ
                        </span>
                        <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                            <FileText className="h-4 w-4" />
                            {exams.length} পরীক্ষা
                        </span>
                        <span className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-full">
                            <CheckCircle className="h-4 w-4" />
                            {completedCount}/{allContent.length} সম্পন্ন ({progressPercent}%)
                        </span>
                    </div>

                    {/* Progress Bar */}
                    {allContent.length > 0 && (
                        <div className="mt-4">
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content List */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-xl font-bold mb-6">কন্টেন্ট সিকুয়েন্স</h2>

                {allContent.length === 0 ? (
                    <div className="bg-card p-8 rounded-xl border text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            এই সেমিস্টারে এখনো কোনো কন্টেন্ট যোগ করা হয়নি
                        </p>
                    </div>
                ) : isLessonBased && modules.length > 0 ? (
                    /* Module-based accordion for lesson-based programs */
                    <StudentModuleAccordion
                        modules={modules.map((m: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                            _id: m._id.toString(),
                            titleBn: m.titleBn,
                            order: m.order || 0,
                        }))}
                        contents={contentWithLock.map(item => ({
                            ...item,
                            isCompleted: item.type === 'lesson'
                                ? completedLessonIds.has(item._id)
                                : (() => {
                                    const result: any = examResultMap.get(item._id); // eslint-disable-line @typescript-eslint/no-explicit-any
                                    return result && result.percentage >= 40;
                                })(),
                        }))}
                        baseUrl={`/student/programs/${programId}/semesters/${semesterNumber}/watch`}
                    />
                ) : (
                    <div className="space-y-3">
                        {contentWithLock.map((item, index) => {
                            const isLesson = item.type === 'lesson';
                            const isComplete = isLesson
                                ? completedLessonIds.has(item._id)
                                : (() => {
                                    const result: any = examResultMap.get(item._id); // eslint-disable-line @typescript-eslint/no-explicit-any
                                    return result && result.percentage >= 40;
                                })();
                            const examResult: any = !isLesson ? examResultMap.get(item._id) : null; // eslint-disable-line @typescript-eslint/no-explicit-any

                            // Determine card style
                            let cardStyle = 'bg-card hover:border-primary/50';
                            if (item.isLocked) {
                                cardStyle = 'bg-gray-50 opacity-60 cursor-not-allowed';
                            } else if (isComplete) {
                                cardStyle = 'bg-green-50/50 border-green-200';
                            } else if (examResult && examResult.percentage < 40) {
                                cardStyle = 'bg-red-50/50 border-red-200';
                            }

                            // Common content JSX
                            const cardContent = (
                                <>
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.isLocked
                                        ? 'bg-gray-200 text-gray-400'
                                        : isComplete
                                            ? 'bg-green-100 text-green-600'
                                            : isLesson
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {item.isLocked ? (
                                            <Lock className="h-5 w-5" />
                                        ) : isComplete ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : isLesson ? (
                                            <PlayCircle className="h-5 w-5" />
                                        ) : (
                                            <FileText className="h-5 w-5" />
                                        )}
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded ${isLesson
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                {isLesson ? 'পাঠ' : 'পরীক্ষা'}
                                            </span>
                                            {item.isLocked && (
                                                <span className="text-xs text-gray-500">লক করা</span>
                                            )}
                                        </div>
                                        <p className="font-medium truncate">
                                            {index + 1}. {item.titleBn}
                                        </p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-3">
                                            {item.duration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {isLesson
                                                        ? `${Math.floor(item.duration / 60)} মিনিট`
                                                        : `${item.duration} মিনিট`
                                                    }
                                                </span>
                                            )}
                                            {!isLesson && item.totalMarks && (
                                                <span>{item.totalMarks} মার্কস</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="shrink-0">
                                        {isComplete ? (
                                            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                                                <CheckCircle className="h-3 w-3" />
                                                {isLesson ? 'দেখা হয়েছে' : 'পাস'}
                                            </span>
                                        ) : examResult && examResult.percentage < 40 ? (
                                            <span className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-full">
                                                {examResult.percentage}% - পুনরায় চেষ্টা করুন
                                            </span>
                                        ) : item.isLocked ? (
                                            <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1.5 rounded-full">
                                                <Lock className="h-3 w-3 inline mr-1" />
                                                লক
                                            </span>
                                        ) : null}
                                    </div>
                                </>
                            );

                            // Render locked items as div, unlocked as Link
                            if (item.isLocked) {
                                return (
                                    <div
                                        key={item._id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${cardStyle}`}
                                    >
                                        {cardContent}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item._id}
                                    href={`/student/programs/${programId}/semesters/${semesterNumber}/watch/${item._id}`}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${cardStyle}`}
                                >
                                    {cardContent}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
