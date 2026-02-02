'use client';

import { use, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DirectR2VideoUpload } from '@/components/upload/DirectR2Upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DirectR2FileUpload } from "@/components/upload/DirectR2FileUploader";

interface PageParams {
    programId: string;
    semesterNumber: string;
}

export default function NewSemesterLessonPage({ params }: { params: Promise<PageParams> }) {
    const { programId, semesterNumber } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const moduleId = searchParams.get('module'); // Get module from query param
    const [loading, setLoading] = useState(false);
    const [sourceType, setSourceType] = useState<'r2' | 'youtube' | 'file'>('r2');
    const [videoData, setVideoData] = useState<{ url: string; key?: string } | null>(null);
    const [formData, setFormData] = useState({
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        descriptionEn: '',
        isFree: false,
    });
    const [attachments, setAttachments] = useState<Array<{ name: string; url: string; key: string; type: string }>>([]);

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
        toast.success('আপলোড সফল হয়েছে!');
    };

    const handleAttachmentUpload = (url: string, key: string, name: string) => {
        setAttachments(prev => [...prev, {
            name: name || 'Attached File',
            url,
            key,
            type: 'file'
        }]);
        toast.success('ফাইল সংযুক্ত করা হয়েছে!');
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleYouTubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoData({ url: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!videoData?.url) {
            toast.error('দয়া করে বিষয়বস্তু যোগ করুন');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/admin/programs/${programId}/semesters/${semesterNumber}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    videoSource: sourceType,
                    videoUrl: videoData.url,
                    videoKey: videoData.key,
                    attachments: attachments,
                    module: moduleId, // Include module ID
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'পাঠ তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success('পাঠ তৈরি হয়েছে!');
            router.push(`/admin/programs/${programId}/semesters/${semesterNumber}`);
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
                    <Link href={`/admin/programs/${programId}/semesters/${semesterNumber}`}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            সেমিস্টারে ফিরে যান
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন পাঠ যোগ করুন</h1>
                    <p className="text-muted-foreground mt-2">
                        সেমিস্টারে একটি নতুন ভিডিও বা ফাইল যোগ করুন
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Content Upload Section */}
                    <div className="bg-card p-6 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-4">বিষয়বস্তু ধরণ *</h2>

                        <Tabs defaultValue="r2" onValueChange={(v) => {
                            setSourceType(v as 'r2' | 'youtube' | 'file');
                            setVideoData(null);
                        }}>
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="r2">ভিডিও আপলোড</TabsTrigger>
                                <TabsTrigger value="youtube">YouTube URL</TabsTrigger>
                                <TabsTrigger value="file">ফাইল আপলোড</TabsTrigger>
                            </TabsList>

                            <TabsContent value="r2">
                                {videoData ? (
                                    <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-green-600 font-medium">
                                                ✓ ভিডিও আপলোড সফল হয়েছে
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 break-all">
                                                {videoData.key}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setVideoData(null)}
                                        >
                                            পরিবর্তন
                                        </Button>
                                    </div>
                                ) : (
                                    <DirectR2VideoUpload onUploadComplete={handleVideoUpload} />
                                )}
                            </TabsContent>

                            <TabsContent value="youtube">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">YouTube Video URL</label>
                                    <input
                                        type="url"
                                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={videoData?.url || ''}
                                        onChange={handleYouTubeChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        YouTube ভিডিওর লিংক এখানে পেস্ট করুন
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="file">
                                {videoData ? (
                                    <div className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/20 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-blue-600 font-medium">
                                                ✓ ফাইল আপলোড সফল হয়েছে
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 break-all">
                                                {videoData.key}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setVideoData(null)}
                                        >
                                            পরিবর্তন
                                        </Button>
                                    </div>
                                ) : (
                                    <DirectR2FileUpload onUploadComplete={handleVideoUpload} />
                                )}
                            </TabsContent>
                        </Tabs>
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

                    {/* Attachments Section */}
                    <div className="bg-card p-6 rounded-xl border space-y-4">
                        <h2 className="text-lg font-semibold mb-4">সংযুক্ত ফাইল (Attachments)</h2>

                        <div className="mb-4">
                            <DirectR2FileUpload
                                onUploadComplete={(url, key, name) => handleAttachmentUpload(url, key, name)}
                                label="ফাইল সংযুক্ত করুন"
                            />
                        </div>

                        {attachments.length > 0 && (
                            <div className="space-y-2">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-primary/10 p-2 rounded">
                                                <Upload className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground truncate w-48">{file.key}</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAttachment(index)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                        >
                                            সরান
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {attachments.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                                কোনো ফাইল সংযুক্ত করা হয়নি
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href={`/admin/programs/${programId}/semesters/${semesterNumber}`}>
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
