'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditProfilePage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: session?.user?.name || '',
        phone: '',
        address: '',
        bio: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('প্রোফাইল সফলভাবে আপডেট হয়েছে');

                // Update session if name changed
                if (formData.name !== session?.user?.name) {
                    await update({ name: formData.name });
                }

                router.push('/student/profile');
            } else {
                toast.error('প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('একটি ত্রুটি ঘটেছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/student/profile"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">প্রোফাইল এডিট করুন</h1>
                        <p className="text-muted-foreground mt-1">আপনার ব্যক্তিগত তথ্য আপডেট করুন</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-8 space-y-6">
                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            ইমেইল (পরিবর্তনযোগ্য নয়)
                        </label>
                        <input
                            type="email"
                            value={session?.user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-lg border bg-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                            নিরাপত্তার কারণে ইমেইল পরিবর্তন করা যাবে না
                        </p>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="আপনার পুরো নাম লিখুন"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            ফোন নম্বর
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="+৮৮০ ১৭XX XXXXXX"
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            ঠিকানা
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="আপনার সম্পূর্ণ ঠিকানা"
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            সম্পর্কে
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="নিজের সম্পর্কে কিছু লিখুন..."
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    আপডেট হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    সংরক্ষণ করুন
                                </>
                            )}
                        </button>
                        <Link
                            href="/student/profile"
                            className="px-6 py-3 border rounded-lg hover:bg-muted transition-colors"
                        >
                            বাতিল করুন
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
