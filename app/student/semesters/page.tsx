import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Semester from '@/lib/db/models/Semester';
import StudentSemester from '@/lib/db/models/StudentSemester';
import Student from '@/lib/db/models/Student';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    GraduationCap,
    Clock,
    Award,
    ChevronRight,
    Video,
    Calendar
} from 'lucide-react';

// Level colors and labels
const levelConfig = {
    basic: { color: 'bg-green-500', gradient: 'from-green-500 to-emerald-600', label: 'বেসিক' },
    expert: { color: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600', label: 'এক্সপার্ট' },
    masters: { color: 'bg-purple-500', gradient: 'from-purple-500 to-violet-600', label: 'মাস্টার্স' },
    alim: { color: 'bg-red-500', gradient: 'from-red-500 to-rose-600', label: 'আলিম' },
};

export default async function StudentSemesterDashboard() {
    const user = await requireAuth();

    if (user.role !== 'student') {
        redirect('/unauthorized');
    }

    await connectDB();

    // Get user details including gender
    const userData = await Student.findById(user.id).select('name gender').lean();

    // Get all active semesters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const semesters: any[] = await Semester.find({ status: 'active' })
        .populate('subjects')
        .sort({ number: 1 })
        .lean();

    // Get student's enrollments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollments: any[] = await StudentSemester.find({ student: user.id })
        .populate('semester')
        .lean();

    const enrolledSemesterIds = enrollments.map(e => e.semester?._id?.toString());

    // Calculate overall progress
    const completedSemesters = enrollments.filter(e => e.status === 'completed').length;
    const inProgressSemesters = enrollments.filter(e => e.status === 'in_progress').length;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-linear-to-r from-purple-600 to-indigo-700 text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">আসসালামু আলাইকুম, {userData?.name || user.name}</h1>
                            <p className="text-purple-100 mt-1">২ বছর মেয়াদি অনলাইন ইসলামিক শিক্ষা প্রোগ্রাম</p>
                        </div>
                        <Link href="/">
                            <Button variant="secondary">হোম পেজ</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">নথিভুক্ত সেমিস্টার</p>
                                <p className="text-2xl font-bold">{enrollments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">চলমান</p>
                                <p className="text-2xl font-bold">{inProgressSemesters}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">সম্পন্ন</p>
                                <p className="text-2xl font-bold">{completedSemesters}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-lg">
                                <Award className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">সার্টিফিকেট</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Level Progress Bar */}
                <div className="bg-card rounded-xl border p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">আপনার শিক্ষা যাত্রা</h2>
                    <div className="flex items-center gap-2">
                        {Object.entries(levelConfig).map(([level, config], index) => {
                            const levelSemesters = semesters.filter(s => s.level === level);
                            const enrolledInLevel = enrollments.filter(
                                e => levelSemesters.some(s => s._id.toString() === e.semester?._id?.toString())
                            );
                            const isCompleted = enrolledInLevel.every(e => e.status === 'completed') && enrolledInLevel.length === 2;
                            const isActive = enrolledInLevel.length > 0 && !isCompleted;

                            return (
                                <div key={level} className="flex-1">
                                    <div className={`h-3 rounded-full ${isCompleted ? `bg-linear-to-r ${config.gradient}` :
                                        isActive ? `bg-linear-to-r ${config.gradient} opacity-50` :
                                            'bg-gray-200'
                                        }`} />
                                    <p className="text-center text-xs mt-2 text-muted-foreground">
                                        {config.label}
                                    </p>
                                    {index < 3 && (
                                        <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Enrolled Semesters */}
                {enrollments.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">আমার সেমিস্টারসমূহ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {enrollments.map((enrollment) => {
                                const semester = enrollment.semester;
                                if (!semester) return null;

                                const config = levelConfig[semester.level as keyof typeof levelConfig];
                                const progress = enrollment.subjectProgress?.reduce(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (acc: number, sp: any) => acc + (sp.percentage || 0), 0
                                ) / (enrollment.subjectProgress?.length || 1);

                                return (
                                    <Link
                                        key={enrollment._id.toString()}
                                        href={`/student/semester/${semester._id}`}
                                        className="group"
                                    >
                                        <div className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className={`bg-linear-to-r ${config?.gradient || 'from-gray-500 to-gray-600'} text-white p-4`}>
                                                <p className="text-sm opacity-80">{config?.label}</p>
                                                <h3 className="font-bold text-lg">{semester.titleBn}</h3>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between text-sm mb-3">
                                                    <span className="text-muted-foreground">
                                                        <Video className="h-4 w-4 inline mr-1" />
                                                        {semester.subjects?.length || 0} বিষয়
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${enrollment.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {enrollment.status === 'completed' ? 'সম্পন্ন' : 'চলমান'}
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>অগ্রগতি</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-linear-to-r ${config?.gradient}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <Button className="w-full" size="sm">
                                                    ক্লাস দেখুন
                                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Available Semesters */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">সকল সেমিস্টার</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {semesters.map((semester) => {
                            const config = levelConfig[semester.level as keyof typeof levelConfig];
                            const isEnrolled = enrolledSemesterIds.includes(semester._id.toString());

                            return (
                                <div
                                    key={semester._id.toString()}
                                    className={`bg-card rounded-xl border overflow-hidden ${isEnrolled ? 'ring-2 ring-primary' : ''
                                        }`}
                                >
                                    <div className={`bg-linear-to-r ${config?.gradient || 'from-gray-500 to-gray-600'} text-white p-4`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm opacity-80">{config?.label || semester.level}</p>
                                                <h3 className="font-bold">{semester.titleBn}</h3>
                                            </div>
                                            <Calendar className="h-8 w-8 opacity-50" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {semester.descriptionBn}
                                        </p>
                                        <div className="flex items-center justify-between text-sm mb-4">
                                            <span>{semester.subjects?.length || 0} বিষয়</span>
                                            <span>{semester.duration} মাস</span>
                                        </div>

                                        {isEnrolled ? (
                                            <Link href={`/student/semester/${semester._id}`}>
                                                <Button className="w-full" size="sm">
                                                    ক্লাস দেখুন
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button variant="outline" className="w-full" size="sm" disabled>
                                                এনরোল করুন
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
