import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CourseStatisticsClient from '@/components/teacher/CourseStatisticsClient';

export default async function CourseStatisticsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/signin');
    }

    if (!['teacher', 'admin'].includes(session.user.role)) {
        redirect('/');
    }

    const { id: courseId } = await params;
    await connectDB();

    const course = await Course.findById(courseId).lean();

    if (!course) {
        notFound();
    }

    // Check if teacher owns the course
    const isInstructor = course.instructors?.some(
        (instructorId) => instructorId.toString() === session.user.id
    );

    if (!isInstructor && session.user.role !== 'admin') {
        redirect('/teacher/courses');
    }

    return (
        <div className="container max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <Link href={`/teacher/courses/${courseId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        কোর্সে ফিরে যান
                    </Button>
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">কোর্স পরিসংখ্যান</h1>
                <p className="text-muted-foreground">
                    {course.titleBn} - সকল পরীক্ষার সামগ্রিক পরিসংখ্যান
                </p>
            </div>

            <CourseStatisticsClient
                courseId={courseId}
                courseName={course.titleBn || ''}
            />
        </div>
    );
}
