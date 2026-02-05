import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Program from '@/lib/db/models/LongCourse';
import CourseCard from '@/components/courses/CourseCard';
import ProgramsCard from '@/components/programs/ProgramsCard';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap } from 'lucide-react';
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

    // Serialize programs for ProgramsCard component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedPrograms = programs.map((program: any) => ({
        _id: program._id.toString(),
        titleBn: program.titleBn,
        slug: program.slug,
        thumbnail: program.thumbnail,
        durationMonths: program.durationMonths,
        totalSemesters: program.totalSemesters,
        maleInstructors: program.maleInstructors,
        femaleInstructors: program.femaleInstructors,
        isFree: program.isFree,
        price: program.price,
        discountPrice: program.discountPrice,
        isFeatured: program.isFeatured,
        isPopular: program.isPopular,
    }));

    const hasPrograms = serializedPrograms.length > 0;
    const hasCourses = serializedCourses.length > 0;

    if (!hasPrograms && !hasCourses) {
        return null; // Don't show section if nothing to display
    }

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">

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

                {/* Programs Section (Semester-based) */}
                {hasPrograms && (
                    <div className="pt-16 md:pt-28">
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

                        {/* Programs Grid - Reusing ProgramsCard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {serializedPrograms.map((program) => (
                                <ProgramsCard key={program._id} program={program} />
                            ))}
                        </div>

                        {/* See All Programs Button */}
                        <div className="mt-8 text-center">
                            <Link href="/courses" className='bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary font-medium rounded-lg transition-all duration-300'>
                                <Button variant="outline" size="lg">
                                    <GraduationCap className="mr-2 h-5 w-5" />
                                    সকল প্রোগ্রাম দেখুন
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

