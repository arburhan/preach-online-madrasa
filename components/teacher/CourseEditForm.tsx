'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CourseEditFormProps {
    course: {
        _id: string;
        titleBn: string;
        titleEn?: string;
        descriptionBn: string;
        descriptionEn?: string;
        price: number;
        isFree: boolean;
        level?: string;
        language?: string;
        status: string;
    };
}

export default function CourseEditForm({ course }: CourseEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [formData, setFormData] = useState({
        titleBn: course.titleBn,
        titleEn: course.titleEn || '',
        descriptionBn: course.descriptionBn,
        descriptionEn: course.descriptionEn || '',
        price: course.price.toString(),
        isFree: course.isFree,
        level: course.level || 'beginner',
        language: course.language || 'bn',
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

    const handleSave = async () => {
        setLoading(true);

        try {
            const response = await fetch(`/api/courses/${course._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'কোর্স আপডেট করতে সমস্যা হয়েছে');
            }

            toast.success('কোর্স আপডেট হয়েছে!');
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'কোর্স আপডেট করতে সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        setPublishLoading(true);

        try {
            const endpoint = course.status === 'published'
                ? `/api/courses/${course._id}/publish`
                : `/api/courses/${course._id}/publish`;

            const method = course.status === 'published' ? 'DELETE' : 'POST';

            const response = await fetch(endpoint, { method });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
            }

            toast.success(data.message);
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setPublishLoading(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">কোর্সের তথ্য</h2>
                <div className="flex gap-2">
                    <Button
                        variant={course.status === 'published' ? 'destructive' : 'default'}
                        onClick={handlePublish}
                        disabled={publishLoading}
                    >
                        {publishLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : course.status === 'published' ? (
                            'অপ্রকাশিত করুন'
                        ) : (
                            'প্রকাশ করুন'
                        )}
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        সংরক্ষণ করুন
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Bengali Title */}
                <div>
                    <label htmlFor="titleBn" className="block text-sm font-medium mb-2">
                        শিরোনাম (বাংলা) *
                    </label>
                    <input
                        id="titleBn"
                        name="titleBn"
                        type="text"
                        required
                        value={formData.titleBn}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* English Title */}
                <div>
                    <label htmlFor="titleEn" className="block text-sm font-medium mb-2">
                        শিরোনাম (ইংরেজি)
                    </label>
                    <input
                        id="titleEn"
                        name="titleEn"
                        type="text"
                        value={formData.titleEn}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        বিনামূল্যে কোর্স
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
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
