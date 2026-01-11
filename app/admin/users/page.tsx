import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users as UsersIcon, GraduationCap, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StudentUser {
    _id: { toString: () => string };
    name: string;
    email: string;
    gender?: 'male' | 'female';
    enrolledCourses?: { length: number };
    createdAt: Date;
}

interface TeacherUser {
    _id: { toString: () => string };
    name: string;
    email: string;
    teacherQualifications?: string;
    createdAt: Date;
}

interface AdminUser {
    _id: { toString: () => string };
    name: string;
    email: string;
    createdAt: Date;
}

export default async function UsersAdminPage() {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'admin') {
        redirect('/');
    }

    await connectDB();

    // Get all users with enrollment data
    const studentsData = await User.find({ role: 'student' })
        .select('name email gender enrolledCourses createdAt')
        .sort({ createdAt: -1 })
        .lean();
    const students = studentsData as unknown as StudentUser[];

    const teachersData = await User.find({ role: 'teacher', isTeacherApproved: true })
        .select('name email teacherQualifications createdAt')
        .sort({ createdAt: -1 })
        .lean();
    const teachers = teachersData as unknown as TeacherUser[];

    const adminsData = await User.find({ role: 'admin' })
        .select('name email createdAt')
        .sort({ createdAt: -1 })
        .lean();
    const admins = adminsData as unknown as AdminUser[];

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">ইউজার ব্যবস্থাপনা</h1>
                <p className="text-muted-foreground mt-2">
                    সকল ইউজার দেখুন এবং পরিচালনা করুন
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="students" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="students" className="gap-2">
                        <UsersIcon className="h-4 w-4" />
                        শিক্ষার্থী ({students.length})
                    </TabsTrigger>
                    <TabsTrigger value="teachers" className="gap-2">
                        <GraduationCap className="h-4 w-4" />
                        শিক্ষক ({teachers.length})
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="gap-2">
                        <UserCircle className="h-4 w-4" />
                        অ্যাডমিন ({admins.length})
                    </TabsTrigger>
                </TabsList>

                {/* Students Tab */}
                <TabsContent value="students">
                    <div className="bg-card rounded-xl border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        নাম
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        ইমেইল
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        লিঙ্গ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        নথিভুক্ত কোর্স
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        যোগদান
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.map((student: StudentUser) => (
                                    <tr key={student._id.toString()} className="hover:bg-muted/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium">{student.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="outline">
                                                {student.gender === 'male' ? 'পুরুষ' : student.gender === 'female' ? 'মহিলা' : 'N/A'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded font-medium">
                                                {student.enrolledCourses?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(student.createdAt).toLocaleDateString('bn-BD')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && (
                            <div className="text-center py-12">
                                <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">কোনো শিক্ষার্থী নেই</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Teachers Tab */}
                <TabsContent value="teachers">
                    <div className="bg-card rounded-xl border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        নাম
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        ইমেইল
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        যোগ্যতা
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        যোগদান
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {teachers.map((teacher: TeacherUser) => (
                                    <tr key={teacher._id.toString()} className="hover:bg-muted/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium">{teacher.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {teacher.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="max-w-xs truncate" title={teacher.teacherQualifications}>
                                                {teacher.teacherQualifications || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(teacher.createdAt).toLocaleDateString('bn-BD')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {teachers.length === 0 && (
                            <div className="text-center py-12">
                                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">কোনো শিক্ষক নেই</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Admins Tab */}
                <TabsContent value="admins">
                    <div className="bg-card rounded-xl border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        নাম
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        ইমেইল
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        যোগদান
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {admins.map((admin: AdminUser) => (
                                    <tr key={admin._id.toString()} className="hover:bg-muted/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium">{admin.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {admin.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(admin.createdAt).toLocaleDateString('bn-BD')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {admins.length === 0 && (
                            <div className="text-center py-12">
                                <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">কোনো অ্যাডমিন নেই</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
