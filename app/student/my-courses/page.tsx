import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Course from '@/lib/db/models/Course';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, CheckCircle2, PlayCircle } from 'lucide-react';

interface EnrolledCourse {
    _id: { toString: () => string };
    titleBn: string;
    titleEn?: string;
    thumbnail?: string;
    totalLessons: number;
    instructor?: { name: string };
}

export default async function MyCoursesPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    await connectDB();

    // Get user's enrolled courses
    const userData = await User.findById(session.user.id)
        .select('enrolledCourses')
        .lean();

    if (!userData || !userData.enrolledCourses || userData.enrolledCourses.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-3xl font-bold mb-8">আমার কোর্সসমূহ</h1>

                    {/* Empty State */}
                    <div className="bg-card rounded-xl border p-12 text-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">কোনো কোর্সে নথিভুক্ত হননি</h2>
                        <p className="text-muted-foreground mb-6">
                            আপনি এখনও কোনো কোর্সে ভর্তি হননি। নতুন কোর্স ব্রাউজ করুন এবং শেখা শুরু করুন!
                        </p>
                        <Link
                            href="/student/browse"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <BookOpen className="h-5 w-5" />
                            কোর্স ব্রাউজ করুন
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Fetch enrolled course details
    const coursesData = await Course.find({
        _id: { $in: userData.enrolledCourses }
    })
        .populate('instructor', 'name')
        .select('titleBn titleEn thumbnail totalLessons status')
        .lean();

    const courses = coursesData as unknown as EnrolledCourse[];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">আমার কোর্সসমূহ</h1>
                    <p className="text-muted-foreground mt-2">
                        মোট {courses.length} টি কোর্সে নথিভুক্ত
                    </p>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course._id.toString()}
                            className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Thumbnail */}
                            {course.thumbnail ? (
                                <div className="relative h-48 w-full bg-muted">
                                    <Image
                                        src={course.thumbnail}
                                        alt={course.titleBn}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 w-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                    <BookOpen className="h-16 w-16 text-white/50" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6">
                                {/* Title */}
                                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                    {course.titleBn}
                                </h3>

                                {/* Instructor */}
                                {course.instructor && (
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {course.instructor.name}
                                    </p>
                                )}

                                {/* Progress Placeholder - Will implement with actual progress later */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">অগ্রগতি</span>
                                        <span className="font-medium">0%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: '0%' }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{course.totalLessons || 0} পাঠ</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>0 সম্পন্ন</span>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                <Link
                                    href={`/student/browse/${course._id.toString()}`}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <PlayCircle className="h-5 w-5" />
                                    শেখা চালিয়ে যান
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
