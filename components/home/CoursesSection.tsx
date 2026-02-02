import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Program from '@/lib/db/models/LongCourse';
import CourseCard from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Clock, Tag, Users, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { ObjectId } from 'mongoose';

export default async function CoursesSection() {
    await connectDB();

    // Fetch only 6 published courses for homepage
    const courses = await Course.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

    // Fetch published programs (long courses)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs: any[] = await Program.find({ status: 'published' })
        .sort({ isFeatured: -1, isPopular: -1, order: 1 })
        .limit(6)
        .lean();

    // Manually fetch all teachers
    const Teacher = (await import('@/lib/db/models/Teacher')).default;
    const allInstructorIds = courses.flatMap(c => c.instructors || []);
    const teachers = await Teacher.find({ _id: { $in: allInstructorIds } })
        .select('_id name')
        .lean();

    const teacherMap = new Map(teachers.map(t => [t._id.toString(), t]));

    // Serialize courses (same logic as courses page)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedCourses = courses.map((course: any) => {
        const instructorNames = (course.instructors || [])
            .map((id: ObjectId) => teacherMap.get(id.toString())?.name)
            .filter(Boolean)
            .join(', ') || 'No instructor';

        return {
            _id: course._id.toString(),
            titleBn: course.titleBn,
            titleEn: course.titleEn,
            slug: course.slug || course._id.toString(),
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

    const hasPrograms = programs.length > 0;
    const hasCourses = serializedCourses.length > 0;

    if (!hasPrograms && !hasCourses) {
        return null; // Don't show section if nothing to display
    }

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* Programs Section (Semester-based) */}
                {hasPrograms && (
                    <div className="pb-16">
                        {/* Section Header */}
                        <div className="mb-8 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <GraduationCap className="h-7 w-7 text-primary" />
                                <h2 className="text-3xl md:text-4xl font-bold">
                                    সেমিস্টার ভিত্তিক প্রোগ্রাম
                                </h2>
                            </div>
                            <p className="text-muted-foreground">
                                দীর্ঘমেয়াদী ইসলামিক শিক্ষার জন্য আমাদের সেমিস্টার ভিত্তিক প্রোগ্রাম
                            </p>
                        </div>

                        {/* Programs Grid */}
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

                        {/* See All Programs Button */}
                        <div className="mt-8 text-center">
                            <Link href="/courses">
                                <Button variant="outline" size="lg">
                                    <GraduationCap className="mr-2 h-5 w-5" />
                                    সকল প্রোগ্রাম দেখুন
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Courses Section */}
                {hasCourses && (
                    <>
                        {/* Section Header */}
                        <div className="mb-12">
                            <div className='text-center' >
                                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                    জনপ্রিয় কোর্সসমূহ
                                </h2>
                                <p className="text-muted-foreground">
                                    আমাদের সেরা এবং জনপ্রিয় কোর্সগুলো দেখুন
                                </p>
                            </div>
                        </div>

                        {/* Courses Grid - Reusing CourseCard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {serializedCourses.map((course) => (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    isLoggedIn={false} // Homepage doesn't need session
                                />
                            ))}
                        </div>

                        {/* Mobile "See All" Button */}
                        <div className="mt-8 text-center md:hidden">
                            <Link href="/courses">
                                <Button variant="outline" size="lg" className="w-full">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    সকল কোর্স দেখুন
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
