'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        descriptionEn: '',
        price: '0',
        isFree: true,
        level: 'beginner',
        language: 'bn',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked,
                ...(name === 'isFree' && checked ? { price: '0' } : {})
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'কোর্স তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success('কোর্স তৈরি হয়েছে!');
            router.push(`/teacher/courses/${data.course.slug || data.course._id}`);
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'কোর্স তৈরি করতে সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/teacher">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            ফিরে যান
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন কোর্স তৈরি করুন</h1>
                    <p className="text-muted-foreground mt-2">
                        আপনার কোর্সের মৌলিক তথ্য দিয়ে শুরু করুন
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border space-y-6">
                        {/* Bengali Title */}
                        <div>
                            <label htmlFor="titleBn" className="block text-sm font-medium mb-2">
                                কোর্সের শিরোনাম (বাংলা) *
                            </label>
                            <input
                                id="titleBn"
                                name="titleBn"
                                type="text"
                                required
                                value={formData.titleBn}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="যেমন: কুরআন তিলাওয়াত শিক্ষা"
                            />
                        </div>

                        {/* English Title */}
                        <div>
                            <label htmlFor="titleEn" className="block text-sm font-medium mb-2">
                                কোর্সের শিরোনাম (ইংরেজি)
                            </label>
                            <input
                                id="titleEn"
                                name="titleEn"
                                type="text"
                                value={formData.titleEn}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g., Quran Recitation Course"
                            />
                        </div>

                        {/* Bengali Description */}
                        <div>
                            <label htmlFor="descriptionBn" className="block text-sm font-medium mb-2">
                                বিবরণ (বাংলা) *
                            </label>
                            <textarea
                                id="descriptionBn"
                                name="descriptionBn"
                                required
                                rows={4}
                                value={formData.descriptionBn}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="কোর্স সম্পর্কে বিস্তারিত লিখুন..."
                            />
                        </div>

                        {/* English Description */}
                        <div>
                            <label htmlFor="descriptionEn" className="block text-sm font-medium mb-2">
                                বিবরণ (ইংরেজি)
                            </label>
                            <textarea
                                id="descriptionEn"
                                name="descriptionEn"
                                rows={4}
                                value={formData.descriptionEn}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Course description in English..."
                            />
                        </div>

                        {/* Level */}
                        <div>
                            <label htmlFor="level" className="block text-sm font-medium mb-2">
                                স্তর
                            </label>
                            <select
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="beginner">শুরুর স্তর</option>
                                <option value="intermediate">মধ্যম স্তর</option>
                                <option value="advanced">উন্নত স্তর</option>
                            </select>
                        </div>

                        {/* Language */}
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium mb-2">
                                ভাষা
                            </label>
                            <select
                                id="language"
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="bn">বাংলা</option>
                                <option value="en">ইংরেজি</option>
                                <option value="ar">আরবি</option>
                            </select>
                        </div>

                        {/* Free Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                id="isFree"
                                name="isFree"
                                type="checkbox"
                                checked={formData.isFree}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-primary/20"
                            />
                            <label htmlFor="isFree" className="text-sm font-medium">
                                এটি একটি বিনামূল্যে কোর্স
                            </label>
                        </div>

                        {/* Price */}
                        {!formData.isFree && (
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium mb-2">
                                    মূল্য (টাকা)
                                </label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="৳0"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href="/teacher">
                            <Button type="button" variant="outline">
                                বাতিল করুন
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    তৈরি হচ্ছে...
                                </>
                            ) : (
                                'কোর্স তৈরি করুন'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
