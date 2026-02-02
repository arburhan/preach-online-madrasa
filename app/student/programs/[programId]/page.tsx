import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import LongCourse from '@/lib/db/models/LongCourse';
import ProgramSemester from '@/lib/db/models/ProgramSemester';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, GraduationCap, Clock, Lock, CheckCircle, PlayCircle, BookOpen, FileText } from 'lucide-react';
import { canAccessSemester, getSemesterProgress } from '@/lib/utils/semester-progression';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ programId: string }>;
}

export default async function StudentProgramPage({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/signin');
    }

    const { programId } = await params;
    await connectDB();

    // Find program by slug or ID
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

    // Check if user is enrolled
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

    // শিক্ষার্থীর সম্পন্ন সেমিস্টার নম্বর
    const completedSemesterNumbers = new Set(enrollment?.completedSemesterNumbers || []);
    const currentSemesterNumber = enrollment?.currentSemesterNumber || 1;

    // Fetch all semesters for this program
    const semesters = await ProgramSemester.find({ program: program._id })
        .sort({ semesterNumber: 1 })
        .lean();

    // প্রতিটি সেমিস্টারের অ্যাক্সেস এবং প্রোগ্রেস চেক করুন
    const semesterData = await Promise.all(
        semesters.map(async (semester) => {
            const access = await canAccessSemester(
                session.user!.id,
                program._id.toString(),
                semester.semesterNumber
            );

            const progress = await getSemesterProgress(
                session.user!.id,
                semester._id.toString()
            );

            return {
                ...semester,
                _id: semester._id.toString(),
                canAccess: access.canAccess,
                accessReason: access.reason,
                isCompleted: completedSemesterNumbers.has(semester.semesterNumber),
                isCurrent: semester.semesterNumber === currentSemesterNumber,
                progress,
            };
        })
    );

    // সেমিস্টার না থাকলে placeholder দেখান
    const totalSemesters = program.totalSemesters || 4;
    const displaySemesters = semesterData.length > 0
        ? semesterData
        : Array.from({ length: totalSemesters }, (_, i) => ({
            semesterNumber: i + 1,
            titleBn: `সেমিস্টার ${i + 1}`,
            canAccess: i === 0,
            isCompleted: false,
            isCurrent: i === 0,
            progress: { lessonsCompleted: 0, totalLessons: 0, examsPassed: 0, totalExams: 0, overallPercentage: 0 },
            status: 'draft' as const,
        }));

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-8">
                <div className="container mx-auto px-4">
                    <Link
                        href="/student"
                        className="inline-flex items-center text-purple-200 hover:text-white mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        ড্যাশবোর্ডে ফিরে যান
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Thumbnail */}
                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-purple-500/30 shrink-0">
                            {program.thumbnail ? (
                                <Image
                                    src={program.thumbnail}
                                    alt={program.titleBn}
                                    width={192}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <GraduationCap className="h-12 w-12 text-white/50" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">{program.titleBn}</h1>

                            <div className="flex flex-wrap gap-4 text-sm">
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                                    <Clock className="h-4 w-4" />
                                    {program.durationMonths} মাস
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                                    <GraduationCap className="h-4 w-4" />
                                    {totalSemesters} সেমিস্টার
                                </span>
                                <span className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-full">
                                    সম্পন্ন: {completedSemesterNumbers.size}/{totalSemesters}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Semesters Grid */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-xl font-bold mb-6">সেমিস্টারসমূহ</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {displaySemesters.map((semester: any) => (
                        <SemesterCard
                            key={semester.semesterNumber}
                            semester={semester}
                            programId={program._id.toString()}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// সেমিস্টার কার্ড কম্পোনেন্ট
function SemesterCard({
    semester,
    programId
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    semester: any;
    programId: string;
}) {
    const { canAccess, isCompleted, isCurrent, progress, accessReason } = semester;

    // স্ট্যাটাস নির্ধারণ
    let statusBadge;
    let cardStyle = 'bg-card border';

    if (isCompleted) {
        statusBadge = (
            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <CheckCircle className="h-3 w-3" />
                সম্পন্ন
            </span>
        );
        cardStyle = 'bg-green-50/50 border border-green-200';
    } else if (isCurrent && canAccess) {
        statusBadge = (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <PlayCircle className="h-3 w-3" />
                চলমান
            </span>
        );
        cardStyle = 'bg-blue-50/50 border-2 border-blue-400';
    } else if (!canAccess) {
        statusBadge = (
            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                <Lock className="h-3 w-3" />
                লক করা
            </span>
        );
        cardStyle = 'bg-gray-50 border border-gray-200 opacity-70';
    } else {
        statusBadge = (
            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                উন্মুক্ত
            </span>
        );
    }

    return (
        <div className={`rounded-xl p-5 ${cardStyle} transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">
                    সেমিস্টার {semester.semesterNumber}
                </h3>
                {statusBadge}
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {semester.titleBn || `সেমিস্টার ${semester.semesterNumber} এর পাঠ্যক্রম`}
            </p>

            {/* প্রোগ্রেস বার */}
            {(canAccess || isCompleted) && progress && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>অগ্রগতি</span>
                        <span>{progress.overallPercentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress.overallPercentage}%` }}
                        />
                    </div>

                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {progress.lessonsCompleted}/{progress.totalLessons} পাঠ
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {progress.examsPassed}/{progress.totalExams} পরীক্ষা
                        </span>
                    </div>
                </div>
            )}

            {/* লক কারণ */}
            {!canAccess && accessReason && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-4">
                    {accessReason}
                </p>
            )}

            {/* অ্যাকশন বাটন */}
            {canAccess ? (
                <Link
                    href={`/student/programs/${programId}/semesters/${semester.semesterNumber}`}
                    className="inline-flex items-center justify-center w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    {isCompleted ? 'পুনরায় দেখুন' : isCurrent ? 'চালিয়ে যান' : 'শুরু করুন'}
                </Link>
            ) : (
                <button
                    disabled
                    className="inline-flex items-center justify-center w-full py-2 px-4 rounded-lg bg-gray-200 text-gray-500 text-sm font-medium cursor-not-allowed"
                >
                    <Lock className="h-4 w-4 mr-2" />
                    লক করা আছে
                </button>
            )}
        </div>
    );
}
