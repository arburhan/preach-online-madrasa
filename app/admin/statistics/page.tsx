import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import {
    Users,
    BookOpen,
    TrendingUp,
    Award
} from 'lucide-react';

interface TopCourse {
    _id: { toString: () => string };
    titleBn: string;
    enrolledCount: number;
    instructor?: { name?: string } | null;
}

interface TopTeacher {
    _id: { toString: () => string };
    totalStudents: number;
    courseCount: number;
    teacherData: { name: string };
}

export default async function StatisticsPage() {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'admin') {
        redirect('/');
    }

    await connectDB();

    // Get top courses by enrollment
    const topCoursesData = await Course.find({ status: 'published' })
        .sort({ enrolledCount: -1 })
        .limit(10)
        .populate('instructors', 'name')
        .lean();
    const topCourses = topCoursesData as unknown as TopCourse[];

    // Get top teachers by total students
    const topTeachersData = await Course.aggregate([
        { $match: { status: 'published', instructors: { $exists: true, $ne: [] } } },
        { $unwind: '$instructors' }, // Unwind the instructors array
        {
            $group: {
                _id: '$instructors',
                totalStudents: { $sum: '$enrolledCount' },
                courseCount: { $sum: 1 },
            },
        },
        { $sort: { totalStudents: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'teacherData',
            },
        },
        { $unwind: '$teacherData' },
    ]);
    const topTeachers = topTeachersData as TopTeacher[];

    // Get overview stats
    const [totalStudents, totalTeachers, totalCourses, totalLessons] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher', isTeacherApproved: true }),
        Course.countDocuments({ status: 'published' }),
        Lesson.countDocuments(),
    ]);

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">প্ল্যাটফর্ম পরিসংখ্যান</h1>
                <p className="text-muted-foreground mt-2">
                    সামগ্রিক পারফরম্যান্স এবং জনপ্রিয়তার তথ্য
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">শিক্ষার্থী</p>
                            <h3 className="text-3xl font-bold mt-2">{totalStudents}</h3>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">শিক্ষক</p>
                            <h3 className="text-3xl font-bold mt-2">{totalTeachers}</h3>
                        </div>
                        <Users className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">প্রকাশিত কোর্স</p>
                            <h3 className="text-3xl font-bold mt-2">{totalCourses}</h3>
                        </div>
                        <BookOpen className="h-8 w-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">মোট পাঠ</p>
                            <h3 className="text-3xl font-bold mt-2">{totalLessons}</h3>
                        </div>
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Courses */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="h-5 w-5 text-purple-600" />
                        <h2 className="text-xl font-semibold">জনপ্রিয় কোর্স</h2>
                    </div>
                    <div className="space-y-3">
                        {topCourses.length > 0 ? (
                            topCourses.map((course: TopCourse, index: number) => (
                                <div
                                    key={course._id.toString()}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{course.titleBn}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {course.instructor?.name || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{course.enrolledCount || 0}</p>
                                        <p className="text-xs text-muted-foreground">শিক্ষার্থী</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">কোনো কোর্স নেই</p>
                        )}
                    </div>
                </div>

                {/* Top Teachers */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="h-5 w-5 text-green-600" />
                        <h2 className="text-xl font-semibold">শীর্ষ শিক্ষক</h2>
                    </div>
                    <div className="space-y-3">
                        {topTeachers.length > 0 ? (
                            topTeachers.map((item: TopTeacher, index: number) => (
                                <div
                                    key={item._id.toString()}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{item.teacherData.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.courseCount} টি কোর্স
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{item.totalStudents}</p>
                                        <p className="text-xs text-muted-foreground">শিক্ষার্থী</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">কোনো শিক্ষক নেই</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
