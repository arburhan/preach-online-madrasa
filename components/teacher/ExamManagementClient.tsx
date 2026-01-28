'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    BarChart3,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    CheckCheck,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExamStats {
    totalStudents: number;
    passed: number;
    failed: number;
    notTaken: number;
    averageScore: number;
}

interface RetakeRequest {
    _id: string;
    student: {
        _id: string;
        name: string;
        email: string;
    };
    reason?: string;
    requestedAt: string;
    previousScore: number;
}

interface ExamResult {
    _id: string;
    student: {
        _id: string;
        name: string;
        email: string;
    };
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
    completedAt: string;
}

interface ExamManagementClientProps {
    exam: {
        _id: string;
        titleBn: string;
        status: string;
    };
    course: {
        _id: string;
        titleBn: string;
    };
}

export default function ExamManagementClient({ exam }: ExamManagementClientProps) {
    const [stats, setStats] = useState<ExamStats | null>(null);
    const [retakeRequests, setRetakeRequests] = useState<RetakeRequest[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Load all data in parallel
            const [statsRes, requestsRes, resultsRes] = await Promise.all([
                fetch(`/api/exams/${exam._id}/statistics`),
                fetch(`/api/exams/${exam._id}/retake-requests`),
                fetch(`/api/exams/${exam._id}/results?sortBy=${sortBy}&order=${sortOrder}`),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (requestsRes.ok) {
                const requestsData = await requestsRes.json();
                setRetakeRequests(requestsData.requests || []);
            }

            if (resultsRes.ok) {
                const resultsData = await resultsRes.json();
                setResults(resultsData.results || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('ডেটা লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    }, [exam._id, sortBy, sortOrder]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRetakeRequest = async (requestId: string, status: 'approved' | 'rejected') => {
        setProcessingId(requestId);
        try {
            const res = await fetch(`/api/exam-retakes/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'সমস্যা হয়েছে');
            }

            toast.success(status === 'approved' ? 'অনুমোদন করা হয়েছে' : 'প্রত্যাখ্যান করা হয়েছে');
            loadData(); // Reload data
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'সমস্যা হয়েছে');
        } finally {
            setProcessingId(null);
        }
    };

    const handleBulkApprove = async () => {
        const requestIds = retakeRequests.map(r => r._id);
        if (requestIds.length === 0) return;

        setProcessingId('bulk');
        try {
            const res = await fetch('/api/exam-retakes/bulk-approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestIds }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'সমস্যা হয়েছে');
            }

            toast.success('সব অনুরোধ অনুমোদন করা হয়েছে');
            loadData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'সমস্যা হয়েছে');
        } finally {
            setProcessingId(null);
        }
    };

    const sortedResults = [...results].sort((a, b) => {
        if (sortBy === 'score') {
            return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
        } else {
            const dateA = new Date(a.completedAt).getTime();
            const dateB = new Date(b.completedAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট শিক্ষার্থী</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">উত্তীর্ণ</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.passed || 0}</div>
                        {stats && stats.totalStudents > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {((stats.passed / stats.totalStudents) * 100).toFixed(1)}%
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">অনুত্তীর্ণ</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
                        {stats && stats.totalStudents > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {((stats.failed / stats.totalStudents) * 100).toFixed(1)}%
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">পরীক্ষা দেয়নি</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats?.notTaken || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="results" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="results">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        ফলাফল
                    </TabsTrigger>
                    <TabsTrigger value="retakes">
                        <Clock className="h-4 w-4 mr-2" />
                        পুনঃপরীক্ষা অনুরোধ
                        {retakeRequests.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {retakeRequests.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>পরীক্ষার ফলাফল</CardTitle>
                                    <CardDescription>সব শিক্ষার্থীর ফলাফল দেখুন</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSortBy(sortBy === 'score' ? 'date' : 'score')}
                                    >
                                        {sortBy === 'score' ? 'স্কোর অনুযায়ী' : 'তারিখ অনুযায়ী'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'desc' ? '↓' : '↑'}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sortedResults.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    এখনো কোনো শিক্ষার্থী পরীক্ষা দেয়নি
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>শিক্ষার্থী</TableHead>
                                            <TableHead>ইমেইল</TableHead>
                                            <TableHead className="text-right">স্কোর</TableHead>
                                            <TableHead className="text-right">শতাংশ</TableHead>
                                            <TableHead>ফলাফল</TableHead>
                                            <TableHead>তারিখ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedResults.map((result) => (
                                            <TableRow key={result._id}>
                                                <TableCell className="font-medium">
                                                    {result.student.name}
                                                </TableCell>
                                                <TableCell>{result.student.email}</TableCell>
                                                <TableCell className="text-right">
                                                    {result.score}/{result.totalMarks}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {result.percentage.toFixed(1)}%
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={result.passed ? 'default' : 'destructive'}
                                                    >
                                                        {result.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(result.completedAt).toLocaleDateString('bn-BD')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="retakes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>পুনঃপরীক্ষার অনুরোধ</CardTitle>
                                    <CardDescription>শিক্ষার্থীদের পুনঃপরীক্ষার অনুরোধ দেখুন এবং অনুমোদন করুন</CardDescription>
                                </div>
                                {retakeRequests.length > 0 && (
                                    <Button
                                        onClick={handleBulkApprove}
                                        disabled={processingId === 'bulk'}
                                        size="sm"
                                    >
                                        {processingId === 'bulk' ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                প্রক্রিয়াধীন...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCheck className="mr-2 h-4 w-4" />
                                                সব অনুমোদন করুন
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {retakeRequests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    কোনো পুনঃপরীক্ষার অনুরোধ নেই
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>শিক্ষার্থী</TableHead>
                                            <TableHead>পূর্ববর্তী স্কোর</TableHead>
                                            <TableHead>কারণ</TableHead>
                                            <TableHead>অনুরোধের তারিখ</TableHead>
                                            <TableHead className="text-right">অ্যাকশন</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {retakeRequests.map((request) => (
                                            <TableRow key={request._id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{request.student.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {request.student.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive">
                                                        {request.previousScore}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {request.reason || 'কারণ উল্লেখ করা হয়নি'}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(request.requestedAt).toLocaleDateString('bn-BD')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleRetakeRequest(request._id, 'approved')}
                                                            disabled={processingId === request._id}
                                                        >
                                                            {processingId === request._id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleRetakeRequest(request._id, 'rejected')}
                                                            disabled={processingId === request._id}
                                                        >
                                                            {processingId === request._id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <X className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
