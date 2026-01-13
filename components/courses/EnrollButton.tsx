'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EnrollButtonProps {
    courseId: string;
    isEnrolled: boolean;
    isLoggedIn: boolean;
    isFree: boolean;
    price: number;
}

export default function EnrollButton({ courseId, isEnrolled, isLoggedIn, isFree, price }: EnrollButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleEnroll = async () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            toast.info('দয়া করে লগইন করুন');
            router.push(`/auth/signin?callbackUrl=/courses/${courseId}`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 402) {
                    // Payment required
                    toast.error('এই কোর্সটি পেইড। পেমেন্ট সিস্টেম শীঘ্রই আসছে।');
                } else {
                    toast.error(data.error || 'নথিভুক্তি ব্যর্থ হয়েছে');
                }
                return;
            }

            toast.success('কোর্সে নথিভুক্তি সফল হয়েছে!');
            router.push('/student/courses');
            router.refresh();
        } catch {
            toast.error('কোর্সে নথিভুক্ত হতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    if (isEnrolled) {
        return (
            <Button
                size="lg"
                className="w-full"
                onClick={() => router.push(`/student/courses/${courseId}`)}
            >
                কোর্স দেখুন
            </Button>
        );
    }

    return (
        <Button
            size="lg"
            className="w-full"
            onClick={handleEnroll}
            disabled={loading}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    অপেক্ষা করুন...
                </>
            ) : (
                <>
                    {isFree ? 'বিনামূল্যে নথিভুক্ত হন' : `৳${price} - এখনই কিনুন`}
                </>
            )}
        </Button>
    );
}
