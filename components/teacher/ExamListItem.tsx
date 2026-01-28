'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, Edit2, Settings, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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

interface ExamListItemProps {
    exam: {
        _id: string;
        titleBn: string;
        questionsCount: number;
        totalMarks: number;
        duration: number;
        status: string;
    };
    courseId: string;
    onDelete: () => void;
}

export default function ExamListItem({ exam, courseId, onDelete }: ExamListItemProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/exams/${exam._id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'মুছতে সমস্যা হয়েছে');
            }

            toast.success('পরীক্ষা মুছে ফেলা হয়েছে');
            setShowDeleteDialog(false);
            onDelete();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'সমস্যা হয়েছে');
        } finally {
            setDeleting(false);
        }
    };

    const canDelete = exam.status === 'draft';

    return (
        <>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-medium">{exam.titleBn}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{exam.questionsCount} প্রশ্ন</span>
                            <span>•</span>
                            <span>{exam.totalMarks} মার্কস</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {exam.duration} মিনিট
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
                        {exam.status === 'published' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> প্রকাশিত</>
                        ) : exam.status === 'completed' ? 'সম্পন্ন' : 'ড্রাফট'}
                    </Badge>
                    <Link href={`/teacher/courses/${courseId}/exams/edit-exam?id=${exam._id}`}>
                        <Button size="sm" variant="outline">
                            <Edit2 className="h-4 w-4 mr-1" />
                            এডিট
                        </Button>
                    </Link>
                    <Link href={`/teacher/exams/${exam._id}/manage`}>
                        <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4 mr-1" />
                            ম্যানেজ
                        </Button>
                    </Link>
                    {canDelete && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>পরীক্ষা মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>
                            আপনি কি নিশ্চিত যে আপনি &quot;{exam.titleBn}&quot; পরীক্ষাটি মুছে ফেলতে চান?
                            এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>বাতিল</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    মুছে ফেলা হচ্ছে...
                                </>
                            ) : (
                                'মুছে ফেলুন'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
