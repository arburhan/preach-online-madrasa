import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Student from '@/lib/db/models/Student';
import Progress from '@/lib/db/models/Progress';
import Lesson from '@/lib/db/models/Lesson';
import { ArrowLeft, Users, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        courseId: string;
    }>;
}

interface StudentProgress {
    userId: string;
    name: string;
    email: string;
    enrolledAt: Date;
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
    lastActivity: Date | null;
    status: 'Active' | 'Completed' | 'Inactive';
}

interface ProgressDoc {
    isCompleted: boolean;
    updatedAt: Date;
}

export default async function CourseAnalyticsPage({ params }: PageProps) {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    if (session.user.role !== 'teacher' && session.user.role !== 'admin') {
        redirect('/');
    }

    const { courseId } = await params;
    const currentTime = new Date().getTime(); // Server component compatible

    await connectDB();

    // Get course details
    const course = await Course.findById(courseId)
        .populate('instructors', 'name')
        .lean();

    if (!course) {
        redirect('/teacher/analytics');
    }

    // Verify teacher owns this course (unless admin)
    const isInstructor = Array.isArray(course.instructors)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? course.instructors.some((inst: any) => inst._id?.toString() === session.user.id)
        : false;

    if (session.user.role === 'teacher' && !isInstructor) {
        redirect('/teacher/analytics');
    }

    // Get all lessons for this course
    const lessons = await Lesson.find({ course: courseId })
        .sort({ order: 1 })
        .select('_id titleBn order')
        .lean();

    const totalLessons = lessons.length;

    // Get enrolled students
    const enrolledUsers = await Student.find({
        'enrolledCourses.course': courseId
    }).select('_id name email createdAt').lean();

    // Calculate progress for each student
    const studentProgress: StudentProgress[] = await Promise.all(
        enrolledUsers.map(async (user) => {
            const userId = user._id.toString();

            // Get all progress for this user in this course
            const userProgress = await Progress.find({
                user: userId,
                course: courseId
            }).lean();

            const completedLessons = (userProgress as unknown as ProgressDoc[]).filter((p) => p.isCompleted).length;
            const progressPercentage = totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            // Get last activity
            const sortedProgress = (userProgress as unknown as ProgressDoc[]).sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            const lastProgress = sortedProgress[0];

            const lastActivity = lastProgress ? new Date(lastProgress.updatedAt) : null;

            // Determine status
            let status: 'Active' | 'Completed' | 'Inactive' = 'Inactive';
            if (progressPercentage === 100) {
                status = 'Completed';
            } else if (lastActivity) {
                const daysSinceActivity = Math.floor(
                    (currentTime - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
                );
                if (daysSinceActivity <= 7) {
                    status = 'Active';
                }
            }

            return {
                userId,
                name: user.name || 'Unknown',
                email: user.email || '',
                enrolledAt: user.createdAt,
                completedLessons,
                totalLessons,
                progressPercentage,
                lastActivity,
                status
            };
        })
    );

    // Sort by progress (descending)
    studentProgress.sort((a, b) => b.progressPercentage - a.progressPercentage);

    // Calculate stats
    const totalStudents = enrolledUsers.length;
    const completedStudents = studentProgress.filter(s => s.status === 'Completed').length;
    const activeStudents = studentProgress.filter(s => s.status === 'Active').length;
    const avgProgress = totalStudents > 0
        ? Math.round(studentProgress.reduce((sum, s) => sum + s.progressPercentage, 0) / totalStudents)
        : 0;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/teacher/analytics"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{course.titleBn}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            কোর্স Analytics এবং Student Progress
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-muted-foreground">মোট Students</span>
                        </div>
                        <p className="text-3xl font-bold">{totalStudents}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-muted-foreground">Completed</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{completedStudents}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            <span className="text-sm text-muted-foreground">Active</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{activeStudents}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-muted-foreground">Avg Progress</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{avgProgress}%</p>
                    </div>
                </div>

                {/* Student Progress Table */}
                <div className="bg-card border rounded-xl">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Student Progress</h2>
                    </div>
                    <div className="p-6">
                        {studentProgress.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">এখনও কোনো student enroll করেনি</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr className="text-left">
                                            <th className="pb-3 font-semibold">Student</th>
                                            <th className="pb-3 font-semibold">Progress</th>
                                            <th className="pb-3 font-semibold">Completed</th>
                                            <th className="pb-3 font-semibold">Last Activity</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {studentProgress.map((student) => (
                                            <tr key={student.userId} className="hover:bg-muted/50">
                                                <td className="py-4">
                                                    <div>
                                                        <p className="font-medium">{student.name}</p>
                                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="w-32">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="font-medium">{student.progressPercentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-purple-600 h-full rounded-full"
                                                                style={{ width: `${student.progressPercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="text-sm">
                                                        {student.completedLessons} / {student.totalLessons}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    {student.lastActivity ? (
                                                        <span className="text-sm text-muted-foreground">
                                                            {new Date(student.lastActivity).toLocaleDateString('bn-BD')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No activity</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <span
                                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Completed'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : student.status === 'Active'
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}
                                                    >
                                                        {student.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
