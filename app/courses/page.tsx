import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import { BookOpen, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import EnrollButton from '@/components/courses/EnrollButton';

export default async function PublicCoursesPage() {
    await connectDB();

    // Get current session (if any)
    const session = await auth();

    // Fetch all published courses
    const courses = await Course.find({ isPublished: true })
        .populate('instructor', 'name')
        .sort({ createdAt: -1 })
        .lean();

    // Serialize courses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedCourses = courses.map((course: any) => {
        // Handle instructors array
        const instructorsData = Array.isArray(course.instructor) ? course.instructor : [course.instructor];
        const instructorNames = instructorsData
            .map((inst: any) => inst?.name || 'Unknown') // eslint-disable-line @typescript-eslint/no-explicit-any
            .filter(Boolean)
            .join(', ');

        return {
            _id: course._id.toString(),
            titleBn: course.titleBn,
            titleEn: course.titleEn,
            descriptionBn: course.descriptionBn,
            thumbnailUrl: course.thumbnail,
            price: course.price,
            isFree: course.isFree,
            level: course.level,
            category: course.categoryBn || course.category,
            totalLessons: course.totalLessons,
            totalDuration: course.duration || 0,
            studentsEnrolled: course.enrolledStudents || 0,
            instructorNames,
        };
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">সকল কোর্স</h1>
                    <p className="text-lg md:text-xl opacity-90">
                        ইসলামিক শিক্ষার জন্য আমাদের সেরা কোর্সগুলো ব্রাউজ করুন
                    </p>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="container mx-auto px-4 py-12">
                {serializedCourses.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">কোনো কোর্স পাওয়া যায়নি</h2>
                        <p className="text-muted-foreground">
                            শীঘ্রই নতুন কোর্স যোগ করা হবে
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-muted-foreground">
                                {serializedCourses.length} টি কোর্স পাওয়া গেছে
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {serializedCourses.map((course) => (
                                <div
                                    key={course._id}
                                    className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {/* Thumbnail */}
                                    <Link href={`/courses/${course._id}`}>
                                        <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                                            {course.thumbnailUrl ? (
                                                <Image
                                                    src={course.thumbnailUrl}
                                                    alt={course.titleBn}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <BookOpen className="h-16 w-16 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="p-6">
                                        <Link href={`/courses/${course._id}`}>
                                            <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                                                {course.titleBn}
                                            </h3>
                                        </Link>

                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {course.descriptionBn}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{course.totalLessons || 0} পাঠ</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{course.studentsEnrolled || 0}</span>
                                            </div>
                                            {course.totalDuration && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{Math.floor(course.totalDuration / 60)}m</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Instructor */}
                                        <p className="text-sm text-muted-foreground mb-4">
                                            উস্তায: {course.instructorNames}
                                        </p>

                                        {/* Price & Enroll */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {course.isFree ? (
                                                    <span className="text-lg font-bold text-green-600">
                                                        বিনামূল্যে
                                                    </span>
                                                ) : (
                                                    <span className="text-lg font-bold">
                                                        ৳{course.price}
                                                    </span>
                                                )}
                                            </div>

                                            <EnrollButton
                                                courseId={course._id}
                                                isEnrolled={false}
                                                isLoggedIn={!!session}
                                                isFree={course.isFree}
                                                price={course.price}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
