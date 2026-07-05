'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, RotateCcw, Loader2, Clock, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface TrashedCourse {
    _id: string;
    titleBn: string;
    titleEn: string;
    thumbnail: string;
    status: string;
    deletedAt: string;
    remainingDays: number;
    expiresAt: string;
}

export default function TrashPage() {
    const [courses, setCourses] = useState<TrashedCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TrashedCourse | null>(null);
    const router = useRouter();

    const fetchTrashedCourses = async () => {
        try {
            const res = await fetch('/api/admin/courses/trash');
            const data = await res.json();
            if (res.ok) {
                setCourses(data.courses);
            } else {
                toast.error(data.error || 'ট্র্যাশ লোড করতে সমস্যা হয়েছে');
            }
        } catch {
            toast.error('ট্র্যাশ লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrashedCourses();
    }, []);

    const handleRestore = async (courseId: string) => {
        setActionLoading(courseId);
        try {
            const res = await fetch(`/api/admin/courses/${courseId}/restore`, {
                method: 'PATCH',
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || 'কোর্স পুনরুদ্ধার হয়েছে');
                setCourses((prev) => prev.filter((c) => c._id !== courseId));
                router.refresh();
            } else {
                toast.error(data.error || 'সমস্যা হয়েছে');
            }
        } catch {
            toast.error('পুনরুদ্ধার করতে সমস্যা হয়েছে');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePermanentDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading(deleteTarget._id);
        try {
            const res = await fetch(`/api/admin/courses/${deleteTarget._id}/permanent-delete`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || 'কোর্স স্থায়ীভাবে মুছে ফেলা হয়েছে');
                setCourses((prev) => prev.filter((c) => c._id !== deleteTarget._id));
                setDeleteTarget(null);
                router.refresh();
            } else {
                toast.error(data.error || 'সমস্যা হয়েছে');
            }
        } catch {
            toast.error('মুছতে সমস্যা হয়েছে');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCleanup = async () => {
        setActionLoading('cleanup');
        try {
            const res = await fetch('/api/admin/courses/cleanup', {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
                fetchTrashedCourses();
            } else {
                toast.error(data.error || 'সমস্যা হয়েছে');
            }
        } catch {
            toast.error('ক্লিনআপ করতে সমস্যা হয়েছে');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/courses">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        কোর্স তালিকায় ফিরে যান
                    </Button>
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Trash2 className="h-8 w-8 text-destructive" />
                            ট্র্যাশ
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            মুছে ফেলা কোর্সগুলো এখানে ৩০ দিন পর্যন্ত থাকবে। এরপর স্বয়ংক্রিয়ভাবে স্থায়ীভাবে মুছে যাবে।
                        </p>
                    </div>
                    {courses.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleCleanup}
                            disabled={actionLoading === 'cleanup'}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                            {actionLoading === 'cleanup' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            মেয়াদোত্তীর্ণ মুছুন
                        </Button>
                    )}
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-card rounded-xl border p-12 text-center">
                    <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">ট্র্যাশ খালি</h3>
                    <p className="text-muted-foreground mt-2">
                        কোনো মুছে ফেলা কোর্স নেই
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="bg-card rounded-xl border p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-6 w-6 text-destructive" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-lg truncate">{course.titleBn}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                            {course.status === 'published' ? 'প্রকাশিত ছিল' : 'খসড়া ছিল'}
                                        </Badge>
                                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            মুছে ফেলা হয়েছে: {new Date(course.deletedAt).toLocaleDateString('bn-BD', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                        <Badge
                                            variant={course.remainingDays <= 7 ? 'destructive' : 'outline'}
                                            className="text-xs"
                                        >
                                            {course.remainingDays > 0
                                                ? `${course.remainingDays} দিন বাকি`
                                                : 'মেয়াদ শেষ'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRestore(course._id)}
                                    disabled={actionLoading === course._id}
                                    className="text-green-600 border-green-600/30 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                    {actionLoading === course._id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                    )}
                                    পুনরুদ্ধার
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteTarget(course)}
                                    disabled={actionLoading === course._id}
                                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    স্থায়ীভাবে মুছুন
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Permanent Delete Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>স্থায়ীভাবে মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>
                            আপনি কি নিশ্চিত যে আপনি &quot;{deleteTarget?.titleBn}&quot; কোর্সটি স্থায়ীভাবে মুছে ফেলতে চান?
                            এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। সকল পাঠ এবং পরীক্ষাও মুছে যাবে।
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!actionLoading}>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePermanentDelete}
                            disabled={!!actionLoading}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    মুছে ফেলা হচ্ছে...
                                </>
                            ) : (
                                'স্থায়ীভাবে মুছুন'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
