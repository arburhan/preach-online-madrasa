import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Student from '@/lib/db/models/Student';
import Course from '@/lib/db/models/Course';
import LongCourse from '@/lib/db/models/LongCourse';
import { BookOpen, GraduationCap, Clock, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ObjectId } from 'mongoose';

export default async function StudentDashboard() {
    const user = await requireAuth();

    if (user.role !== 'student') {
        redirect('/unauthorized');
    }

    await connectDB();

    // Get user's enrolled courses AND programs
    const userData = await Student.findById(user.id)
        .select('enrolledCourses enrolledPrograms')
        .lean();

    // Extract course IDs from both old format (ObjectId) and new format ({course, lastWatchedLesson, enrolledAt})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrolledCourseIds = userData?.enrolledCourses?.map((e: any) => {
        // Old format: e is just an ObjectId
        if (e?.toString && typeof e.toString === 'function' && !e.course) {
            return e;
        }
        // New format: e.course is the ObjectId
        return e.course;
    }).filter(Boolean) || [];

    // Extract program IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrolledProgramIds = userData?.enrolledPrograms?.map((e: any) => {
        if (e?.toString && typeof e.toString === 'function' && !e.program) {
            return e;
        }
        return e.program;
    }).filter(Boolean) || [];

    // Fetch full course data separately to avoid populate issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrolledCourses: any[] = await Course.find({
        _id: { $in: enrolledCourseIds }
    })
        .select('titleBn titleEn thumbnail level descriptionBn instructors slug')
        .lean();

    // Fetch enrolled programs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrolledPrograms: any[] = await LongCourse.find({
        _id: { $in: enrolledProgramIds }
    })
        .select('titleBn titleEn thumbnail slug durationMonths totalSemesters')
        .lean();

    // Get recent published courses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentCourses: any[] = await Course.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

    // Manually fetch all teachers for both enrolled and recent courses
    const Teacher = (await import('@/lib/db/models/Teacher')).default;
    const allCourses = [...enrolledCourses, ...recentCourses];
    const allInstructorIds = allCourses.flatMap(c => c.instructors || []);
    const teachers = await Teacher.find({ _id: { $in: allInstructorIds } })
        .select('_id name image')
        .lean();

    const teacherMap = new Map(teachers.map(t => [t._id.toString(), t]));

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">আসসালামু আলাইকুম, {user.name}</h1>
                            <p className="text-muted-foreground mt-1">আপনার শিক্ষার যাত্রা চালিয়ে যান</p>
                        </div>
                        <Link href="/">
                            <Button variant="outline">হোম পেজ</Button>
                        </Link>
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
                                <p className="text-sm text-muted-foreground">নথিভুক্ত কোর্স</p>
                                <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">নথিভুক্ত প্রোগ্রাম</p>
                                <p className="text-2xl font-bold">{enrolledPrograms.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">চলমান কোর্স</p>
                                <p className="text-2xl font-bold">{enrolledCourses.length + enrolledPrograms.length}</p>
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

                {/* Enrolled Programs Section */}
                {enrolledPrograms.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">আমার প্রোগ্রামসমূহ</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledPrograms.map((program) => (
                                <Link
                                    key={program._id.toString()}
                                    href={`/student/programs/${program.slug || program._id}`}
                                    className="group"
                                >
                                    <div className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="relative h-48 bg-linear-to-r from-purple-600 to-indigo-700">
                                            {program.thumbnail ? (
                                                <Image
                                                    src={program.thumbnail}
                                                    alt={program.titleBn}
                                                    width={400}
                                                    height={192}
                                                    className="w-full h-48 object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <GraduationCap className="h-16 w-16 text-white/50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                                {program.titleBn}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {program.durationMonths} মাস
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="h-4 w-4" />
                                                    {program.totalSemesters} সেমিস্টার
                                                </span>
                                            </div>
                                            <Button className="w-full" size="sm">
                                                সেমিস্টার দেখুন
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Enrolled Courses */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">আমার কোর্সসমূহ</h2>
                        <Link href="/student/my-courses">
                            <Button variant="ghost">সব দেখুন</Button>
                        </Link>
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="bg-card p-12 rounded-xl border text-center">
                            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">কোনো কোর্সে নথিভুক্ত নেই</h3>
                            <p className="text-muted-foreground mb-6">
                                নতুন কোর্সে নথিভুক্ত হয়ে আপনার শিক্ষার যাত্রা শুরু করুন
                            </p>
                            <Link href="/student/browse">
                                <Button>কোর্স ব্রাউজ করুন</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledCourses.map((course) => (
                                <Link
                                    key={course._id.toString()}
                                    href={`/student/watch/${course.slug || course._id}`}
                                    className="group"
                                >
                                    <div className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                                        {course.thumbnail && (
                                            <Image
                                                src={course.thumbnail}
                                                alt={course.titleBn}
                                                width={400}
                                                height={192}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-6">
                                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                                {course.titleBn}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                                <Image
                                                    src={(course.instructors?.[0] && teacherMap.get(course.instructors[0].toString())?.image) || '/placeholder-avatar.png'}
                                                    alt="Instructor"
                                                    width={24}
                                                    height={24}
                                                    className="w-6 h-6 rounded-full"
                                                />
                                                <span>
                                                    {course.instructors?.map((id: ObjectId) => teacherMap.get(id.toString())?.name).filter(Boolean).join(', ') || 'Unknown'}
                                                </span>
                                            </div>
                                            <Button className="w-full" size="sm">
                                                ক্লাস ভিডিও দেখুন
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Browse New Courses */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">নতুন কোর্সসমূহ</h2>
                        <Link href="/student/browse">
                            <Button variant="ghost">সব দেখুন</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentCourses.map((course) => (
                            <Link
                                key={course._id.toString()}
                                href={`/student/browse/${course.slug || course._id}`}
                                className="group"
                            >
                                <div className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                                    {course.thumbnail && (
                                        <Image
                                            src={course.thumbnail}
                                            alt={course.titleBn}
                                            width={400}
                                            height={160}
                                            className="w-full h-40 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {course.titleBn}
                                        </h3>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{course.totalLessons} পাঠ</span>
                                            {course.isFree ? (
                                                <span className="text-green-600 font-medium">বিনামূল্যে</span>
                                            ) : (
                                                <span className="text-primary font-medium">৳{course.price}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
