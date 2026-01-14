'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EnrollButtonProps {
    courseId: string;
    isEnrolled: boolean;
    isLoggedIn?: boolean; // Keep for backwards compatibility but won't use
    isFree: boolean;
    price: number;
}

export default function EnrollButton({
    courseId,
    isEnrolled,
    isFree,
    price,
}: EnrollButtonProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);

    const handleEnroll = async () => {
        // Check if user is logged in using session hook (most reliable)
        if (status === 'loading') {
            return; // Wait for session to load
        }

        if (status === 'unauthenticated' || !session) {
            toast.info('দয়া করে লগইন করুন');
            router.push(`/auth/signin?callbackUrl=/courses/${courseId}`);
            return;
        }

        // Prevent teachers and admins from enrolling
        if (session.user.role !== 'student') {
            toast.error('শিক্ষক এবং অ্যাডমিনরা কোর্সে এনরোল করতে পারবেন না');
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
        // Only students can access enrolled courses
        if (session && session.user.role === 'student') {
            const handleGoToCourse = async () => {
                setLoading(true);
                try {
                    // Fetch last watched lesson
                    const response = await fetch(`/api/progress/lastWatchedLesson?courseId=${courseId}`);
                    const data = await response.json();

                    if (data.lastWatchedLessonId) {
                        // Resume from last watched lesson
                        router.push(`/student/watch/${courseId}/${data.lastWatchedLessonId}`);
                    } else {
                        // Get first lesson and start from there
                        const lessonsResponse = await fetch(`/api/courses/${courseId}/lessons`);
                        const lessonsData = await lessonsResponse.json();

                        if (lessonsData.lessons && lessonsData.lessons.length > 0) {
                            router.push(`/student/watch/${courseId}/${lessonsData.lessons[0]._id}`);
                        } else {
                            // Fallback to course detail page if no lessons
                            router.push(`/student/browse/${courseId}`);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching lesson:', error);
                    toast.error('লেসন লোড করতে সমস্যা হয়েছে');
                } finally {
                    setLoading(false);
                }
            };

            return (
                <Button
                    size="lg"
                    className="w-full"
                    onClick={handleGoToCourse}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            লোড হচ্ছে...
                        </>
                    ) : (
                        'কোর্সে যান'
                    )}
                </Button>
            );
        }
        // For teachers/admins who are enrolled (shouldn't happen but safeguard)
        return null;
    }

    return (
        <Button
            size="lg"
            className="w-full"
            onClick={handleEnroll}
            disabled={loading || status === 'loading'}
        >
            {loading || status === 'loading' ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    অপেক্ষা করুন...
                </>
            ) : (
                <>
                    এনরোল করুন
                    {!isFree && <span className="ml-2">(৳{price})</span>}
                </>
            )}
        </Button>
    );
}
