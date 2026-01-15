import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Program from '@/lib/db/models/LongCourse';
import '@/lib/db/models/User'; // For populate
import { BookOpen, GraduationCap, Clock, Tag, Users, ArrowRight, Star } from 'lucide-react';
import CourseCard from '@/components/courses/CourseCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function PublicCoursesPage() {
    await connectDB();

    // Get current session (if any)
    const session = await auth();

    // Fetch all published courses
    const courses = await Course.find({ status: 'published' })
        .populate('instructors', 'name')
        .sort({ createdAt: -1 })
        .lean();

    // Fetch published programs (long courses)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs: any[] = await Program.find({ status: 'published' })
        .sort({ isFeatured: -1, isPopular: -1, order: 1 })
        .lean();

    // Serialize courses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedCourses = courses.map((course: any) => {
        const instructorsData = Array.isArray(course.instructors) ? course.instructors : [];
        const instructorNames = instructorsData
            .map((inst: { name?: string }) => inst?.name || 'Unknown')
            .filter(Boolean)
            .join(', ') || 'No instructor';

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
            <div className="py-16 bg-linear-to-r from-purple-600 to-indigo-700 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">সকল কোর্স ও প্রোগ্রাম</h1>
                    <p className="md:text-lg text-purple-100">
                        ইসলামিক শিক্ষার জন্য আমাদের সেরা কোর্স ও সেমিস্টার ভিত্তিক প্রোগ্রাম
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Programs Section (Long Courses) */}
                {programs.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold">সেমিস্টার ভিত্তিক প্রোগ্রাম</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {programs.map((program) => (
                                <div
                                    key={program._id.toString()}
                                    className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-40 bg-linear-to-br from-purple-500 to-indigo-600 relative">
                                        {program.thumbnail ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={program.thumbnail}
                                                alt={program.titleBn}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <GraduationCap className="h-16 w-16 text-white/30" />
                                            </div>
                                        )}
                                        {program.isFeatured && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-white" />
                                                ফিচার্ড
                                            </span>
                                        )}
                                        {program.isPopular && (
                                            <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                                                জনপ্রিয়
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2">{program.titleBn}</h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {program.descriptionBn}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {program.durationMonths} মাস
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <GraduationCap className="h-4 w-4" />
                                                {program.totalSemesters} সেমিস্টার
                                            </span>
                                        </div>

                                        {/* Instructors */}
                                        <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span className="text-blue-600">{program.maleInstructors?.length || 0} পুরুষ</span>
                                            <span className="text-pink-600">{program.femaleInstructors?.length || 0} মহিলা</span>
                                            শিক্ষক
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between pt-3 border-t">
                                            <div className="flex items-center gap-1">
                                                <Tag className="h-4 w-4 text-primary" />
                                                {program.isFree ? (
                                                    <span className="text-green-600 font-bold">বিনামূল্যে</span>
                                                ) : (
                                                    <span className="font-bold">
                                                        {program.discountPrice ? (
                                                            <>
                                                                <span className="line-through text-muted-foreground text-sm mr-1">
                                                                    ৳{program.price}
                                                                </span>
                                                                ৳{program.discountPrice}
                                                            </>
                                                        ) : (
                                                            <>৳{program.price}</>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <Link href={`/programs/${program.slug || program._id}`}>
                                                <Button size="sm">
                                                    বিস্তারিত
                                                    <ArrowRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Regular Courses Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">সাধারণ কোর্স</h2>
                    </div>

                    {serializedCourses.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-xl border">
                            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">কোনো কোর্স পাওয়া যায়নি</h3>
                            <p className="text-muted-foreground">
                                শীঘ্রই নতুন কোর্স যোগ করা হবে
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-muted-foreground">
                                    {serializedCourses.length} টি কোর্স পাওয়া গেছে
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {serializedCourses.map((course) => (
                                    <CourseCard
                                        key={course._id}
                                        course={course}
                                        isLoggedIn={!!session}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
