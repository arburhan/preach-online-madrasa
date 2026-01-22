'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentSignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: 'male',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('পাসওয়ার্ড মিলছে না');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    gender: formData.gender,
                    role: 'student',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'নিবন্ধন করতে সমস্যা হয়েছে');
            }

            toast.success('নিবন্ধন সফল হয়েছে!');
            router.push('/auth/signin?registered=true');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'নিবন্ধন করতে সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                            <BookOpen className="h-9 w-9" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Online Islamic Academy</h1>
                            <p className="text-sm text-muted-foreground">শিক্ষার্থী নিবন্ধন</p>
                        </div>
                    </Link>
                </div>

                {/* Form */}
                <div className="rounded-2xl border bg-card p-8 shadow-lg">
                    <h2 className="mb-6 text-center text-2xl font-bold">অ্যাকাউন্ট তৈরি করুন</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                পূর্ণ নাম *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="আপনার পূর্ণ নাম"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                ইমেইল *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="example@email.com"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium mb-2">লিঙ্গ *</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={formData.gender === 'male'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <span className="text-sm">পুরুষ</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={formData.gender === 'female'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <span className="text-sm">মহিলা</span>
                                </label>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                পাসওয়ার্ড *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="কমপক্ষে ৬ অক্ষর"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                পাসওয়ার্ড নিশ্চিত করুন *
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    অপেক্ষা করুন...
                                </>
                            ) : (
                                'নিবন্ধন করুন'
                            )}
                        </Button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 space-y-3 text-center text-sm">
                        <p className="text-muted-foreground">
                            ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{' '}
                            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                                সাইন ইন করুন
                            </Link>
                        </p>
                        <p className="text-muted-foreground">
                            প্রশিক্ষক হতে চান?{' '}
                            <Link href="/teacherRegister" className="font-medium text-primary hover:underline">
                                প্রশিক্ষক নিবন্ধন
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
