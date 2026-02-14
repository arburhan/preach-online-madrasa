import { Metadata } from 'next';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import Student from '@/lib/db/models/Student';
import '@/lib/db/models/Teacher';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BookOpen, Clock, Users, Award } from 'lucide-react';
import EnrollButton from '@/components/courses/EnrollButton';
import LexicalRenderer from '@/components/editor/LexicalRenderer';
import { CourseJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { seoUrl, SITE_NAME } from '@/lib/seo';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let course: any = await Course.findOne({ slug, status: 'published' }).lean();
    if (!course) {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
        if (isValidObjectId) {
            course = await Course.findOne({ _id: slug, status: 'published' }).lean();
        }
    }

    if (!course) {
        return { title: 'কোর্স পাওয়া যায়নি' };
    }

    const title = course.titleBn || course.titleEn;
    const description = typeof course.descriptionBn === 'string'
        ? course.descriptionBn.substring(0, 160).replace(/[{}"]/g, '')
        : '';

    return {
        title,
        description,
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url: seoUrl(`/courses/${course.slug}`),
            type: 'website',
            ...(course.thumbnail ? { images: [{ url: course.thumbnail, width: 1200, height: 630, alt: title }] } : {}),
        },
        alternates: {
            canonical: seoUrl(`/courses/${course.slug}`),
        },
    };
}

export default async function CourseDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const session = await auth();

    await connectDB();

    // Fetch course details by slug
    let course = await Course.findOne({ slug }).lean();

    // Fallback: If not found by slug, try finding by ID (for legacy support)
    if (!course) {
        // Check if slug is a valid ObjectId
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
        if (isValidObjectId(slug)) {
            course = await Course.findById(slug).lean();
        }
    }

    if (!course || course.status !== 'published') {
        notFound();
    }

    // Manually fetch instructors
    const Teacher = (await import('@/lib/db/models/Teacher')).default;
    const instructors = await Teacher.find({ _id: { $in: course.instructors || [] } })
        .select('_id name bio')
        .lean();

    const instructorsData = instructors.map(t => ({
        _id: t._id,
        name: t.name,
        bio: t.bio || ''
    }));

    // Fetch lessons count
    const lessonsCount = await Lesson.countDocuments({ course: course._id });

    // Check if user is enrolled
    let isEnrolled = false;
    if (session?.user?.id && session.user.role === 'student') {
        const student = await Student.findById(session.user.id).select('enrolledCourses').lean();
        // Support both old format (ObjectId) and new format ({course, lastWatchedLesson, enrolledAt})
        isEnrolled = student?.enrolledCourses?.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (e: any) => {
                // Old format: e is just an ObjectId
                if (e?.toString && typeof e.toString === 'function' && !e.course) {
                    return e.toString() === course._id.toString();
                }
                // New format: e is an object with course property
                return e?.course?.toString() === course._id.toString();
            }
        ) || false;
    } else if (session?.user && (session.user.role === 'admin' || session.user.role === 'teacher')) {
        // Admins and teachers (instructors) generally have access, but for "isEnrolled" UI state (e.g. button), 
        // we might validly say false unless we want to show "Go to Course" for them too.
        // For now, let's keep it false for enrollment check unless we check if teacher is the instructor.
        // The original code only checked User.enrolledCourses.
        // If the intention is to show "Start Learning" button, maybe we don't need it for admins in this view.
        // Let's stick to Student enrollment for now.
        isEnrolled = false;
    }

    // Serialize course
    const courseData = course as any; // eslint-disable-line @typescript-eslint/no-explicit-any

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
            bio: primaryInstructor?.bio || '',
        },
    };

    return (
        <>
            <CourseJsonLd
                name={serializedCourse.titleBn}
                description={serializedCourse.descriptionBn?.substring(0, 200) || ''}
                url={seoUrl(`/courses/${slug}`)}
                image={serializedCourse.thumbnailUrl}
                isFree={serializedCourse.isFree}
                price={serializedCourse.price}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: 'হোম', url: seoUrl('/') },
                    { name: 'কোর্স', url: seoUrl('/courses') },
                    { name: serializedCourse.titleBn, url: seoUrl(`/courses/${slug}`) },
                ]}
            />
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
                                <h2 className="text-2xl font-bold mb-4 text-yellow-600">কোর্স সম্পর্কে</h2>
                                <LexicalRenderer content={serializedCourse.descriptionBn} />
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
                            <div className="bg-card border rounded-xl p-6 sticky top-4 space-y-6">
                                {/* Thumbnail */}
                                {serializedCourse.thumbnailUrl && (
                                    <div className="relative h-48 rounded-lg overflow-hidden">
                                        <Image
                                            src={serializedCourse.thumbnailUrl}
                                            alt={serializedCourse.titleBn}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                {/* Price */}
                                <div>
                                    {serializedCourse.isFree ? (
                                        <div className="text-3xl font-bold text-green-600">
                                            বিনামূল্যে
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold text-purple-600">
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

                                {/* Course Info Cards */}
                                <div className="pt-6 border-t space-y-4">
                                    <h3 className="font-semibold text-lg mb-3">এই কোর্সে রয়েছে:</h3>

                                    {/* Lessons Count */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">ভিডিও পাঠ</p>
                                            <p className="font-semibold">{serializedCourse.totalLessons} টি</p>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    {serializedCourse.totalDuration && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">মোট সময়</p>
                                                <p className="font-semibold">{Math.floor(serializedCourse.totalDuration / 60)} মিনিট</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Students Enrolled */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">এনরোল করেছেন</p>
                                            <p className="font-semibold">{serializedCourse.studentsEnrolled} জন</p>
                                        </div>
                                    </div>

                                    {/* Certificate */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                            <Award className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">সার্টিফিকেট</p>
                                            <p className="font-semibold">সম্পন্ন করার পর</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
