import connectDB from '@/lib/db/mongodb';
import Teacher from '@/lib/db/models/Teacher';
import Course from '@/lib/db/models/Course';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, GraduationCap, Award, Mail } from 'lucide-react';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function TeacherDetailPage({ params }: PageProps) {
    const { id } = await params;

    await connectDB();

    // Fetch teacher details
    const teacher = await Teacher.findById(id)
        .select('name email image bio qualifications gender isApproved')
        .lean();

    if (!teacher || !teacher.isApproved) {
        notFound();
    }

    // Fetch teacher's courses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courses: any[] = await Course.find({
        instructors: id,
        status: 'published'
    })
        .select('titleBn thumbnail price isFree enrolledStudents')
        .lean();

    // Serialize data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedTeacher: any = {
        ...teacher,
        _id: teacher._id.toString(),
    };

    const serializedCourses = courses.map((course) => ({
        _id: course._id.toString(),
        titleBn: course.titleBn,
        thumbnail: course.thumbnail,
        price: course.price,
        isFree: course.isFree,
        enrolledStudents: course.enrolledStudents || 0,
    }));

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <Link
                        href="/teachers"
                        className="text-white/80 hover:text-white mb-4 inline-block"
                    >
                        ← সকল উস্তায
                    </Link>

                    <div className="flex flex-col md:flex-row items-center gap-8 mt-6">
                        {/* Teacher Image */}
                        <div className="relative w-32 h-32 md:w-40 md:h-40">
                            {serializedTeacher.image ? (
                                <Image
                                    src={serializedTeacher.image}
                                    alt={serializedTeacher.name}
                                    fill
                                    className="rounded-full object-cover ring-8 ring-white/20"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-6xl font-bold ring-8 ring-white/20">
                                    {serializedTeacher.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Teacher Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {serializedTeacher.name}
                            </h1>
                            {serializedTeacher.qualifications && (
                                <p className="text-lg text-white/90 mb-3">
                                    {serializedTeacher.qualifications}
                                </p>
                            )}
                            {serializedTeacher.email && (
                                <div className="flex items-center gap-2 text-white/80 justify-center md:justify-start">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">{serializedTeacher.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Bio Section */}
                    {serializedTeacher.bio && (
                        <div className="bg-card border rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <GraduationCap className="h-5 w-5 text-purple-600" />
                                <h2 className="text-2xl font-bold">পরিচিতি</h2>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {serializedTeacher.bio}
                            </p>
                        </div>
                    )}

                    {/* Courses Section */}
                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                            <h2 className="text-2xl font-bold">পরিচালিত কোর্সসমূহ</h2>
                            <span className="text-sm text-muted-foreground">
                                ({serializedCourses.length} টি কোর্স)
                            </span>
                        </div>

                        {serializedCourses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>এই উস্তায এখনো কোনো কোর্স পরিচালনা করছেন না</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {serializedCourses.map((course) => (
                                    <Link
                                        key={course._id}
                                        href={`/courses/${course._id}`}
                                        className="block border rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all"
                                    >
                                        {course.thumbnail && (
                                            <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                                                <Image
                                                    src={course.thumbnail}
                                                    alt={course.titleBn}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <h3 className="font-semibold mb-2 line-clamp-2">
                                            {course.titleBn}
                                        </h3>
                                        <div className="flex items-center justify-between text-sm">
                                            {course.isFree ? (
                                                <span className="text-green-600 font-semibold">বিনামূল্যে</span>
                                            ) : (
                                                <span className="text-purple-600 font-semibold">৳{course.price}</span>
                                            )}
                                            <span className="text-muted-foreground">
                                                {course.enrolledStudents} জন
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card border rounded-xl p-6 text-center">
                            <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                            <div className="text-2xl font-bold">{serializedCourses.length}</div>
                            <div className="text-sm text-muted-foreground">মোট কোর্স</div>
                        </div>
                        <div className="bg-card border rounded-xl p-6 text-center">
                            <BookOpen className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                            <div className="text-2xl font-bold">
                                {serializedCourses.reduce((acc, c) => acc + c.enrolledStudents, 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">মোট শিক্ষার্থী</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
