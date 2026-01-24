'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import TeacherSearchSelect from '@/components/admin/TeacherSearchSelect';
import { DirectR2ImageUpload } from '@/components/upload/DirectR2ImageUpload';
import dynamic from 'next/dynamic';

const LexicalEditor = dynamic(() => import('@/components/editor/LexicalEditor'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />,
});

interface Teacher {
    _id: string;
    name: string;
    email: string;
}

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);
    const [thumbnailData, setThumbnailData] = useState<{ url: string; key: string } | null>(null);

    const [formData, setFormData] = useState({
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        // descriptionEn removed
        courseDuration: '',
        price: '0',
        isFree: true,
        level: 'beginner',
        publishImmediately: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));

            // Auto-set price to 0 if free
            if (name === 'isFree' && checked) {
                setFormData(prev => ({ ...prev, price: '0' }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleThumbnailUpload = (url: string, key: string) => {
        setThumbnailData({ url, key });
        toast.success('থাম্বনেইল আপলোড সফল হয়েছে!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.titleBn.trim()) {
            toast.error('কোর্সের শিরোনাম (বাংলা) আবশ্যক');
            return;
        }

        if (!formData.descriptionBn.trim() || formData.descriptionBn === '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}') {
            toast.error('কোর্সের বিবরণ (বাংলা) আবশ্যক');
            return;
        }

        if (!formData.titleEn.trim()) {
            toast.error('কোর্সের শিরোনাম (ইংরেজি) আবশ্যক (URL এর জন্য)');
            return;
        }

        if (selectedTeachers.length === 0) {
            toast.error('অন্তত একজন শিক্ষক নিয়োগ করুন');
            return;
        }

        if (!thumbnailData) {
            toast.error('থাম্বনেইল আপলোড করুন');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    instructors: selectedTeachers.map(t => t._id),
                    thumbnail: thumbnailData.url,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'কোর্স তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success('কোর্স সফলভাবে তৈরি হয়েছে!');
            router.push('/admin/courses');
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
                    <Link href="/admin/courses">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            ফিরে যান
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন কোর্স তৈরি করুন</h1>
                    <p className="text-muted-foreground mt-2">
                        কোর্সের বিস্তারিত তথ্য এবং শিক্ষক নিয়োগ দিন
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Thumbnail Upload */}
                    <div className="bg-card p-6 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-4">কোর্স থাম্বনেইল *</h2>
                        {thumbnailData ? (
                            <div className="space-y-3">
                                <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20">
                                    <p className="text-sm text-green-600 font-medium">
                                        ✓ থাম্বনেইল আপলোড সফল হয়েছে
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setThumbnailData(null)}
                                >
                                    নতুন থাম্বনেইল আপলোড করুন
                                </Button>
                            </div>
                        ) : (
                            <DirectR2ImageUpload onUploadComplete={handleThumbnailUpload} />
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="bg-card p-6 rounded-xl border space-y-4">
                        <h2 className="text-lg font-semibold mb-4">কোর্সের তথ্য</h2>

                        {/* Bengali Title */}
                        <div>
                            <label htmlFor="titleBn" className="block text-sm font-medium mb-2">
                                কোর্সের শিরোনাম (বাংলা) *
                            </label>
                            <Input
                                id="titleBn"
                                name="titleBn"
                                type="text"
                                required
                                value={formData.titleBn}
                                onChange={handleChange}
                                placeholder="যেমন: কুরআন তিলাওয়াত শিক্ষা"
                            />
                        </div>

                        {/* English Title */}
                        <div>
                            <label htmlFor="titleEn" className="block text-sm font-medium mb-2">
                                কোর্সের শিরোনাম (ইংরেজি)
                            </label>
                            <Input
                                id="titleEn"
                                name="titleEn"
                                type="text"
                                required
                                value={formData.titleEn}
                                onChange={handleChange}
                                placeholder="e.g., Quran Recitation Course (Used for URL slug)"
                            />
                        </div>

                        {/* Bengali Description */}
                        <div>
                            <label htmlFor="descriptionBn" className="block text-sm font-medium mb-2">
                                কোর্সের বিবরণ (বাংলা) *
                            </label>
                            <LexicalEditor
                                onChange={(json) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        descriptionBn: json,
                                    }))
                                }
                            />
                        </div>

                        {/* Course Duration */}
                        <div>
                            <label htmlFor="courseDuration" className="block text-sm font-medium mb-2">
                                কোর্সের সময়কাল
                            </label>
                            <Input
                                id="courseDuration"
                                name="courseDuration"
                                type="text"
                                value={formData.courseDuration}
                                onChange={handleChange}
                                placeholder="যেমন: 30 দিন, 3 মাস, ইত্যাদি"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Level */}
                            <div>
                                <label htmlFor="level" className="block text-sm font-medium mb-2">
                                    কোর্স লেভেল
                                </label>
                                <select
                                    id="level"
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                >
                                    <option value="beginner">শুরু (Beginner)</option>
                                    <option value="intermediate">মধ্যম (Intermediate)</option>
                                    <option value="advanced">উচ্চ (Advanced)</option>
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium mb-2">
                                    মূল্য (টাকা)
                                </label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleChange}
                                    disabled={formData.isFree}
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
                                className="h-4 w-4 rounded border-input"
                            />
                            <label htmlFor="isFree" className="text-sm font-medium">
                                এটি একটি বিনামূল্যে কোর্স
                            </label>
                        </div>

                        {/* Publish Immediately Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                id="publishImmediately"
                                name="publishImmediately"
                                type="checkbox"
                                checked={formData.publishImmediately}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-input"
                            />
                            <label htmlFor="publishImmediately" className="text-sm font-medium">
                                তৈরি করার সাথে সাথে প্রকাশ করুন (ভিডিও ছাড়াই এনরোলমেন্ট শুরু হবে)
                            </label>
                        </div>
                    </div>

                    {/* Teacher Assignment */}
                    <div className="bg-card p-6 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-4">শিক্ষক নিয়োগ *</h2>
                        <TeacherSearchSelect
                            selectedTeachers={selectedTeachers}
                            onTeachersChange={setSelectedTeachers}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href="/admin/courses">
                            <Button type="button" variant="outline">
                                বাতিল করুন
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading || !thumbnailData || selectedTeachers.length === 0}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    তৈরি হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    কোর্স তৈরি করুন
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
