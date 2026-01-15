import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import '@/lib/db/models/Teacher';
import { BookOpen } from 'lucide-react';
import CourseCard from '@/components/courses/CourseCard';
import { ObjectId } from 'mongoose';

export default async function Courses() {
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

    // Serialize courses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedCourses = courses.map((course: any) => {
        // Get instructor names from map
        const instructorNames = (course.instructors || [])
            .map((id: ObjectId) => teacherMap.get(id.toString())?.name)
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
            <div className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">আমাদের কোর্স সমুহ</h1>
                    <p className=" md:text-lg">
                        ইসলামিক শিক্ষার জন্য আমাদের সেরা কোর্সগুলো ব্রাউজ করুন
                    </p>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="container mx-auto px-4 py-6">
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
            </div>
        </div>
    );
}
