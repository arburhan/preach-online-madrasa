import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import '@/lib/db/models/Teacher';

import { BookOpen, Users, Video, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ObjectId } from 'mongoose';

interface CourseData {
    _id: { toString: () => string };
    titleBn: string;
    titleEn?: string;
    descriptionBn?: string;
    thumbnail?: string;
    status: 'published' | 'draft';
    isFree: boolean;
    level: 'beginner' | 'intermediate' | 'advanced';
    language: 'bn' | 'ar' | 'multi';
    totalLessons: number;
    enrolledCount: number;
    createdAt: Date;
    instructor: { name: string; email: string }[];
}

export default async function AdminCoursesPage() {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'admin') {
        redirect('/');
    }

    await connectDB();

    // Get all courses
    const coursesData = await Course.find()
        .sort({ createdAt: -1 })
        .lean();

    // Manually fetch all teachers to avoid populate issues
    const Teacher = (await import('@/lib/db/models/Teacher')).default;
    const allInstructorIds = coursesData.flatMap(c => c.instructors || []);
    const teachers = await Teacher.find({ _id: { $in: allInstructorIds } })
        .select('_id name email')
        .lean();

    // Create a map for quick lookup
    const teacherMap = new Map(teachers.map(t => [t._id.toString(), t]));

    // Serialize courses with instructor data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courses: CourseData[] = coursesData.map((course: any) => {
        // Get instructor details from map
        const instructorDetails = (course.instructors || [])
            .map((id: ObjectId) => teacherMap.get(id.toString()))
            .filter(Boolean);

        return {
            _id: course._id,
            titleBn: course.titleBn,
            titleEn: course.titleEn || '',
            descriptionBn: course.descriptionBn || '',
            thumbnail: course.thumbnail || '',
            status: course.status,
            isFree: course.isFree,
            price: course.price || 0,
            level: course.level || 'beginner',
            language: course.language || 'bn',
            totalLessons: course.totalLessons || 0,
            enrolledCount: course.enrolledCount || 0,
            createdAt: course.createdAt,
            instructor: instructorDetails,
        };
    });


    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">কোর্স ব্যবস্থাপনা</h1>
                    <p className="text-muted-foreground mt-2">
                        সকল কোর্স দেখুন এবং পরিচালনা করুন
                    </p>
                </div>
                <Link href="/admin/courses/new">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        নতুন কোর্স তৈরি করুন
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">মোট কোর্স</p>
                    <p className="text-2xl font-bold">{courses.length}</p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">প্রকাশিত</p>
                    <p className="text-2xl font-bold">
                        {courses.filter((c) => c.status === 'published').length}
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">খসড়া</p>
                    <p className="text-2xl font-bold">
                        {courses.filter((c) => c.status === 'draft').length}
                    </p>
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">মোট নথিভুক্তি</p>
                    <p className="text-2xl font-bold">
                        {courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <div
                            key={course._id.toString()}
                            className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Thumbnail */}
                            {course.thumbnail ? (
                                <div className="relative h-48 w-full bg-muted">
                                    <Image
                                        src={course.thumbnail}
                                        alt={course.titleBn}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 w-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                    <BookOpen className="h-16 w-16 text-white/50" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4">
                                {/* Status Badge */}
                                <div className="flex items-center justify-between mb-2">
                                    <Badge
                                        variant={course.status === 'published' ? 'default' : 'secondary'}
                                        className={
                                            course.status === 'published'
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : ''
                                        }
                                    >
                                        {course.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                                    </Badge>
                                    {course.isFree && (
                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                            বিনামূল্যে
                                        </Badge>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                                    {course.titleBn}
                                </h3>

                                {/* Instructors */}
                                <p className="text-sm text-muted-foreground mb-3">
                                    উস্তায: {Array.isArray(course.instructor)
                                        ? course.instructor.map((i: any) => i?.name).filter(Boolean).join(', ') || 'Unknown' // eslint-disable-line
                                        : course?.instructor || 'Unknown'}
                                </p>

                                {/* Meta Info */}
                                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1">
                                        <Video className="h-3 w-3" />
                                        <span>{course.totalLessons || 0} পাঠ</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{course.enrolledCount || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(course.createdAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    <Badge variant="outline" className="text-xs">
                                        {course.level === 'beginner' ? 'প্রাথমিক' : course.level === 'intermediate' ? 'মধ্যম' : 'উন্নত'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {course.language === 'bn' ? 'বাংলা' : course.language === 'ar' ? 'আরবি' : 'বহুভাষিক'}
                                    </Badge>
                                </div>

                                {/* Actions */}
                                <Link
                                    href={`/teacher/courses/${course._id.toString()}`}
                                    className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                >
                                    বিস্তারিত দেখুন
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-card rounded-xl border p-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">কোনো কোর্স নেই</h3>
                        <p className="text-muted-foreground mt-2">
                            এখনও কোনো কোর্স তৈরি হয়নি
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
