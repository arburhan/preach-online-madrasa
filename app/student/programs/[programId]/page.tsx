import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import LongCourse from '@/lib/db/models/LongCourse';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, GraduationCap, Clock } from 'lucide-react';


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
    const program: any = await LongCourse.findOne(query)
        .populate({
            path: 'semesters',
            select: 'number titleBn level descriptionBn duration status',
            options: { sort: { number: 1 } }  // Sort by semester number
        })
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

    // Get completed semester IDs as a Set for quick lookup
    const completedSemesterIds = new Set(
        enrollment?.completedSemesters?.map((id: { toString: () => string }) => id.toString()) || []
    );

    if (!isEnrolled && !isAdmin) {
        redirect(`/programs/${program.slug || program._id}`);
    }

    // Sort semesters by number for proper order
    const sortedSemesters = program.semesters?.sort((a: { number: number }, b: { number: number }) =>
        (a.number || 0) - (b.number || 0)
    ) || [];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-700 text-white py-8">
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
                                    {program.totalSemesters} সেমিস্টার
                                </span>
                                <span className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-full">
                                    সম্পন্ন: {completedSemesterIds.size}/{sortedSemesters.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Semesters List */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-card p-12 rounded-xl border text-center">
                    <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">প্রোগ্রাম বিবরণ</h3>
                    <p className="text-muted-foreground">
                        এই প্রোগ্রামে {program.totalSemesters} টি সেমিস্টার রয়েছে।
                    </p>
                </div>
            </div>
        </div>
    );
}
