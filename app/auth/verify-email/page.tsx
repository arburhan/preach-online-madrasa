'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('ভেরিফিকেশন টোকেন পাওয়া যায়নি');
                return;
            }

            try {
                const response = await fetch(`/api/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push('/auth/signin');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error);
                }
            } catch {
                setStatus('error');
                setMessage('ভেরিফিকেশন করতে সমস্যা হয়েছে');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border rounded-xl p-8 text-center space-y-6">
                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold">ইমেইল ভেরিফাই হচ্ছে...</h1>
                        <p className="text-muted-foreground">অনুগ্রহ করে অপেক্ষা করুন</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-green-600">ইমেইল ভেরিফাই হয়েছে!</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <p className="text-sm text-muted-foreground">
                            কিছুক্ষণের মধ্যে লগইন পেজে নিয়ে যাওয়া হবে...
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/auth/signin">
                                এখনই লগইন করুন
                            </Link>
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-red-600">ভেরিফিকেশন ব্যর্থ</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <div className="space-y-3 pt-4">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/auth/verification-pending">
                                    <Mail className="mr-2 h-4 w-4" />
                                    নতুন ভেরিফিকেশন ইমেইল পাঠান
                                </Link>
                            </Button>
                            <Button asChild className="w-full">
                                <Link href="/auth/signin">
                                    লগইন পেজে যান
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
