'use client';

import { useState, use } from 'react';
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

export default function CreateSubjectPage({
    params,
}: {
    params: Promise<{ programId: string; semesterId: string }>;
}) {
    const { programId, semesterId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Separate state for male/female instructors
    const [selectedMaleTeachers, setSelectedMaleTeachers] = useState<Teacher[]>([]);
    const [selectedFemaleTeachers, setSelectedFemaleTeachers] = useState<Teacher[]>([]);

    const [thumbnailData, setThumbnailData] = useState<{ url: string; key: string } | null>(null);

    const [formData, setFormData] = useState({
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        isActive: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
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
            toast.error('বিষয়ের শিরোনাম (বাংলা) আবশ্যক');
            return;
        }

        if (!formData.descriptionBn.trim()) {
            toast.error('বিষয়ের বিবরণ (বাংলা) আবশ্যক');
            return;
        }

        if (!thumbnailData) {
            toast.error('থাম্বনেইল আপলোড করুন');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/admin/programs/${programId}/semesters/${semesterId}/subjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    thumbnail: thumbnailData.url,
                    maleInstructors: selectedMaleTeachers.map(t => t._id),
                    femaleInstructors: selectedFemaleTeachers.map(t => t._id),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'বিষয় তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success('বিষয় সফলভাবে তৈরি হয়েছে!');
            router.push(`/admin/programs/${programId}/semesters/${semesterId}`);
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'বিষয় তৈরি করতে সমস্যা হয়েছে';
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
                    <Link href={`/admin/programs/${programId}/semesters/${semesterId}`}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            ফিরে যান
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন বিষয় যুক্ত করুন</h1>
                    <p className="text-muted-foreground mt-2">
                        সেমিস্টারের জন্য নতুন বিষয়/কিতাব তৈরি করুন
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Thumbnail Upload */}
                    <div className="bg-card p-6 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-4">বিষয়ের কভার ছবি (Thumbnail) *</h2>
                        {thumbnailData ? (
                            <div className="space-y-3">
                                <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20">
                                    <p className="text-sm text-green-600 font-medium">
                                        ✓ আপলোড সফল হয়েছে
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setThumbnailData(null)}
                                >
                                    নতুন ছবি আপলোড করুন
                                </Button>
                            </div>
                        ) : (
                            <DirectR2ImageUpload onUploadComplete={handleThumbnailUpload} />
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="bg-card p-6 rounded-xl border space-y-4">
                        <h2 className="text-lg font-semibold mb-4">মৌলিক তথ্য</h2>

                        {/* Bengali Title */}
                        <div>
                            <label htmlFor="titleBn" className="block text-sm font-medium mb-2">
                                বিষয়ের নাম (বাংলা) *
                            </label>
                            <Input
                                id="titleBn"
                                name="titleBn"
                                type="text"
                                required
                                value={formData.titleBn}
                                onChange={handleChange}
                                placeholder="যেমন: নাহু বা সরফ"
                            />
                        </div>

                        {/* English Title */}
                        <div>
                            <label htmlFor="titleEn" className="block text-sm font-medium mb-2">
                                বিষয়ের নাম (ইংরেজি)
                            </label>
                            <Input
                                id="titleEn"
                                name="titleEn"
                                type="text"
                                value={formData.titleEn}
                                onChange={handleChange}
                                placeholder="e.g. Nahu or Sarf"
                            />
                        </div>
                        {/* Bengali Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                বিস্তারিত বিবরণ (বাংলা) *
                            </label>
                            <LexicalEditor
                                initialContent={formData.descriptionBn}
                                onChange={(json) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        descriptionBn: json,
                                    }))
                                }
                                placeholder="এই বিষয়ে কি কি পড়ানো হবে..."
                            />
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                id="isActive"
                                name="isActive"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-input"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium">
                                সক্রিয় (Active)
                            </label>
                        </div>
                    </div>

                    {/* Teacher Assignment */}
                    <div className="bg-card p-6 rounded-xl border space-y-6">
                        <h2 className="text-lg font-semibold border-b pb-2">শিক্ষক নিয়োগ</h2>

                        {/* Male */}
                        <div>
                            <h3 className="text-sm font-medium mb-3 text-blue-600">পুরুষ শিক্ষার্থীদের জন্য শিক্ষক</h3>
                            <TeacherSearchSelect
                                selectedTeachers={selectedMaleTeachers}
                                onTeachersChange={setSelectedMaleTeachers}
                                placeholder="শিক্ষক খুঁজুন..."
                            />
                        </div>

                        {/* Female */}
                        <div>
                            <h3 className="text-sm font-medium mb-3 text-pink-600">মহিলা শিক্ষার্থীদের জন্য শিক্ষিকা</h3>
                            <TeacherSearchSelect
                                selectedTeachers={selectedFemaleTeachers}
                                onTeachersChange={setSelectedFemaleTeachers}
                                placeholder="শিক্ষিকা খুঁজুন..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pb-8">
                        <Link href={`/admin/programs/${programId}/semesters/${semesterId}`}>
                            <Button type="button" variant="outline">
                                বাতিল করুন
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    সংরক্ষণ করুন
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
