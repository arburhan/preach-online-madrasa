import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import CourseCard from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function CoursesSection() {
    await connectDB();

    // Fetch only 6 published courses for homepage
    const courses = await Course.find({ status: 'published' })
        .populate('instructors', 'name')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

    // Serialize courses (same logic as courses page)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedCourses = courses.map((course: any) => {
        const instructorsData = Array.isArray(course.instructors) ? course.instructors : [];
        const instructorNames = instructorsData
            .map((inst: any) => inst?.name || 'Unknown') // eslint-disable-line
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

    if (serializedCourses.length === 0) {
        return null; // Don't show section if no courses
    }

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
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
            </div>
        </section>
    );
}
