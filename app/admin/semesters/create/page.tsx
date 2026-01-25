'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const levelOptions = [
    { value: 'basic', label: 'বেসিক (Basic)' },
    { value: 'expert', label: 'এক্সপার্ট (Expert)' },
    { value: 'masters', label: 'মাস্টার্স (Masters)' },
    { value: 'alim', label: 'আলিম (Alim)' },
];

function CreateSemesterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const defaultNumber = searchParams.get('number') || '';
    const defaultLevel = searchParams.get('level') || '';

    const [formData, setFormData] = useState({
        number: defaultNumber,
        level: defaultLevel,
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        descriptionEn: '',
        duration: '3',
        status: 'inactive',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/semesters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    number: parseInt(formData.number),
                    duration: parseInt(formData.duration),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'সেমিস্টার তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success('সেমিস্টার সফলভাবে তৈরি হয়েছে!');
            router.push('/admin/semesters');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Semester Number */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        সেমিস্টার নম্বর *
                    </label>
                    <select
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    >
                        <option value="">নির্বাচন করুন</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num}ম সেমিস্টার</option>
                        ))}
                    </select>
                </div>

                {/* Level */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        লেভেল *
                    </label>
                    <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    >
                        <option value="">নির্বাচন করুন</option>
                        {levelOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Title Bengali */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    শিরোনাম (বাংলা) *
                </label>
                <input
                    type="text"
                    name="titleBn"
                    value={formData.titleBn}
                    onChange={handleChange}
                    required
                    placeholder="যেমন: ১ম সেমিস্টার (Basic-1)"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
            </div>

            {/* Title English */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    শিরোনাম (ইংরেজি)
                </label>
                <input
                    type="text"
                    name="titleEn"
                    value={formData.titleEn}
                    onChange={handleChange}
                    placeholder="e.g., Semester 1 (Basic-1)"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
            </div>

            {/* Description Bengali */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    বিবরণ (বাংলা) *
                </label>
                <textarea
                    name="descriptionBn"
                    value={formData.descriptionBn}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="ফোকাস: ভিত্তি শক্ত করা, কুরআন পরিচিতি, আকীদা বেসিক"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
            </div>

            {/* Duration & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        সময়কাল (মাস)
                    </label>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                        max="12"
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        স্ট্যাটাস
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    >
                        <option value="inactive">নিষ্ক্রিয়</option>
                        <option value="active">সক্রিয়</option>
                    </select>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            অপেক্ষা করুন...
                        </>
                    ) : (
                        'সেমিস্টার তৈরি করুন'
                    )}
                </Button>
                <Link href="/admin/semesters">
                    <Button type="button" variant="outline">
                        বাতিল
                    </Button>
                </Link>
            </div>
        </form>
    );
}

function FormSkeleton() {
    return (
        <div className="bg-card rounded-xl border p-6 space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-16 bg-muted rounded-lg" />
                <div className="h-16 bg-muted rounded-lg" />
            </div>
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-24 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-16 bg-muted rounded-lg" />
                <div className="h-16 bg-muted rounded-lg" />
            </div>
        </div>
    );
}

export default function CreateSemesterPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href="/admin/semesters"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        সেমিস্টার তালিকায় ফিরে যান
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন সেমিস্টার তৈরি করুন</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Suspense fallback={<FormSkeleton />}>
                        <CreateSemesterForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
