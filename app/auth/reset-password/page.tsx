'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
            return;
        }

        if (password !== confirmPassword) {
            setError('পাসওয়ার্ড মিলছে না');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                toast.success(data.message);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/auth/signin');
                }, 3000);
            } else {
                setError(data.error);
            }
        } catch {
            setError('পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card border rounded-xl p-8 text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-600">অবৈধ লিংক</h1>
                    <p className="text-muted-foreground">রিসেট টোকেন পাওয়া যায়নি</p>
                    <Link href="/auth/forgot-password">
                        <Button className="w-full">নতুন রিসেট লিংক পাঠান</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border rounded-xl p-8 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                        <Lock className="h-10 w-10 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold">নতুন পাসওয়ার্ড সেট করুন</h1>
                    <p className="text-muted-foreground mt-2">
                        আপনার নতুন পাসওয়ার্ড লিখুন
                    </p>
                </div>

                {success ? (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-green-600 font-medium">
                            পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!
                        </p>
                        <p className="text-sm text-muted-foreground">
                            কিছুক্ষণের মধ্যে লগইন পেজে নিয়ে যাওয়া হবে...
                        </p>
                        <Link href="/auth/signin" className="block">
                            <Button className="w-full">
                                এখনই লগইন করুন
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium block mb-2">
                                নতুন পাসওয়ার্ড
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                                    placeholder="কমপক্ষে ৬ অক্ষর"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-2">
                                পাসওয়ার্ড নিশ্চিত করুন
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    পাসওয়ার্ড সংরক্ষণ করুন
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
