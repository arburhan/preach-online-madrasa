import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import CourseEditForm from '@/components/teacher/CourseEditForm';
import LessonList from '@/components/teacher/LessonList';

export default async function EditCoursePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await requireAuth();

    if (!['teacher', 'admin'].includes(user.role)) {
        redirect('/unauthorized');
    }

    const { id } = await params;

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const course: any = await Course.findById(id).lean();

    if (!course) {
        notFound();
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== user.id && user.role !== 'admin') {
        redirect('/unauthorized');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessons: any[] = await Lesson.find({ course: id })
        .sort({ order: 1 })
        .lean();

    // Serialize course for client component
    const serializedCourse = {
        _id: course._id.toString(),
        titleBn: course.titleBn,
        titleEn: course.titleEn,
        descriptionBn: course.descriptionBn,
        descriptionEn: course.descriptionEn,
        thumbnailUrl: course.thumbnailUrl,
        price: course.price,
        isFree: course.isFree || false,
        level: course.level,
        language: course.language,
        category: course.category,
        tags: course.tags,
        status: course.status || 'draft',
        isPublished: course.isPublished,
        totalLessons: course.totalLessons,
        totalDuration: course.totalDuration,
        studentsEnrolled: course.studentsEnrolled,
        createdAt: course.createdAt?.toISOString(),
        updatedAt: course.updatedAt?.toISOString(),
    };

    // Serialize lessons for client component  
    const serializedLessons = lessons.map((lesson) => ({
        _id: lesson._id.toString(),
        course: lesson.course.toString(),
        titleBn: lesson.titleBn,
        titleEn: lesson.titleEn,
        order: lesson.order,
        isFree: lesson.isFree || false,
        isPublished: lesson.isPublished,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        createdAt: lesson.createdAt?.toISOString(),
        updatedAt: lesson.updatedAt?.toISOString(),
    }));

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/teacher">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            ড্যাশবোর্ডে ফিরে যান
                        </Button>
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{course.titleBn}</h1>
                            <p className="text-muted-foreground mt-1">
                                কোর্স সম্পাদনা এবং পরিচালনা করুন
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/student/browse/${id}`}>
                                <Button variant="outline">প্রিভিউ</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Course Edit Form */}
                <div className="mb-8">
                    <CourseEditForm course={serializedCourse} />
                </div>

                {/* Lessons Section */}
                <div className="bg-card p-6 rounded-xl border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">পাঠসমূহ</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {serializedLessons.length} টি পাঠ
                            </p>
                        </div>
                        <Link href={`/teacher/courses/${id}/lessons/new`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                নতুন পাঠ যোগ করুন
                            </Button>
                        </Link>
                    </div>

                    <LessonList lessons={serializedLessons} courseId={id} />
                </div>
            </div>
        </div>
    );
}
