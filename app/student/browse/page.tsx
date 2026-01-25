import { requireAuth } from '@/lib/auth/rbac';
import connectDB from '@/lib/db/mongodb';
import Course from '@/lib/db/models/Course';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Users } from 'lucide-react';
import { ObjectId } from 'mongoose';

export default async function BrowseCoursesPage() {
    await requireAuth();
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courses: any[] = await Course.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .lean();

    // Manually fetch all teachers
    const Teacher = (await import('@/lib/db/models/Teacher')).default;
    const allInstructorIds = courses.flatMap(c => c.instructors || []);
    const teachers = await Teacher.find({ _id: { $in: allInstructorIds } })
        .select('_id name image')
        .lean();

    const teacherMap = new Map(teachers.map(t => [t._id.toString(), t]));

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">কোর্স ব্রাউজ করুন</h1>
                    <p className="text-muted-foreground">
                        আপনার পছন্দের কোর্স খুঁজুন এবং শিক্ষার যাত্রা শুরু করুন
                    </p>
                </div>

                {/* Course Grid */}
                {courses.length === 0 ? (
                    <div className="bg-card p-12 rounded-xl border text-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">কোনো কোর্স পাওয়া যায়নি</h3>
                        <p className="text-muted-foreground">শীঘ্রই নতুন কোর্স যুক্ত করা হবে</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course._id.toString()}
                                className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {course.thumbnail && (
                                    <Image
                                        src={course.thumbnail}
                                        alt={course.titleBn}
                                        width={400}
                                        height={192}
                                        className="w-full h-48 object-cover"
                                    />
                                )}

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{course.titleBn}</h3>
                                            {course.level && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                    {course.level === 'beginner' && 'শুরুর স্তর'}
                                                    {course.level === 'intermediate' && 'মধ্যম স্তর'}
                                                    {course.level === 'advanced' && 'উন্নত স্তর'}
                                                </span>
                                            )}
                                        </div>
                                    </div>


                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{course.totalLessons} টি পাঠ</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{course.enrolledCount} জন শিক্ষার্থী</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                                        <Image
                                            src={(course.instructors?.[0] && teacherMap.get(course.instructors[0].toString())?.image) || '/placeholder-avatar.png'}
                                            alt="Instructor"
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {course.instructors?.map((id: ObjectId) => teacherMap.get(id.toString())?.name).filter(Boolean).join(', ') || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">প্রশিক্ষক</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            {course.isFree ? (
                                                <span className="text-lg font-bold text-green-600">বিনামূল্যে</span>
                                            ) : (
                                                <span className="text-lg font-bold text-primary">৳{course.price}</span>
                                            )}
                                        </div>
                                        <Link href={`/student/browse/${course._id}`}>
                                            <Button>বিস্তারিত দেখুন</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
