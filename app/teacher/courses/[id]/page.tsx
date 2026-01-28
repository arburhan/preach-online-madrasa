import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import Exam from '@/lib/db/models/Exam';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import CourseEditForm from '@/components/teacher/CourseEditForm';
import LessonList from '@/components/teacher/LessonList';
import ExamList from '@/components/teacher/ExamList';

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

    // Check if user is one of the instructors or admin
    const isAssigned = course.instructors?.some(
        (instructorId: any) => instructorId.toString() === user.id // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    if (!isAssigned && user.role !== 'admin') {
        redirect('/unauthorized');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessons: any[] = await Lesson.find({ course: id })
        .sort({ order: 1 })
        .lean();

    // Fetch exams for this course
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exams: any[] = await Exam.find({ course: id })
        .sort({ createdAt: -1 })
        .lean();

    // Serialize course for client component
    const serializedCourse = {
        _id: course._id.toString(),
        titleBn: course.titleBn,
        titleEn: course.titleEn,
        slug: course.slug,
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

    // Serialize exams
    const serializedExams = exams.map((exam) => ({
        _id: exam._id.toString(),
        titleBn: exam.titleBn,
        type: exam.type,
        totalMarks: exam.totalMarks,
        passMarks: exam.passMarks,
        duration: exam.duration,
        status: exam.status,
        questionsCount: exam.questions?.length || 0,
        hasTiming: exam.hasTiming,
        startTime: exam.startTime?.toISOString(),
        endTime: exam.endTime?.toISOString(),
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
                        <div>
                            <Link href={`/courses/${serializedCourse.slug}`} target="_blank">
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
                <div className="bg-card p-6 rounded-xl border mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">পাঠসমূহ</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {serializedLessons.length} টি পাঠ
                            </p>
                        </div>
                        <div className='space-x-4'>
                            <Link href={`/teacher/courses/${id}/exams/create`}>
                                <Button variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    পরীক্ষা নিন
                                </Button>
                            </Link>
                            <Link href={`/teacher/courses/${id}/lessons/new`}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    নতুন পাঠ যোগ করুন
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <LessonList lessons={serializedLessons} courseId={id} />
                </div>

                {/* Exams Section */}
                <div className="bg-card p-6 rounded-xl border">
                    <div className="mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">পরীক্ষাসমূহ</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {serializedExams.length} টি পরীক্ষা
                            </p>
                        </div>
                    </div>

                    {serializedExams.length > 0 ? (
                        <ExamList exams={serializedExams} courseId={id} />
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-medium">কোনো পরীক্ষা নেই</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                এই কোর্সে এখনো কোনো পরীক্ষা যোগ করা হয়নি
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

