import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import { BookOpen, Users, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function TeacherDashboard() {
    const user = await requireAuth();

    if (!['teacher', 'admin'].includes(user.role)) {
        redirect('/unauthorized');
    }

    await connectDB();

    // Get teacher's assigned courses (where they are in instructors array)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courses: any[] = await Course.find({ instructors: user.id })
        .sort({ createdAt: -1 })
        .lean();

    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;
    const draftCourses = courses.filter(c => c.status === 'draft').length;
    const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">প্রশিক্ষক ড্যাশবোর্ড</h1>
                            <p className="text-muted-foreground mt-1">আপনার নিয়োগপ্রাপ্ত কোর্স পরিচালনা করুন</p>
                        </div>
                        <div>
                            <Link href="/">
                                <Button variant="outline">হোম পেজ</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">মোট কোর্স</p>
                                <p className="text-2xl font-bold">{totalCourses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">প্রকাশিত</p>
                                <p className="text-2xl font-bold">{publishedCourses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-lg">
                                <FileText className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">খসড়া</p>
                                <p className="text-2xl font-bold">{draftCourses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">মোট শিক্ষার্থী</p>
                                <p className="text-2xl font-bold">{totalStudents}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">নিয়োগপ্রাপ্ত কোর্সসমূহ</h2>
                    </div>

                    {courses.length === 0 ? (
                        <div className="bg-card p-12 rounded-xl border text-center">
                            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">কোনো কোর্স নেই</h3>
                            <p className="text-muted-foreground mb-6">
                                আপনার প্রথম কোর্স তৈরি করে শিক্ষার্থীদের সাথে জ্ঞান ভাগ করুন
                            </p>
                            <Link href="/teacher/courses/new">
                                <Button>প্রথম কোর্স তৈরি করুন</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {courses.map((course) => (
                                <div
                                    key={course._id.toString()}
                                    className="bg-card p-6 rounded-xl border hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold">{course.titleBn}</h3>
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full ${course.status === 'published'
                                                        ? 'bg-green-500/10 text-green-600'
                                                        : 'bg-amber-500/10 text-amber-600'
                                                        }`}
                                                >
                                                    {course.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground mb-4 line-clamp-2">
                                                {course.descriptionBn}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                <span>{course.totalLessons || 0} টি পাঠ</span>
                                                <span>{course.enrolledCount || 0} জন শিক্ষার্থী</span>
                                                {course.isFree ? (
                                                    <span className="text-green-600">বিনামূল্যে</span>
                                                ) : (
                                                    <span>৳{course.price}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/teacher/courses/${course._id}`}>
                                                <Button variant="outline">সম্পাদনা</Button>
                                            </Link>
                                            <Link href={`/student/browse/${course.slug || course._id}`}>
                                                <Button variant="ghost">দেখুন</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
