'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BarChart3, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CourseActionsClientProps {
    courseId: string;
    isCompleted: boolean;
}

export default function CourseActionsClient({ courseId, isCompleted: initialCompleted }: CourseActionsClientProps) {
    const [isCompleted, setIsCompleted] = useState(initialCompleted);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleComplete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/complete`, {
                method: 'PATCH',
            });
            const data = await res.json();

            if (res.ok) {
                setIsCompleted(data.isCompleted);
                toast.success(data.message);
                setShowModal(false);
                router.refresh();
            } else {
                toast.error(data.error || 'কোর্স আপডেট করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            toast.error('কোর্স আপডেট করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <Link href={`/teacher/courses/${courseId}/statistics`}>
                    <Button variant="outline" size="sm">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        পরিসংখ্যান দেখুন
                    </Button>
                </Link>

                <Button
                    variant={isCompleted ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowModal(true)}
                    className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isCompleted ? 'কোর্স সম্পন্ন ✓' : 'কোর্স শেষ করুন'}
                </Button>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isCompleted ? 'কোর্স শেষ চিহ্ন সরান?' : 'কোর্স শেষ করতে চান?'}
                        </DialogTitle>
                        <DialogDescription>
                            {isCompleted
                                ? 'এটি করলে কোর্সটি আবার চলমান হিসেবে দেখাবে।'
                                : 'এটি করলে শিক্ষার্থীরা বুঝতে পারবে কোর্সের সব বিষয়বস্তু যোগ করা হয়েছে। আপনি পরে এটি পরিবর্তন করতে পারবেন।'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowModal(false)}
                            disabled={loading}
                        >
                            বাতিল
                        </Button>
                        <Button
                            onClick={handleComplete}
                            disabled={loading}
                            className={isCompleted ? '' : 'bg-green-600 hover:bg-green-700'}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isCompleted ? 'চিহ্ন সরান' : 'হ্যাঁ, শেষ করুন'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
