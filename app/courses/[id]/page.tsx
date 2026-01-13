import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import User from '@/lib/db/models/User';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BookOpen, Clock, Users, Award } from 'lucide-react';
import EnrollButton from '@/components/courses/EnrollButton';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();

    await connectDB();

    // Fetch course details
    const course = await Course.findById(id)
        .populate('instructors', 'name teacherBio')
        .lean();

    if (!course || !course.publishedAt) {
        notFound();
    }

    // Fetch lessons count
    const lessonsCount = await Lesson.countDocuments({ course: id });

    // Check if user is enrolled
    let isEnrolled = false;
    if (session?.user?.id) {
        const user = await User.findById(session.user.id).lean();
        isEnrolled = user?.enrolledCourses?.some(
            (c: any) => c.toString() === id // eslint-disable-line @typescript-eslint/no-explicit-any
        ) || false;
    }

    // Serialize course
    const courseData = course as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const instructorsData = Array.isArray(courseData.instructors) ? courseData.instructors : [];

    // Get first instructor for display (or expand to show all)
    const primaryInstructor = instructorsData[0] || {};
    const allInstructorNames = instructorsData
        .map((inst: any) => inst?.name || 'Unknown') // eslint-disable-line @typescript-eslint/no-explicit-any
        .filter(Boolean)
        .join(', ') || 'Unknown';

    const serializedCourse = {
        _id: courseData._id.toString(),
        titleBn: courseData.titleBn,
        titleEn: courseData.titleEn,
        descriptionBn: courseData.descriptionBn,
        descriptionEn: courseData.descriptionEn,
        thumbnailUrl: courseData.thumbnail,
        price: courseData.price,
        isFree: courseData.isFree,
        level: courseData.level,
        category: courseData.category || '',
        totalLessons: lessonsCount,
        totalDuration: courseData.duration || 0,
        studentsEnrolled: courseData.enrolledStudents || 0,
        instructor: {
            _id: primaryInstructor?._id?.toString(),
            name: allInstructorNames,
            bio: primaryInstructor?.teacherBio || '',
        },
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            {serializedCourse.titleBn}
                        </h1>
                        {serializedCourse.titleEn && (
                            <p className="text-xl opacity-90 mb-4">
                                {serializedCourse.titleEn}
                            </p>
                        )}
                        <p className="text-lg opacity-90 mb-6">
                            {serializedCourse.descriptionBn}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <span>{serializedCourse.studentsEnrolled} শিক্ষার্থী</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                <span>{serializedCourse.totalLessons} টি পাঠ</span>
                            </div>
                            {serializedCourse.totalDuration && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    <span>{Math.floor(serializedCourse.totalDuration / 60)} মিনিট</span>
                                </div>
                            )}
                            {serializedCourse.level && (
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    <span>{serializedCourse.level}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Course */}
                        <div className="bg-card border rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-4">কোর্স সম্পর্কে</h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {serializedCourse.descriptionBn}
                            </p>
                            {serializedCourse.descriptionEn && (
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    {serializedCourse.descriptionEn}
                                </p>
                            )}
                        </div>

                        {/* Instructor */}
                        <div className="bg-card border rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-4">উস্তায</h2>
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                    <Users className="h-8 w-8 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {serializedCourse.instructor.name}
                                    </h3>
                                    {serializedCourse.instructor.bio && (
                                        <p className="text-muted-foreground mt-2">
                                            {serializedCourse.instructor.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border rounded-xl p-6 sticky top-4">
                            {/* Thumbnail */}
                            {serializedCourse.thumbnailUrl && (
                                <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                                    <Image
                                        src={serializedCourse.thumbnailUrl}
                                        alt={serializedCourse.titleBn}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                {serializedCourse.isFree ? (
                                    <div className="text-3xl font-bold text-green-600">
                                        বিনামূল্যে
                                    </div>
                                ) : (
                                    <div className="text-3xl font-bold">
                                        ৳{serializedCourse.price}
                                    </div>
                                )}
                            </div>

                            {/* Enroll Button */}
                            <EnrollButton
                                courseId={serializedCourse._id}
                                isEnrolled={isEnrolled}
                                isLoggedIn={!!session}
                                isFree={serializedCourse.isFree}
                                price={serializedCourse.price}
                            />

                            {/* Course Includes */}
                            <div className="mt-6 pt-6 border-t space-y-3">
                                <h3 className="font-semibold mb-3">এই কোর্সে রয়েছে:</h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <BookOpen className="h-4 w-4 text-purple-600" />
                                    <span>{serializedCourse.totalLessons} টি ভিডিও পাঠ</span>
                                </div>
                                {serializedCourse.totalDuration && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        <span>{Math.floor(serializedCourse.totalDuration / 60)} মিনিট কন্টেন্ট</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Award className="h-4 w-4 text-purple-600" />
                                    <span>সার্টিফিকেট (সম্পন্ন করার পর)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
