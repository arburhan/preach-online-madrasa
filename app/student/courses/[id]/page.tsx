import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Lesson from '@/lib/db/models/Lesson';
import { BookOpen, Video, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function StudentCoursePage({ params }: PageProps) {
    const user = await requireAuth();
    const { id } = await params;

    if (user.role !== 'student') {
        redirect('/unauthorized');
    }

    await connectDB();

    // Get course details
    const course = await Course.findById(id)
        .populate('instructors', 'name image teacherBio')
        .lean();

    if (!course) {
        redirect('/student');
    }

    // Get lessons for this course
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessons: any[] = await Lesson.find({ course: id })
        .sort({ order: 1 })
        .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedCourse: any = {
        ...course,
        _id: course._id.toString(),
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <Link href="/student" className="text-white/80 hover:text-white mb-4 inline-block">
                        ← ড্যাশবোর্ডে ফিরে যান
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{serializedCourse.titleBn}</h1>
                    <p className="text-white/90">{serializedCourse.descriptionBn}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Lessons */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border rounded-xl p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4">কোর্স কন্টেন্ট</h2>

                            {lessons.length === 0 ? (
                                <div className="text-center py-12">
                                    <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">কোনো পাঠ নেই</h3>
                                    <p className="text-muted-foreground">
                                        শীঘ্রই এই কোর্সে পাঠ যোগ করা হবে
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lessons.map((lesson, index) => (
                                        <Link
                                            key={lesson._id.toString()}
                                            href={`/student/watch/${id}/${lesson._id}`}
                                            className="block"
                                        >
                                            <div className="flex items-center gap-4 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors">
                                                <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <span className="text-primary font-semibold">{index + 1}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{lesson.titleBn}</h3>
                                                    {lesson.descriptionBn && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {lesson.descriptionBn}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{Math.floor((lesson.duration || 0) / 60)} মিনিট</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Course Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border rounded-xl p-6 sticky top-4">
                            {/* Thumbnail */}
                            {serializedCourse.thumbnail && (
                                <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                                    <Image
                                        src={serializedCourse.thumbnail}
                                        alt={serializedCourse.titleBn}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Course Stats */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">ভিডিও পাঠ</p>
                                        <p className="font-semibold">{lessons.length} টি</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">মোট সময়</p>
                                        <p className="font-semibold">
                                            {Math.floor(
                                                lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) / 60
                                            )} মিনিট
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Instructor Info */}
                            {serializedCourse.instructors && serializedCourse.instructors.length > 0 && (
                                <div className="pt-6 border-t">
                                    <h3 className="font-semibold mb-3">উস্তায</h3>
                                    {serializedCourse.instructors.map((instructor: any) => ( // eslint-disable-line
                                        <div key={instructor._id} className="flex items-center gap-3 mb-3">
                                            {instructor.image && (
                                                <Image
                                                    src={instructor.image}
                                                    alt={instructor.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{instructor.name}</p>
                                                {instructor.teacherBio && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {instructor.teacherBio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Start Learning Button */}
                            {lessons.length > 0 && (
                                <Link href={`/student/watch/${id}/${lessons[0]._id}`} className="block mt-6">
                                    <Button className="w-full" size="lg">
                                        <Video className="mr-2 h-5 w-5" />
                                        ক্লাস শুরু করুন
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
