import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Program from '@/lib/db/models/LongCourse';
import '@/lib/db/models/Teacher'; // For populate
import { BookOpen, GraduationCap } from 'lucide-react';
import CourseCard from '@/components/courses/CourseCard';
import ProgramsCard from '@/components/programs/ProgramsCard';
import { ObjectId } from 'mongoose';

export default async function PublicCoursesPage() {
    await connectDB();

    // Get current session (if any)
    const session = await auth();

    // Fetch all published courses
    const courses = await Course.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .lean();

    // Manually fetch all teachers
    const Teacher = (await import('@/lib/db/models/Teacher')).default;
    const allInstructorIds = courses.flatMap(c => c.instructors || []);
    const teachers = await Teacher.find({ _id: { $in: allInstructorIds } })
        .select('_id name')
        .lean();

    const teacherMap = new Map(teachers.map(t => [t._id.toString(), t]));

    // Fetch published programs (long courses)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs: any[] = await Program.find({ status: 'published' })
        .sort({ isFeatured: -1, isPopular: -1, order: 1 })
        .lean();

    // Serialize courses
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
            slug: course.slug,
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

    // Serialize programs for client component
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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-linear-to-br from-[#3fdaa6] via-[#b3f2d4] to-[#3fdaa6] py-16 ">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">সকল কোর্স ও প্রোগ্রাম</h1>
                    <p className="md:text-lg text-blue-950">
                        ইসলামিক শিক্ষার জন্য আমাদের সেরা কোর্স ও সেমিস্টার ভিত্তিক প্রোগ্রাম
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Programs Section (Long Courses) */}
                {serializedPrograms.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold">সেমিস্টার ভিত্তিক প্রোগ্রাম</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {serializedPrograms.map((program) => (
                                <ProgramsCard key={program._id} program={program} />
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
