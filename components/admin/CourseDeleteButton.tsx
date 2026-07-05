'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CourseDeleteButtonProps {
    courseId: string;
    courseName: string;
}

export default function CourseDeleteButton({ courseId, courseName }: CourseDeleteButtonProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'মুছতে সমস্যা হয়েছে');
            }

            toast.success(data.message || 'কোর্সটি ট্র্যাশে সরানো হয়েছে');
            setShowDialog(false);
            router.push('/admin/courses');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'সমস্যা হয়েছে');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDialog(true);
                }}
                className="text-destructive hover:bg-destructive/10 border-destructive/30"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>কোর্স ট্র্যাশে সরাবেন?</AlertDialogTitle>
                        <AlertDialogDescription>
                            আপনি কি নিশ্চিত যে আপনি &quot;{courseName}&quot; কোর্সটি ট্র্যাশে সরাতে চান?
                            ৩০ দিনের মধ্যে পুনরুদ্ধার করতে পারবেন, তারপর স্থায়ীভাবে মুছে যাবে।
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
                                'ট্র্যাশে সরান'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
