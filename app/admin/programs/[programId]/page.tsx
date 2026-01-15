import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Program from '@/lib/db/models/LongCourse';
import '@/lib/db/models/Semester'; // Register for populate
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    GraduationCap,
    Clock,
    Tag,
    Users,
    CheckCircle,
    Calendar,
    Pencil
} from 'lucide-react';

export default async function ProgramDetailPage({
    params,
}: {
    params: Promise<{ programId: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/unauthorized');
    }

    const { programId } = await params;
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program: any = await Program.findById(programId)
        .populate('semesters', 'number titleBn level status')
        .populate('createdBy', 'name')
        .lean();

    if (!program) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href="/admin/programs"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        প্রোগ্রাম তালিকা
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{program.titleBn}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm ${program.status === 'published'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {program.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                                </span>
                            </div>
                            <p className="text-muted-foreground">{program.descriptionBn}</p>
                        </div>
                        <Link href={`/admin/programs/${programId}/edit`}>
                            <Button>
                                <Pencil className="h-4 w-4 mr-2" />
                                এডিট করুন
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">মেয়াদ</p>
                                <p className="text-xl font-bold">{program.durationMonths} মাস</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="h-8 w-8 text-purple-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">সেমিস্টার</p>
                                <p className="text-xl font-bold">{program.semesters?.length || 0}/{program.totalSemesters}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Tag className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">মূল্য</p>
                                <p className="text-xl font-bold">
                                    {program.isFree ? 'বিনামূল্যে' : `৳${program.discountPrice || program.price}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-amber-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">শিক্ষার্থী</p>
                                <p className="text-xl font-bold">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Semesters */}
                        <div className="bg-card rounded-xl border p-6">
                            <h2 className="text-xl font-semibold mb-4">সেমিস্টারসমূহ</h2>
                            {program.semesters?.length > 0 ? (
                                <div className="space-y-3">
                                    {program.semesters.map((semester: { _id: string; number: number; titleBn: string; level: string; status: string }, index: number) => (
                                        <div
                                            key={semester._id}
                                            className="flex items-center justify-between p-4 bg-muted rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium">{semester.titleBn}</p>
                                                    <p className="text-sm text-muted-foreground">{semester.level}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${semester.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {semester.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">কোনো সেমিস্টার যুক্ত করা হয়নি</p>
                            )}
                        </div>

                        {/* Features */}
                        {program.features?.length > 0 && (
                            <div className="bg-card rounded-xl border p-6">
                                <h2 className="text-xl font-semibold mb-4">সুবিধাসমূহ</h2>
                                <ul className="space-y-2">
                                    {program.features.map((feature: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Enrollment Period */}
                        <div className="bg-card rounded-xl border p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                এনরোলমেন্ট
                            </h3>
                            <div className="space-y-3 text-sm">
                                {program.enrollmentStartDate && (
                                    <div>
                                        <p className="text-muted-foreground">শুরু</p>
                                        <p className="font-medium">
                                            {new Date(program.enrollmentStartDate).toLocaleDateString('bn-BD')}
                                        </p>
                                    </div>
                                )}
                                {program.enrollmentEndDate && (
                                    <div>
                                        <p className="text-muted-foreground">শেষ</p>
                                        <p className="font-medium">
                                            {new Date(program.enrollmentEndDate).toLocaleDateString('bn-BD')}
                                        </p>
                                    </div>
                                )}
                                {program.maxStudents && (
                                    <div>
                                        <p className="text-muted-foreground">সর্বোচ্চ শিক্ষার্থী</p>
                                        <p className="font-medium">{program.maxStudents} জন</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-card rounded-xl border p-6 space-y-3">
                            <h3 className="font-semibold mb-4">অ্যাকশন</h3>
                            <Link href={`/admin/programs/${programId}/edit`} className="block">
                                <Button className="w-full" variant="outline">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    এডিট করুন
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
