import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Semester from '@/lib/db/models/Semester';
import Subject from '@/lib/db/models/Subject';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    BookOpen,
    Plus,
    Users,
    Video,
    Settings,
    Link as LinkIcon
} from 'lucide-react';

// Level colors
const levelColors = {
    basic: 'bg-green-500',
    expert: 'bg-blue-500',
    masters: 'bg-purple-500',
    alim: 'bg-red-500',
};

export default async function SemesterDetailPage({
    params,
}: {
    params: Promise<{ semesterId: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/unauthorized');
    }

    const { semesterId } = await params;
    await connectDB();

    // Get semester with populated subjects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const semester: any = await Semester.findById(semesterId).lean();

    if (!semester) {
        notFound();
    }

    // Get subjects for this semester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subjects: any[] = await Subject.find({ semester: semesterId })
        .populate('maleInstructors', 'name image gender')
        .populate('femaleInstructors', 'name image gender')
        .sort({ order: 1 })
        .lean();

    const levelColor = levelColors[semester.level as keyof typeof levelColors] || 'bg-gray-500';

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href="/admin/semesters"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        সেমিস্টার তালিকায় ফিরে যান
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${levelColor}`} />
                                <h1 className="text-3xl font-bold">{semester.titleBn}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs ${semester.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {semester.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </span>
                            </div>
                            <p className="text-muted-foreground mt-2">{semester.descriptionBn}</p>
                        </div>
                        <Button variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            সেমিস্টার সম্পাদনা
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">মোট বিষয়</p>
                                <p className="text-2xl font-bold">{subjects.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Video className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">মোট লেসন</p>
                                <p className="text-2xl font-bold">
                                    {subjects.reduce((acc, s) => acc + (s.totalLessons || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">শিক্ষক (পুরুষ)</p>
                                <p className="text-2xl font-bold">
                                    {subjects.reduce((acc, s) => acc + (s.maleInstructors?.length || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-pink-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">শিক্ষিকা (মহিলা)</p>
                                <p className="text-2xl font-bold">
                                    {subjects.reduce((acc, s) => acc + (s.femaleInstructors?.length || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subjects Section */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">বিষয়সমূহ</h2>
                    <Link href={`/admin/semesters/${semesterId}/subjects/create`}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            নতুন বিষয় যোগ করুন
                        </Button>
                    </Link>
                </div>

                {subjects.length === 0 ? (
                    <div className="bg-card rounded-xl border p-12 text-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">কোনো বিষয় নেই</h3>
                        <p className="text-muted-foreground mb-6">
                            এই সেমিস্টারে এখনো কোনো বিষয় যোগ করা হয়নি
                        </p>
                        <Link href={`/admin/semesters/${semesterId}/subjects/create`}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                বিষয় যোগ করুন
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subjects.map((subject) => (
                            <div
                                key={subject._id.toString()}
                                className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className={`px-4 py-2 text-white text-sm font-medium ${subject.type === 'islamic' ? 'bg-emerald-600' : 'bg-amber-600'
                                    }`}>
                                    {subject.type === 'islamic' ? 'ইসলামিক বিষয়' : 'স্কিল বিষয়'}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">{subject.titleBn}</h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {subject.descriptionBn}
                                    </p>

                                    {/* Instructors */}
                                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">পুরুষ শিক্ষক:</span>
                                            <span className="font-medium">
                                                {subject.maleInstructors?.length || 0} জন
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">মহিলা শিক্ষিকা:</span>
                                            <span className="font-medium">
                                                {subject.femaleInstructors?.length || 0} জন
                                            </span>
                                        </div>
                                    </div>

                                    {/* Live Links */}
                                    {subject.liveClassLinks && (
                                        <div className="flex gap-2 mb-4">
                                            {subject.liveClassLinks.male && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                                                    <LinkIcon className="h-3 w-3" />
                                                    ছেলেদের লিঙ্ক
                                                </span>
                                            )}
                                            {subject.liveClassLinks.female && (
                                                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs flex items-center gap-1">
                                                    <LinkIcon className="h-3 w-3" />
                                                    মেয়েদের লিঙ্ক
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Link href={`/admin/semesters/${semesterId}/subjects/${subject._id}`} className="flex-1">
                                            <Button className="w-full" size="sm">
                                                পরিচালনা করুন
                                            </Button>
                                        </Link>
                                        <Button variant="outline" size="sm">
                                            <Video className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
