'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, BookOpen, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');
    const error = searchParams.get('error');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (status === 'success') {
            setShowConfetti(true);
            // Auto-hide confetti after 5s
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                {/* Confetti Effect */}
                {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * -20 - 10}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 3}s`,
                                    fontSize: `${12 + Math.random() * 16}px`,
                                }}
                            >
                                {['🎉', '✨', '🌟', '🎊', '💫'][Math.floor(Math.random() * 5)]}
                            </div>
                        ))}
                    </div>
                )}

                <div className="max-w-md w-full text-center space-y-6">
                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto">
                        <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                            আলহামদুলিল্লাহ!
                        </h1>
                        <h2 className="text-xl font-semibold mb-4">
                            পেমেন্ট সফল হয়েছে!
                        </h2>
                        <p className="text-muted-foreground">
                            আপনি সফলভাবে কোর্সে নথিভুক্ত হয়েছেন। এখন থেকে কোর্সের সকল কন্টেন্ট দেখতে পারবেন।
                        </p>
                    </div>

                    <div className="bg-card border rounded-xl p-6 space-y-3">
                        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">পেমেন্ট ভেরিফাইড</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">কোর্সে এনরোল সম্পন্ন</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {courseId && (
                            <Link href={`/student/watch/${courseId}`}>
                                <Button size="lg" className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    কোর্সে যান
                                </Button>
                            </Link>
                        )}
                        <Link href="/student/my-courses">
                            <Button variant="outline" size="lg" className="w-full">
                                আমার কোর্সসমূহ
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    {/* Failed Icon */}
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto">
                        <XCircle className="h-14 w-14 text-red-600 dark:text-red-400" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                            পেমেন্ট ব্যর্থ হয়েছে
                        </h1>
                        <p className="text-muted-foreground">
                            {error === 'verification_failed'
                                ? 'পেমেন্ট ভেরিফিকেশন ব্যর্থ হয়েছে। যদি আপনার একাউন্ট থেকে টাকা কাটা হয়ে থাকে, তাহলে স্বয়ংক্রিয়ভাবে ফেরত আসবে।'
                                : 'পেমেন্ট সম্পন্ন হয়নি। দয়া করে আবার চেষ্টা করুন।'
                            }
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {courseId && (
                            <Link href={`/courses/${courseId}`}>
                                <Button size="lg" className="w-full">
                                    <RotateCcw className="mr-2 h-5 w-5" />
                                    আবার চেষ্টা করুন
                                </Button>
                            </Link>
                        )}
                        <Link href="/courses">
                            <Button variant="outline" size="lg" className="w-full">
                                কোর্সসমূহ দেখুন
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="ghost" size="lg" className="w-full text-muted-foreground">
                                সমস্যা হলে যোগাযোগ করুন
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Loading / Unknown state
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">পেমেন্ট যাচাই করা হচ্ছে...</p>
            </div>
        </div>
    );
}

export default function PaymentResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">লোড হচ্ছে...</p>
                </div>
            </div>
        }>
            <PaymentResultContent />
        </Suspense>
    );
}
