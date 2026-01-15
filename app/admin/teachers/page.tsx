import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import Teacher from '@/lib/db/models/Teacher';
import Course from '@/lib/db/models/Course';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeacherApprovalCard } from '@/components/admin/TeacherApprovalCard';
import { Check, X, BookOpen, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PendingTeacher {
    _id: { toString: () => string };
    name: string;
    email: string;
    mobileNumber?: string;
    gender: 'male' | 'female';
    fatherName?: string;
    motherName?: string;
    address?: string;
    qualifications?: string;
    createdAt: Date;
}

interface ApprovedTeacher {
    _id: { toString: () => string };
    name: string;
    email: string;
    gender: 'male' | 'female';
    mobileNumber?: string;
    qualifications?: string;
    courseCount: number;
    publishedCount: number;
    createdAt: Date;
}

export default async function TeachersAdminPage() {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'admin') {
        redirect('/');
    }

    await connectDB();

    // Get pending teachers
    const pendingTeachersData = await Teacher.find({
        isApproved: false,
    })
        .sort({ createdAt: -1 })
        .lean();
    const pendingTeachers = pendingTeachersData as unknown as PendingTeacher[];

    // Get approved teachers with their course counts
    const approvedTeachersData = await Teacher.aggregate([
        { $match: { isApproved: true } },
        {
            $lookup: {
                from: 'courses',
                localField: '_id',
                foreignField: 'instructor',
                as: 'courses',
            },
        },
        {
            $addFields: {
                courseCount: { $size: '$courses' },
                publishedCount: {
                    $size: {
                        $filter: {
                            input: '$courses',
                            as: 'course',
                            cond: { $eq: ['$$course.status', 'published'] },
                        },
                    },
                },
            },
        },
        { $sort: { createdAt: -1 } },
    ]);
    const approvedTeachers = approvedTeachersData as ApprovedTeacher[];

    // Get student counts for approved teachers
    const teacherIds = approvedTeachers.map((t) => t._id);
    const courseStats = await Course.aggregate([
        { $match: { instructor: { $in: teacherIds }, status: 'published' } },
        { $group: { _id: '$instructor', totalStudents: { $sum: '$enrolledCount' } } },
    ]);

    const studentCountMap = Object.fromEntries(
        courseStats.map((stat) => [stat._id.toString(), stat.totalStudents || 0])
    );

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">শিক্ষক ব্যবস্থাপনা</h1>
                <p className="text-muted-foreground mt-2">
                    শিক্ষক অনুমোদন এবং পরিচালনা
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="pending" className="gap-2">
                        <Clock className="h-4 w-4" />
                        অপেক্ষমাণ ({pendingTeachers.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="gap-2">
                        <Check className="h-4 w-4" />
                        অনুমোদিত ({approvedTeachers.length})
                    </TabsTrigger>
                </TabsList>

                {/* Pending Teachers */}
                <TabsContent value="pending" className="space-y-4">
                    {pendingTeachers.length > 0 ? (
                        pendingTeachers.map((teacher: PendingTeacher) => (
                            <TeacherApprovalCard
                                key={teacher._id.toString()}
                                teacher={JSON.parse(JSON.stringify(teacher))}
                            />
                        ))
                    ) : (
                        <div className="bg-card rounded-xl border p-12 text-center">
                            <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">কোনো অপেক্ষমাণ শিক্ষক নেই</h3>
                            <p className="text-muted-foreground mt-2">
                                সকল শিক্ষক অনুমোদন পেয়েছেন
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Approved Teachers */}
                <TabsContent value="approved" className="space-y-4">
                    {approvedTeachers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {approvedTeachers.map((teacher: ApprovedTeacher) => (
                                <div
                                    key={teacher._id.toString()}
                                    className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">{teacher.name}</h3>
                                                <Badge variant="outline" className={teacher.gender === 'male' ? 'border-blue-500 text-blue-600' : 'border-pink-500 text-pink-600'}>
                                                    {teacher.gender === 'male' ? 'পুরুষ' : 'মহিলা'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                            {teacher.mobileNumber && (
                                                <p className="text-sm text-muted-foreground">
                                                    মোবাইল: {teacher.mobileNumber}
                                                </p>
                                            )}
                                            {teacher.qualifications && (
                                                <p className="text-sm mt-2">
                                                    <span className="font-medium">যোগ্যতা:</span> {teacher.qualifications}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                অনুমোদিত
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                                                <BookOpen className="h-4 w-4" />
                                                <span className="text-xs">মোট কোর্স</span>
                                            </div>
                                            <p className="text-2xl font-bold">{teacher.courseCount || 0}</p>
                                        </div>
                                        <div className="text-center border-l">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                                                <Check className="h-4 w-4" />
                                                <span className="text-xs">প্রকাশিত</span>
                                            </div>
                                            <p className="text-2xl font-bold">{teacher.publishedCount || 0}</p>
                                        </div>
                                        <div className="text-center border-l">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                                                <Users className="h-4 w-4" />
                                                <span className="text-xs">শিক্ষার্থী</span>
                                            </div>
                                            <p className="text-2xl font-bold">
                                                {studentCountMap[teacher._id.toString()] || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Join Date */}
                                    <p className="text-xs text-muted-foreground mt-4">
                                        যোগদান: {new Date(teacher.createdAt).toLocaleDateString('bn-BD')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border p-12 text-center">
                            <X className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">কোনো অনুমোদিত শিক্ষক নেই</h3>
                            <p className="text-muted-foreground mt-2">
                                এখনও কোনো শিক্ষক অনুমোদন পাননি
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
