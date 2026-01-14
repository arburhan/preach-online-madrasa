import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import User from '@/lib/db/models/User';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BookOpen, Users, Award, CheckCircle2 } from 'lucide-react';
import EnrollButton from '@/components/courses/EnrollButton';

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await requireAuth();
    const { id } = await params;

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const course: any = await Course.findById(id)
        .populate('instructors', 'name image teacherBio teacherQualifications')
        .lean();

    if (!course) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessons: any[] = await Lesson.find({ course: id })
        .sort({ order: 1 })
        .select('-videoKey')
        .lean();

    // Check if user is enrolled
    const enrolledUser = await User.findById(user.id).select('enrolledCourses');

    // Support both old format (ObjectId) and new format ({course, lastWatchedLesson, enrolledAt})
    const isEnrolled = enrolledUser?.enrolledCourses?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => {
            // Old format: e is just an ObjectId
            if (e?.toString && typeof e.toString === 'function' && !e.course) {
                return e.toString() === id;
            }
            // New format: e is an object with course property
            return e?.course?.toString() === id;
        }
    ) || false;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Header */}
                        <div>
                            {course.thumbnail && (
                                <Image
                                    src={course.thumbnail}
                                    alt={course.titleBn}
                                    width={800}
                                    height={256}
                                    className="w-full h-64 object-cover rounded-xl mb-6"
                                />
                            )}
                            <h1 className="text-4xl font-bold mb-4">{course.titleBn}</h1>
                            {course.titleEn && (
                                <h2 className="text-xl text-muted-foreground mb-4">{course.titleEn}</h2>
                            )}
                            <p className="text-lg text-muted-foreground">{course.descriptionBn}</p>
                        </div>

                        {/* What You'll Learn */}
                        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                            <div className="bg-card p-6 rounded-xl border">
                                <h3 className="text-xl font-bold mb-4">আপনি যা শিখবেন</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {course.whatYouWillLearn.map((item: string, index: number) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Course Content */}
                        <div className="bg-card p-6 rounded-xl border">
                            <h3 className="text-xl font-bold mb-4">কোর্সের বিষয়বস্তু</h3>
                            <div className="space-y-2">
                                {lessons.map((lesson, index: number) => (
                                    <div
                                        key={lesson._id.toString()}
                                        className="flex items-center justify-between p-4 rounded-lg hover:bg-green-300 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium">{lesson.titleBn}</p>
                                                {lesson.duration && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {Math.floor(lesson.duration / 60)} মিনিট
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {lesson.isFree && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                                                বিনামূল্যে
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Requirements */}
                        {course.requirements && course.requirements.length > 0 && (
                            <div className="bg-card p-6 rounded-xl border">
                                <h3 className="text-xl font-bold mb-4">প্রয়োজনীয়তা</h3>
                                <ul className="space-y-2">
                                    {course.requirements.map((req: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-card p-6 rounded-xl border sticky top-4 space-y-6">
                            {/* Price */}
                            <div>
                                {course.isFree ? (
                                    <div className="text-3xl font-bold text-green-600">বিনামূল্যে</div>
                                ) : (
                                    <div className="text-3xl font-bold text-primary">৳{course.price}</div>
                                )}
                            </div>

                            {/* Enroll Button */}
                            <EnrollButton
                                courseId={id}
                                isEnrolled={isEnrolled}
                                isFree={course.isFree}
                                price={course.price}
                            />

                            {/* Course Stats */}
                            <div className="space-y-3 pt-6 border-t">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm">{course.totalLessons} টি পাঠ</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm">{course.enrolledCount} জন শিক্ষার্থী</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm">সার্টিফিকেট অন্তর্ভুক্ত</span>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div className="pt-6 border-t">
                                <h4 className="font-semibold mb-3">প্রশিক্ষক</h4>
                                {course.instructors && course.instructors.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={course.instructors[0]?.image || '/placeholder-avatar.png'}
                                            alt={course.instructors[0]?.name || 'Instructor'}
                                            width={48}
                                            height={48}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium">{course.instructors[0]?.name}</p>
                                            {course.instructors[0]?.teacherQualifications && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {course.instructors[0].teacherQualifications}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
