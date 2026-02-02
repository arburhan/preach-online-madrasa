'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Users,
    CheckCircle,
    XCircle,
    Trophy,
    BarChart3,
    Loader2,
    BookCheck,
    UserX,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ExamStat {
    _id: string;
    titleBn: string;
    totalMarks: number;
    passMarks: number;
    taken: number;
    passed: number;
    failed: number;
    notTaken: number;
    averageScore: number;
}

interface TopStudent {
    rank: number;
    _id: string;
    name: string;
    email: string;
    totalMarks: number;
    examsCompleted: number;
}

interface CourseStats {
    courseName: string;
    totalEnrolled: number;
    totalExams: number;
    completedAllExams: number;
    partiallyCompleted: number;
    notStarted: number;
    examStats: ExamStat[];
    topStudents: TopStudent[];
}

interface CourseStatisticsClientProps {
    courseId: string;
    courseName: string;
}

export default function CourseStatisticsClient({ courseId, courseName }: CourseStatisticsClientProps) {
    const [stats, setStats] = useState<CourseStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [courseId]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}/statistics`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">পরিসংখ্যান লোড করতে সমস্যা হয়েছে</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
                        <p className="text-xs text-muted-foreground">
                            এই কোর্সে নথিভুক্ত
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সব পরীক্ষা সম্পন্ন</CardTitle>
                        <BookCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completedAllExams}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalEnrolled > 0
                                ? `${Math.round((stats.completedAllExams / stats.totalEnrolled) * 100)}% শিক্ষার্থী`
                                : '0%'
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">আংশিক সম্পন্ন</CardTitle>
                        <BarChart3 className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.partiallyCompleted}</div>
                        <p className="text-xs text-muted-foreground">
                            কিছু পরীক্ষা দিয়েছে
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">শুরু করেনি</CardTitle>
                        <UserX className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.notStarted}</div>
                        <p className="text-xs text-muted-foreground">
                            কোনো পরীক্ষা দেয়নি
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Exam-wise Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        পরীক্ষাভিত্তিক পরিসংখ্যান
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.examStats.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">কোনো পরীক্ষা নেই</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>পরীক্ষা</TableHead>
                                    <TableHead className="text-center">অংশগ্রহণ</TableHead>
                                    <TableHead className="text-center">পাশ</TableHead>
                                    <TableHead className="text-center">ফেল</TableHead>
                                    <TableHead className="text-center">অনুপস্থিত</TableHead>
                                    <TableHead className="text-center">গড় নম্বর</TableHead>
                                    <TableHead className="w-[200px]">পাশের হার</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.examStats.map((exam) => {
                                    const passRate = exam.taken > 0 ? (exam.passed / exam.taken) * 100 : 0;
                                    return (
                                        <TableRow key={exam._id}>
                                            <TableCell className="font-medium">{exam.titleBn}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{exam.taken}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    {exam.passed}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    {exam.failed}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{exam.notTaken}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {exam.averageScore}/{exam.totalMarks}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={passRate} className="h-2" />
                                                    <span className="text-sm text-muted-foreground w-12">
                                                        {Math.round(passRate)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Top Students */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        সেরা শিক্ষার্থী (সব পরীক্ষা সম্পন্ন)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.topStudents.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            এখনো কেউ সব পরীক্ষা সম্পন্ন করেনি
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">র‍্যাংক</TableHead>
                                    <TableHead>নাম</TableHead>
                                    <TableHead>ইমেইল</TableHead>
                                    <TableHead className="text-center">মোট নম্বর</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.topStudents.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell>
                                            {student.rank <= 3 ? (
                                                <Badge
                                                    className={
                                                        student.rank === 1
                                                            ? 'bg-yellow-500'
                                                            : student.rank === 2
                                                                ? 'bg-gray-400'
                                                                : 'bg-amber-600'
                                                    }
                                                >
                                                    #{student.rank}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">#{student.rank}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{student.email}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-lg">
                                                {student.totalMarks}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
