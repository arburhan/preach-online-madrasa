import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Program from '@/lib/db/models/LongCourse';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText, BookOpen, Layers } from 'lucide-react';
import LessonList from '@/components/teacher/LessonList';
import ExamList from '@/components/teacher/ExamList';
import { SemesterActionsClient } from '@/components/admin/programs/SemesterActionsClient';
import ModuleManager from '@/components/admin/programs/ModuleManager';


export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        programId: string;
        semesterNumber: string;
    }>;
}

// বাংলা সংখ্যা কনভার্টার
const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
};

// সেমিস্টার নাম জেনারেট
const getSemesterName = (num: number): string => {
    const ordinals = ['প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', 'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম'];
    if (num <= 10) return `${ordinals[num - 1]} সেমিস্টার`;
    return `${toBengaliNumber(num)} নং সেমিস্টার`;
};

export default async function SemesterManagePage({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect('/unauthorized');
    }

    const { programId, semesterNumber } = await params;
    const semNum = parseInt(semesterNumber);

    if (isNaN(semNum) || semNum < 1) {
        notFound();
    }

    await connectDB();

    // Fetch program with instructor emails for access check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program: any = await Program.findById(programId)
        .populate('maleInstructors', 'email')
        .populate('femaleInstructors', 'email')
        .lean();

    if (!program) {
        notFound();
    }

    // Check if user has access: admin OR assigned instructor
    const isAdmin = session.user.role === 'admin';
    // Match by email since session.user.id might be from User model but instructors are from Teacher model
    const userEmail = session.user.email;
    const isInstructor =
        program.maleInstructors?.some((instructor: { email?: string }) => instructor?.email === userEmail) ||
        program.femaleInstructors?.some((instructor: { email?: string }) => instructor?.email === userEmail);

    if (!isAdmin && !isInstructor) {
        redirect('/unauthorized');
    }

    // Check if semester number is valid for this program
    if (semNum > program.totalSemesters) {
        notFound();
    }

    // Find or create semester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let semester: any = await ProgramSemester.findOne({
        program: programId,
        semesterNumber: semNum,
    }).lean();

    // If semester doesn't exist, we'll show empty state with option to create
    const isNew = !semester;

    if (isNew) {
        // Create the semester automatically using program's contentMode
        semester = await ProgramSemester.create({
            program: programId,
            semesterNumber: semNum,
            titleBn: getSemesterName(semNum),
            contentMode: program.contentMode || 'direct', // Use program's contentMode
            status: 'draft',
            order: semNum,
            createdBy: session.user.id,
        });
        semester = semester.toObject();
    }

    // Use program's contentMode for display
    const contentMode = program.contentMode || 'direct';

    // Fetch lessons and exams for this semester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessons: any[] = await Lesson.find({ programSemester: semester._id })
        .sort({ order: 1 })
        .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exams: any[] = await Exam.find({ programSemester: semester._id })
        .sort({ order: 1 })
        .lean();

    // Serialize for client
    const serializedLessons = lessons.map((lesson) => ({
        _id: lesson._id.toString(),
        course: programId, // Use programId for course reference
        titleBn: lesson.titleBn,
        titleEn: lesson.titleEn,
        order: lesson.order,
        isFree: lesson.isFree || false,
        isPublished: true,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        createdAt: lesson.createdAt?.toISOString(),
        updatedAt: lesson.updatedAt?.toISOString(),
    }));

    const serializedExams = exams.map((exam) => ({
        _id: exam._id.toString(),
        titleBn: exam.titleBn,
        type: exam.type,
        totalMarks: exam.totalMarks,
        passMarks: exam.passMarks,
        duration: exam.duration,
        status: exam.status,
        questionsCount: exam.questions?.length || 0,
        hasTiming: exam.hasTiming,
        startTime: exam.startTime?.toISOString(),
        endTime: exam.endTime?.toISOString(),
    }));

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`${isAdmin ? '/admin' : '/teacher'}/programs/${programId}`}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {program.titleBn} এ ফিরে যান
                        </Button>
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{semester.titleBn}</h1>
                            <p className="text-muted-foreground mt-1">
                                সেমিস্টার #{toBengaliNumber(semNum)} • {program.titleBn}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm ${semester.isCompleted
                                ? 'bg-green-100 text-green-700'
                                : semester.status === 'active'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                {semester.isCompleted ? 'সম্পন্ন' : semester.status === 'active' ? 'সক্রিয়' : 'ড্রাফট'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Mode Info */}
                <div className="bg-card p-4 rounded-xl border mb-6">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-medium">
                                কন্টেন্ট মোড: {contentMode === 'lesson-based' ? 'লেসন ভিত্তিক' : 'সরাসরি কন্টেন্ট'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {contentMode === 'lesson-based'
                                    ? 'লেসনের মধ্যে ভিডিও ও পরীক্ষা যুক্ত করুন'
                                    : 'সরাসরি এই সেমিস্টারে পাঠ ও পরীক্ষা যুক্ত করুন'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Section - Based on Mode */}
                {contentMode === 'lesson-based' ? (
                    /* Module-based UI for lesson-based mode */
                    <div className="bg-card p-6 rounded-xl border mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Layers className="h-6 w-6 text-primary" />
                                <div>
                                    <h2 className="text-2xl font-bold">মডিউলসমূহ</h2>
                                    <p className="text-sm text-muted-foreground">
                                        মডিউল তৈরি করে কন্টেন্ট যুক্ত করুন
                                    </p>
                                </div>
                            </div>
                            <SemesterActionsClient
                                programId={programId}
                                semesterNumber={semNum}
                                semesterId={semester._id.toString()}
                                isCompleted={semester.isCompleted}
                            />
                        </div>
                        <ModuleManager
                            programId={programId}
                            semesterNumber={semNum}
                            semesterId={semester._id.toString()}
                        />
                    </div>
                ) : (
                    /* Direct content UI */
                    <>
                        {/* Lessons Section */}
                        <div className="bg-card p-6 rounded-xl border mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">পাঠসমূহ</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {serializedLessons.length} টি পাঠ
                                    </p>
                                </div>
                                <div className="space-x-4">
                                    <Link href={`${isAdmin ? '/admin' : '/teacher'}/programs/${programId}/semesters/${semesterNumber}/exams/create`}>
                                        <Button variant="outline">
                                            <FileText className="mr-2 h-4 w-4" />
                                            পরীক্ষা নিন
                                        </Button>
                                    </Link>
                                    <Link href={`${isAdmin ? '/admin' : '/teacher'}/programs/${programId}/semesters/${semesterNumber}/lessons/new`}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            নতুন পাঠ যোগ করুন
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {serializedLessons.length > 0 ? (
                                <LessonList lessons={serializedLessons} courseId={programId} />
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="text-lg font-medium">কোনো পাঠ নেই</h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        এই সেমিস্টারে এখনো কোনো পাঠ যোগ করা হয়নি
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Exams Section */}
                        <div className="bg-card p-6 rounded-xl border">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">পরীক্ষাসমূহ</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {serializedExams.length} টি পরীক্ষা
                                    </p>
                                </div>
                                <SemesterActionsClient
                                    programId={programId}
                                    semesterNumber={semNum}
                                    semesterId={semester._id.toString()}
                                    isCompleted={semester.isCompleted}
                                />
                            </div>

                            {serializedExams.length > 0 ? (
                                <ExamList exams={serializedExams} courseId={programId} />
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="text-lg font-medium">কোনো পরীক্ষা নেই</h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        এই সেমিস্টারে এখনো কোনো পরীক্ষা যোগ করা হয়নি
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
