import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Student from '@/lib/db/models/Student';
import Progress from '@/lib/db/models/Progress';
import { BookOpen, Users, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';

interface CourseAnalytics {
    courseId: string;
    title: string;
    titleBn: string;
    enrollments: number;
    completionRate: number;
    avgProgress: number;
    activeStudents: number;
}

interface ProgressRecord {
    isCompleted: boolean;
    progressPercentage?: number;
    user: { toString: () => string };
    updatedAt: Date;
}

export default async function TeacherAnalyticsPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    if (session.user.role !== 'teacher' && session.user.role !== 'admin') {
        redirect('/');
    }

    await connectDB();

    // Get teacher's courses
    const courses = await Course.find({
        instructor: session.user.id
    }).select('_id titleBn titleEn').lean();

    // Calculate analytics for each course
    const courseAnalytics: CourseAnalytics[] = await Promise.all(
        courses.map(async (course) => {
            const courseId = course._id.toString();

            // Get total enrollments
            const enrolledUsers = await Student.find({
                'enrolledCourses.course': courseId
            }).countDocuments();

            // Get all progress records for this course
            const progressRecords = await Progress.find({
                course: courseId
            }).lean();

            // Calculate completion rate
            const completedUsers = new Set(
                (progressRecords as unknown as ProgressRecord[])
                    .filter((p) => p.isCompleted)
                    .map((p) => p.user.toString())
            ).size;

            const completionRate = enrolledUsers > 0
                ? Math.round((completedUsers / enrolledUsers) * 100)
                : 0;

            // Calculate average progress
            const totalProgress = (progressRecords as unknown as ProgressRecord[]).reduce((sum, record) => {
                return sum + (record.progressPercentage || 0);
            }, 0);

            const avgProgress = progressRecords.length > 0
                ? Math.round(totalProgress / progressRecords.length)
                : 0;

            // Get active students (updated in last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const activeStudents = await Progress.distinct('user', {
                course: courseId,
                updatedAt: { $gte: sevenDaysAgo }
            });

            return {
                courseId,
                title: course.titleEn || '',
                titleBn: course.titleBn || '',
                enrollments: enrolledUsers,
                completionRate,
                avgProgress,
                activeStudents: activeStudents.length
            };
        })
    );

    const totalEnrollments = courseAnalytics.reduce((sum, c) => sum + c.enrollments, 0);

    const avgCompletionRate = courseAnalytics.length > 0
        ? Math.round(
            courseAnalytics.reduce((sum, c) => sum + c.completionRate, 0) / courseAnalytics.length
        )
        : 0;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">শিক্ষক Analytics</h1>
                        <p className="text-muted-foreground mt-1">
                            আপনার কোর্স এবং শিক্ষার্থীদের পারফরম্যান্স ট্র্যাক করুন
                        </p>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">মোট কোর্স</span>
                        </div>
                        <p className="text-3xl font-bold">{courses.length}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">মোট Enrollment</span>
                        </div>
                        <p className="text-3xl font-bold">{totalEnrollments}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">গড় Completion</span>
                        </div>
                        <p className="text-3xl font-bold">{avgCompletionRate}%</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Award className="h-5 w-5 text-orange-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Active Students</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {courseAnalytics.reduce((sum, c) => sum + c.activeStudents, 0)}
                        </p>
                    </div>
                </div>

                {/* Course Performance */}
                <div className="bg-card border rounded-xl">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">কোর্স পারফরম্যান্স</h2>
                    </div>
                    <div className="p-6">
                        {courseAnalytics.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">এখনও কোনো কোর্স তৈরি করা হয়নি</p>
                                <Link
                                    href="/teacher/courses/new"
                                    className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    নতুন কোর্স তৈরি করুন
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {courseAnalytics.map((course) => (
                                    <Link
                                        key={course.courseId}
                                        href={`/teacher/analytics/${course.courseId}`}
                                        className="block p-5 border rounded-lg hover:border-purple-400 hover:shadow-md transition-all"
                                    >
                                        <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                                            {course.titleBn}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Enrollments</p>
                                                <p className="font-bold text-lg">{course.enrollments}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Active</p>
                                                <p className="font-bold text-lg text-green-600">
                                                    {course.activeStudents}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-muted-foreground">Completion Rate</span>
                                                <span className="font-medium">{course.completionRate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-full rounded-full"
                                                    style={{ width: `${course.completionRate}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-muted-foreground">Avg Progress</span>
                                                <span className="font-medium">{course.avgProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-full rounded-full"
                                                    style={{ width: `${course.avgProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
