'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileCheckModal } from '@/components/shared/ProfileCheckModal';

interface EnrollButtonProps {
    courseId: string;
    slug?: string;
    isEnrolled: boolean;
    isLoggedIn?: boolean; // Keep for backwards compatibility but won't use
    isFree: boolean;
    price: number;
    hasLessons?: boolean;
}

export default function EnrollButton({
    courseId,
    slug,
    isEnrolled,
    isFree,
    price,
    hasLessons = true,
}: EnrollButtonProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);

    const checkProfileCompleteness = async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/user/profile/check');
            if (response.ok) {
                const data = await response.json();
                if (!data.isComplete) {
                    setMissingFields(data.missingFields);
                    setShowProfileModal(true);
                    return false;
                }
                return true;
            }
            return true; // Proceed if check fails
        } catch (error) {
            console.error('Profile check error:', error);
            return true; // Proceed if check fails
        }
    };

    const handleEnroll = async () => {
        // Check if user is logged in using session hook (most reliable)
        if (status === 'loading') {
            return; // Wait for session to load
        }

        if (status === 'unauthenticated' || !session) {
            toast.info('দয়া করে লগইন করুন');
            router.push(`/auth/signin?callbackUrl=/courses/${slug || courseId}`);
            return;
        }

        // Prevent teachers and admins from enrolling
        if (session.user.role !== 'student') {
            toast.error('শিক্ষক এবং অ্যাডমিনরা কোর্সে এনরোল করতে পারবেন না');
            return;
        }

        setLoading(true);

        try {
            // Check profile completeness before enrolling
            const isProfileComplete = await checkProfileCompleteness();
            if (!isProfileComplete) {
                setLoading(false);
                return;
            }

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
            router.push('/student/my-courses');
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
            const handleGoToCourse = () => {
                if (!hasLessons) {
                    toast.error('ক্লাস ভিডিও আপলোড করা হয়নি অপেক্ষা করুন', {
                        duration: 4000,
                    });
                    return;
                }

                // Navigate to the resume entry route which handles lastWatchedLesson server-side
                router.push(`/student/watch/${slug || courseId}`);
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
        <>
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

            <ProfileCheckModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                missingFields={missingFields}
            />
        </>
    );
}
