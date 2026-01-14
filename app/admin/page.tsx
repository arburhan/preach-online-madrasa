import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import {
    Users,
    GraduationCap,
    BookOpen,
    Video,
    Clock,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface RecentUser {
    _id: { toString: () => string };
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    createdAt: Date;
}

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
    return (
        <div className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold mt-2">{value}</h3>
                    {trend && (
                        <p className={`text-sm mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className={`h-4 w-4 ${!trendUp && 'rotate-180'}`} />
                            {trend}
                        </p>
                    )}
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default async function AdminDashboardPage() {
    const session = await auth();

    // Check if user is authenticated and is admin
    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    if (session.user.role !== 'admin') {
        redirect('/');
    }

    await connectDB();

    // Get statistics
    const [
        totalUsers,
        totalStudents,
        totalTeachers,
        pendingTeachers,
        totalCourses,
        publishedCourses,
        totalLessons,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher', isTeacherApproved: true }),
        User.countDocuments({ role: 'teacher', isTeacherApproved: false }),
        Course.countDocuments(),
        Course.countDocuments({ status: 'published' }),
        Lesson.countDocuments(),
    ]);

    // Get total enrollments (count all enrolledCourses across users)
    const enrollmentStats = await User.aggregate([
        { $match: { role: 'student' } },
        { $project: { enrollmentCount: { $size: { $ifNull: ['$enrolledCourses', []] } } } },
        { $group: { _id: null, total: { $sum: '$enrollmentCount' } } },
    ]);
    const totalEnrollments = enrollmentStats[0]?.total || 0;

    // Get recent users (last 5)
    const recentUsersData = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt')
        .lean();
    const recentUsers = recentUsersData as unknown as RecentUser[];

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
                <p className="text-muted-foreground mt-2">
                    প্ল্যাটফর্মের সামগ্রিক পরিসংখ্যান এবং সাম্প্রতিক কার্যক্রম
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="মোট ইউজার"
                    value={totalUsers}
                    icon={<Users className="h-6 w-6 text-purple-600" />}
                />
                <StatsCard
                    title="মোট শিক্ষার্থী"
                    value={totalStudents}
                    icon={<Users className="h-6 w-6 text-blue-600" />}
                />
                <StatsCard
                    title="অনুমোদিত শিক্ষক"
                    value={totalTeachers}
                    icon={<GraduationCap className="h-6 w-6 text-green-600" />}
                />
                <StatsCard
                    title="অপেক্ষমাণ শিক্ষক"
                    value={pendingTeachers}
                    icon={<Clock className="h-6 w-6 text-orange-600" />}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="মোট কোর্স"
                    value={totalCourses}
                    icon={<BookOpen className="h-6 w-6 text-purple-600" />}
                />
                <StatsCard
                    title="প্রকাশিত কোর্স"
                    value={publishedCourses}
                    icon={<BookOpen className="h-6 w-6 text-green-600" />}
                />
                <StatsCard
                    title="মোট পাঠ"
                    value={totalLessons}
                    icon={<Video className="h-6 w-6 text-blue-600" />}
                />
                <StatsCard
                    title="মোট নথিভুক্তি"
                    value={totalEnrollments}
                    icon={<TrendingUp className="h-6 w-6 text-green-600" />}
                />
            </div>

            {/* Quick Actions */}
            {pendingTeachers > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/20 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-400">
                                শিক্ষক অনুমোদনের জন্য অপেক্ষমাণ
                            </h3>
                            <p className="text-sm text-orange-700 dark:text-orange-500 mt-1">
                                {pendingTeachers} জন শিক্ষক অনুমোদনের জন্য অপেক্ষায় আছেন
                            </p>
                        </div>
                        <Link
                            href="/admin/teachers"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            এখনই পর্যালোচনা করুন
                        </Link>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-card rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-4">সাম্প্রতিক ইউজার</h2>
                <div className="space-y-4">
                    {recentUsers.length > 0 ? (
                        recentUsers.map((user: RecentUser) => (
                            <div
                                key={user._id.toString()}
                                className="flex items-center justify-between py-3 border-b last:border-0"
                            >
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                                            : user.role === 'teacher'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                            }`}
                                    >
                                        {user.role === 'admin' ? 'অ্যাডমিন' : user.role === 'teacher' ? 'শিক্ষক' : 'শিক্ষার্থী'}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">কোনো সাম্প্রতিক কার্যক্রম নেই</p>
                    )}
                </div>
            </div>
        </div>
    );
}
