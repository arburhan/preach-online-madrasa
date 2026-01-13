'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DirectR2VideoUpload } from '@/components/upload/DirectR2Upload';

export default function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [videoData, setVideoData] = useState<{ url: string; key: string } | null>(null);
    const [formData, setFormData] = useState({
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        descriptionEn: '',
        duration: '0',
        order: '0',
        isFree: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleVideoUpload = (url: string, key: string) => {
        setVideoData({ url, key });
        toast.success('ভিডিও আপলোড সফল হয়েছে!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!videoData) {
            toast.error('দয়া করে একটি ভিডিও আপলোড করুন');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/courses/${id}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    videoUrl: videoData.url,
                    videoKey: videoData.key,
                    duration: parseInt(formData.duration),
                    order: parseInt(formData.order),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'পাঠ তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success('পাঠ তৈরি হয়েছে!');
            router.push(`/teacher/courses/${id}`);
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'পাঠ তৈরি করতে সমস্যা হয়েছে';
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
                    <Link href={`/teacher/courses/${id}`}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            ফিরে যান
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন পাঠ যোগ করুন</h1>
                    <p className="text-muted-foreground mt-2">
                        আপনার কোর্সে একটি নতুন ভিডিও পাঠ যোগ করুন
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Upload */}
                    <div className="bg-card p-6 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-4">ভিডিও আপলোড করুন *</h2>
                        {videoData ? (
                            <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20">
                                <p className="text-sm text-green-600 font-medium">
                                    ✓ ভিডিও আপলোড সফল হয়েছে
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {videoData.key}
                                </p>
                            </div>
                        ) : (
                            <DirectR2VideoUpload onUploadComplete={handleVideoUpload} />
                        )}
                    </div>

                    {/* Lesson Details */}
                    <div className="bg-card p-6 rounded-xl border space-y-4">
                        <h2 className="text-lg font-semibold mb-4">পাঠের তথ্য</h2>

                        {/* Bengali Title */}
                        <div>
                            <label htmlFor="titleBn" className="block text-sm font-medium mb-2">
                                পাঠের শিরোনাম (বাংলা) *
                            </label>
                            <input
                                id="titleBn"
                                name="titleBn"
                                type="text"
                                required
                                value={formData.titleBn}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="যেমন: আরবি বর্ণমালা শিক্ষা"
                            />
                        </div>

                        {/* English Title */}
                        <div>
                            <label htmlFor="titleEn" className="block text-sm font-medium mb-2">
                                পাঠের শিরোনাম (ইংরেজি)
                            </label>
                            <input
                                id="titleEn"
                                name="titleEn"
                                type="text"
                                value={formData.titleEn}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="e.g., Arabic Alphabets"
                            />
                        </div>

                        {/* Bengali Description */}
                        <div>
                            <label htmlFor="descriptionBn" className="block text-sm font-medium mb-2">
                                বিবরণ (বাংলা)
                            </label>
                            <textarea
                                id="descriptionBn"
                                name="descriptionBn"
                                rows={3}
                                value={formData.descriptionBn}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="পাঠ সম্পর্কে সংক্ষেপে লিখুন..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Duration */}
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium mb-2">
                                    সময়কাল (সেকেন্ড)
                                </label>
                                <input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    min="0"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="600"
                                />
                            </div>

                            {/* Order */}
                            <div>
                                <label htmlFor="order" className="block text-sm font-medium mb-2">
                                    ক্রম নম্বর
                                </label>
                                <input
                                    id="order"
                                    name="order"
                                    type="number"
                                    min="0"
                                    value={formData.order}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="0"
                                />
                            </div>
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
                                এটি একটি বিনামূল্যে পাঠ (প্রিভিউ)
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href={`/teacher/courses/${id}`}>
                            <Button type="button" variant="outline">
                                বাতিল করুন
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading || !videoData}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    তৈরি হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    পাঠ যোগ করুন
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
