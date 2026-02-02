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

interface SemesterActionsClientProps {
    programId: string;
    semesterNumber: number;
    semesterId: string;
    isCompleted: boolean;
}

export function SemesterActionsClient({
    programId,
    semesterNumber,
    semesterId,
    isCompleted: initialCompleted
}: SemesterActionsClientProps) {
    const [isCompleted, setIsCompleted] = useState(initialCompleted);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleComplete = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/programs/${programId}/semesters/${semesterNumber}/complete`,
                { method: 'PATCH' }
            );
            const data = await res.json();

            if (res.ok) {
                setIsCompleted(data.isCompleted);
                toast.success(data.message);
                setShowModal(false);
                router.refresh();
            } else {
                toast.error(data.error || 'সেমিস্টার আপডেট করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            toast.error('সেমিস্টার আপডেট করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <Button
                    variant={isCompleted ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowModal(true)}
                    className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isCompleted ? 'সেমিস্টার সম্পন্ন ✓' : 'সেমিস্টার শেষ করুন'}
                </Button>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isCompleted ? 'সেমিস্টার শেষ চিহ্ন সরান?' : 'সেমিস্টার শেষ করতে চান?'}
                        </DialogTitle>
                        <DialogDescription>
                            {isCompleted
                                ? 'এটি করলে সেমিস্টারটি আবার চলমান হিসেবে দেখাবে এবং শিক্ষার্থীরা পরবর্তী সেমিস্টারে যেতে পারবে না।'
                                : 'এটি করলে শিক্ষার্থীরা এই সেমিস্টার সম্পন্ন করে পরবর্তী সেমিস্টারে যেতে পারবে। আপনি পরে এটি পরিবর্তন করতে পারবেন।'
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
