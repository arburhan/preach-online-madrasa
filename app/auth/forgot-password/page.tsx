'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('ইমেইল লিখুন');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSent(true);
                toast.success(data.message);
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error('পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border rounded-xl p-8 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                        <Mail className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold">পাসওয়ার্ড ভুলে গেছেন?</h1>
                    <p className="text-muted-foreground mt-2">
                        আপনার ইমেইল দিন, আমরা রিসেট লিংক পাঠাবো।
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-green-600 font-medium">
                            রিসেট লিংক পাঠানো হয়েছে!
                        </p>
                        <p className="text-sm text-muted-foreground">
                            আপনার ইনবক্স এবং স্প্যাম ফোল্ডার চেক করুন।
                        </p>
                        <div className="pt-4 space-y-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setSent(false)}
                            >
                                অন্য ইমেইল দিয়ে চেষ্টা করুন
                            </Button>
                            <Link href="/auth/signin" className="block">
                                <Button className="w-full">
                                    লগইন পেজে যান
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium block mb-2">
                                আপনার ইমেইল
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="example@email.com"
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
                                    পাঠানো হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    রিসেট লিংক পাঠান
                                </>
                            )}
                        </Button>
                    </form>
                )}

                <div className="text-center pt-4 border-t">
                    <Link
                        href="/auth/signin"
                        className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        লগইন পেজে ফিরে যান
                    </Link>
                </div>
            </div>
        </div>
    );
}
