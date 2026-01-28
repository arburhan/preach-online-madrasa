'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Certificate from '@/components/certificate/Certificate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CertificateData {
    studentName: string;
    studentEmail: string;
    courseName: string;
    courseNameEn?: string;
    instructorName: string;
    completionDate: string;
    totalLessons: number;
    totalExams: number;
    certificateId: string;
}

export default function CertificatePage() {
    const params = useParams();
    const router = useRouter();
    const courseSlug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [eligible, setEligible] = useState(false);
    const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await fetch(`/api/courses/${courseSlug}/certificate`);
                const data = await res.json();

                if (res.ok) {
                    setEligible(data.eligible);
                    if (data.eligible) {
                        setCertificateData(data.certificate);
                    } else {
                        setError(data.reason || 'আপনি সার্টিফিকেট পাওয়ার যোগ্য নন');
                    }
                } else {
                    setError(data.error || 'সার্টিফিকেট লোড করতে সমস্যা হয়েছে');
                }
            } catch {
                setError('সার্টিফিকেট লোড করতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        };

        fetchCertificate();
    }, [courseSlug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
                    <p className="mt-4 text-muted-foreground">সার্টিফিকেট প্রস্তুত করা হচ্ছে...</p>
                </div>
            </div>
        );
    }

    if (!eligible || !certificateData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8 bg-card rounded-xl border shadow-sm">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">সার্টিফিকেট উপলব্ধ নয়</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Link href={`/student/watch/${courseSlug}`}>
                        <Button>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            কোর্সে ফিরে যান
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div id="certificate-container">
            <Certificate
                data={certificateData}
                onClose={() => router.push(`/student/watch/${courseSlug}`)}
            />
        </div>
    );
}
