'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    // Navigate when countdown reaches 0
    useEffect(() => {
        if (countdown === 0) {
            router.push('/');
        }
    }, [countdown, router]);

    return (
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20 flex items-center justify-center px-4">
            <div className="text-center max-w-2xl mx-auto">
                {/* Decorative Elements */}
                <div className="relative mb-8">
                    {/* Animated circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 rounded-full bg-purple-200/30 dark:bg-purple-800/20 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full bg-blue-200/40 dark:bg-blue-800/30 animate-pulse delay-75" />
                    </div>

                    {/* 404 Text */}
                    <div className="relative z-10">
                        <h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 leading-none select-none">
                            404
                        </h1>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        দুঃখিত! আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি হয়তো সরানো হয়েছে, নাম পরিবর্তন করা হয়েছে বা সাময়িকভাবে অনুপলব্ধ।
                    </p>
                </div>

                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
                    <Clock className="h-5 w-5 animate-pulse" />
                    <span className="text-lg">
                        <span className="font-bold text-primary text-2xl">{countdown}</span> সেকেন্ডের মধ্যে হোমপেজে নিয়ে যাওয়া হবে
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        asChild
                        size="lg"
                        className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 shadow-lg shadow-purple-500/25"
                    >
                        <Link href="/">
                            <Home className="h-5 w-5 mr-2" />
                            হোমপেজে যান
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        className="px-8"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        পিছনে যান
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                    >
                        <Link href="/courses">
                            <Search className="h-5 w-5 mr-2" />
                            কোর্স দেখুন
                        </Link>
                    </Button>
                </div>

                {/* Progress bar */}
                <div className="mt-12 max-w-xs mx-auto">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-purple-600 to-blue-600 transition-all duration-1000 ease-linear"
                            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Decorative Islamic Pattern */}
                <div className="mt-16 opacity-20 dark:opacity-10">
                    <svg className="w-full h-12" viewBox="0 0 400 50" fill="none">
                        <pattern id="islamic-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                            <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="0.5" className="text-purple-600" />
                            <circle cx="25" cy="25" r="10" stroke="currentColor" strokeWidth="0.5" className="text-blue-600" />
                            <line x1="5" y1="25" x2="45" y2="25" stroke="currentColor" strokeWidth="0.3" className="text-purple-400" />
                            <line x1="25" y1="5" x2="25" y2="45" stroke="currentColor" strokeWidth="0.3" className="text-purple-400" />
                        </pattern>
                        <rect width="400" height="50" fill="url(#islamic-pattern)" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
