import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Exam from '@/lib/db/models/Exam';
import Course from '@/lib/db/models/Course';
import ExamManagementClient from '@/components/teacher/ExamManagementClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function ExamManagePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id: examId } = await params;

    // Check authentication
    if (!session?.user) {
        redirect('/auth/signin');
    }

    // Check if user is teacher
    if (session.user.role !== 'teacher') {
        redirect('/');
    }

    await connectDB();

    // Fetch exam first to get course ID
    const exam = await Exam.findById(examId).lean();
    if (!exam) {
        notFound();
    }

    const courseId = exam.course?.toString();
    if (!courseId) {
        notFound();
    }

    // Fetch course
    const course = await Course.findById(courseId).lean();
    if (!course) {
        notFound();
    }

    // Check if teacher owns the course (is one of the instructors)
    const isInstructor = course.instructors?.some(
        (instructorId) => instructorId.toString() === session.user.id
    );

    if (!isInstructor) {
        redirect('/teacher/courses');
    }

    const serializedExam = {
        _id: exam._id.toString(),
        titleBn: exam.titleBn,
        status: exam.status,
    };

    const serializedCourse = {
        _id: course._id.toString(),
        titleBn: course.titleBn,
    };

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

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{serializedExam.titleBn}</h1>
                <p className="text-muted-foreground">
                    কোর্স: {serializedCourse.titleBn}
                </p>
            </div>

            <ExamManagementClient
                exam={serializedExam}
                course={serializedCourse}
            />
        </div>
    );
}
