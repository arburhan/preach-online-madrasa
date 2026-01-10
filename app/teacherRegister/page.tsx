'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        fatherName: '',
        motherName: '',
        email: '',
        mobileNumber: '',
        address: '',
        teacherQualifications: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                    fatherName: formData.fatherName,
                    motherName: formData.motherName,
                    email: formData.email,
                    mobileNumber: formData.mobileNumber,
                    address: formData.address,
                    teacherQualifications: formData.teacherQualifications,
                    password: formData.password,
                    role: 'teacher',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'নিবন্ধন করতে সমস্যা হয়েছে');
            }

            toast.success('নিবন্ধন সফল হয়েছে! অ্যাডমিন অনুমোদনের জন্য অপেক্ষা করুন।');
            router.push('/auth/signin?teacherRegistered=true');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'নিবন্ধন করতে সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                            <BookOpen className="h-9 w-9" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Preach Madrasa</h1>
                            <p className="text-sm text-muted-foreground">প্রশিক্ষক নিবন্ধন</p>
                        </div>
                    </Link>
                </div>

                {/* Form */}
                <div className="rounded-2xl border bg-card p-8 shadow-lg">
                    <h2 className="mb-2 text-center text-2xl font-bold">প্রশিক্ষক হিসেবে যোগ দিন</h2>
                    <p className="mb-6 text-center text-sm text-muted-foreground">
                        নিবন্ধনের পর অ্যাডমিন অনুমোদনের জন্য অপেক্ষা করুন
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            {/* Father Name */}
                            <div>
                                <label htmlFor="fatherName" className="block text-sm font-medium mb-2">
                                    পিতার নাম *
                                </label>
                                <input
                                    id="fatherName"
                                    name="fatherName"
                                    type="text"
                                    required
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="পিতার নাম"
                                />
                            </div>

                            {/* Mother Name */}
                            <div>
                                <label htmlFor="motherName" className="block text-sm font-medium mb-2">
                                    মাতার নাম *
                                </label>
                                <input
                                    id="motherName"
                                    name="motherName"
                                    type="text"
                                    required
                                    value={formData.motherName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="মাতার নাম"
                                />
                            </div>

                            {/* Mobile */}
                            <div>
                                <label htmlFor="mobileNumber" className="block text-sm font-medium mb-2">
                                    মোবাইল নম্বর *
                                </label>
                                <input
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    type="tel"
                                    required
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="01XXXXXXXXX"
                                />
                            </div>
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

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium mb-2">
                                ঠিকানা *
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                required
                                rows={2}
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="সম্পূর্ণ ঠিকানা"
                            />
                        </div>

                        {/* Qualifications */}
                        <div>
                            <label htmlFor="teacherQualifications" className="block text-sm font-medium mb-2">
                                শিক্ষাগত যোগ্যতা *
                            </label>
                            <textarea
                                id="teacherQualifications"
                                name="teacherQualifications"
                                required
                                rows={3}
                                value={formData.teacherQualifications}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="আপনার শিক্ষাগত যোগ্যতা এবং অভিজ্ঞতা লিখুন..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    অপেক্ষা করুন...
                                </>
                            ) : (
                                'প্রশিক্ষক হিসেবে নিবন্ধন করুন'
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
                            শিক্ষার্থী হিসেবে নিবন্ধন করতে?{' '}
                            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                                শিক্ষার্থী নিবন্ধন
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
