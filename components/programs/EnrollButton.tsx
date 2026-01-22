'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EnrollButtonProps {
    programId: string;
    programTitle: string;
}

export function EnrollButton({ programId, programTitle }: EnrollButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleEnroll = async () => {
        setLoading(true);

        try {
            // Check if user is authenticated by calling a protected endpoint
            const response = await fetch('/api/user');

            if (response.status === 401) {
                // User is not authenticated, redirect to login
                toast.info('লগইন করুন');
                router.push('/login?redirect=/programs/' + programId);
                return;
            }

            // User is authenticated, redirect to student dashboard or enrollment page
            // For now, just show a message
            toast.success('এনরোলমেন্ট ফিচার শীঘ্রই আসছে!');

            // TODO: Implement program enrollment logic
            // This would be different from course enrollment as programs have semesters

        } catch (error) {
            console.error('Enrollment error:', error);
            toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            className="w-full mb-4"
            size="lg"
            onClick={handleEnroll}
            disabled={loading}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    অপেক্ষা করুন...
                </>
            ) : (
                'এনরোল করুন'
            )}
        </Button>
    );
}
