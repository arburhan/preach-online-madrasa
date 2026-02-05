'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileCheckModal } from '@/components/shared/ProfileCheckModal';

interface EnrollButtonProps {
    programId: string;
    programSlug?: string;
    programTitle: string;
    isEnrolled?: boolean;
}

export function EnrollButton({ programId, programSlug, programTitle: _programTitle, isEnrolled = false }: EnrollButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(isEnrolled);
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
        if (enrolled) {
            // Navigate to program page
            router.push(`/student/programs/${programSlug || programId}`);
            return;
        }

        setLoading(true);

        try {
            // Check auth
            const authRes = await fetch('/api/user');
            if (authRes.status === 401) {
                toast.info('অনুগ্রহ করে লগইন করুন');
                router.push('/auth/signin?redirect=/programs/' + programId);
                return;
            }

            // Check profile completeness before enrolling
            const isProfileComplete = await checkProfileCompleteness();
            if (!isProfileComplete) {
                setLoading(false);
                return;
            }

            // Call enroll API
            const res = await fetch(`/api/programs/${programId}/enroll`, {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            toast.success(data.message || 'এনরোলমেন্ট সফল হয়েছে!');
            setEnrolled(true);

        } catch (error) {
            console.error('Enrollment error:', error);
            toast.error('এনরোল করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                className="w-full mb-4"
                size="lg"
                onClick={handleEnroll}
                disabled={loading}
                variant={enrolled ? "default" : "default"}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        অপেক্ষা করুন...
                    </>
                ) : enrolled ? (
                    'প্রোগ্রামে যান'
                ) : (
                    'এনরোল করুন'
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
