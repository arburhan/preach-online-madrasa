'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { DirectR2ImageUpload } from '@/components/upload/DirectR2ImageUpload';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const LexicalEditor = dynamic(() => import('@/components/editor/LexicalEditor'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />,
});

interface Category {
    _id: string;
    nameBn: string;
    nameEn: string;
}

export default function NewBlogPostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [thumbnailUrl, setThumbnailUrl] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        status: 'draft',
        isFeatured: false,
        metaTitle: '',
        metaDescription: '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/admin/categories');
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleThumbnailUpload = (url: string) => {
        setThumbnailUrl(url);
        toast.success('থাম্বনেইল আপলোড সফল হয়েছে!');
    };

    const handleSubmit = async (e: React.FormEvent, publishNow: boolean = false) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('শিরোনাম আবশ্যক');
            return;
        }

        if (!formData.excerpt.trim()) {
            toast.error('সংক্ষিপ্ত বিবরণ আবশ্যক');
            return;
        }

        if (!formData.content || formData.content === '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}') {
            toast.error('বিস্তারিত বিবরণ আবশ্যক');
            return;
        }

        if (!formData.category) {
            toast.error('ক্যাটাগরি নির্বাচন করুন');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    thumbnail: thumbnailUrl,
                    status: publishNow ? 'published' : formData.status,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'পোষ্ট তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success(publishNow ? 'পোষ্ট প্রকাশিত হয়েছে!' : 'পোষ্ট সংরক্ষিত হয়েছে!');
            router.push('/admin/blogs');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'পোষ্ট তৈরি করতে সমস্যা হয়েছে';
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
                    <Link href="/admin/blogs">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            ব্লগ তালিকায় ফিরে যান
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন ব্লগ পোষ্ট</h1>
                    <p className="text-muted-foreground mt-2">
                        নতুন ব্লগ পোষ্ট তৈরি করুন
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
                    {/* Thumbnail Upload */}
                    <div className="bg-card p-6 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-4">থাম্বনেইল</h2>
                        {thumbnailUrl ? (
                            <div className="space-y-3">
                                <Image
                                    src={thumbnailUrl}
                                    width={500}
                                    height={500}
                                    alt="Thumbnail"
                                    className="w-full max-w-md h-48 object-cover rounded-lg"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setThumbnailUrl('')}
                                >
                                    নতুন থাম্বনেইল আপলোড করুন
                                </Button>
                            </div>
                        ) : (
                            <DirectR2ImageUpload onUploadComplete={handleThumbnailUpload} />
                        )}
                    </div>

                    {/* Category Selection */}
                    <div className="bg-card p-6 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-4">ক্যাটাগরি *</h2>
                        {loadingCategories ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>ক্যাটাগরি লোড হচ্ছে...</span>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-muted-foreground">
                                <p>কোনো ক্যাটাগরি নেই। <Link href="/admin/settings" className="text-primary underline">সেটিংস</Link> থেকে ক্যাটাগরি যোগ করুন।</p>
                            </div>
                        ) : (
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                            >
                                <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.nameBn} ({cat.nameEn})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="bg-card p-6 rounded-xl border space-y-4">
                        <h2 className="text-lg font-semibold mb-4">পোষ্টের তথ্য</h2>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                শিরোনাম *
                            </label>
                            <Input
                                id="title"
                                name="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="পোষ্টের শিরোনাম লিখুন"
                            />
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
                                সংক্ষিপ্ত বিবরণ * <span className="text-xs text-muted-foreground">(সর্বোচ্চ ৫০০ অক্ষর)</span>
                            </label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                rows={3}
                                required
                                value={formData.excerpt}
                                onChange={handleChange}
                                placeholder="পোষ্টের সংক্ষিপ্ত বিবরণ লিখুন..."
                                maxLength={500}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm resize-none"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.excerpt.length}/500
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-card p-6 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-4">বিস্তারিত বিবরণ *</h2>
                        <LexicalEditor
                            initialContent={formData.content}
                            onChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
                            placeholder="এখানে পোষ্টের বিস্তারিত লিখুন..."
                            onImageUpload={async (file: File) => {
                                // Get presigned URL for blog images
                                const res = await fetch('/api/r2/upload', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        fileName: file.name,
                                        fileType: file.type,
                                        folder: 'images/blogs',
                                    }),
                                });

                                if (!res.ok) {
                                    throw new Error('Upload URL পেতে সমস্যা হয়েছে');
                                }

                                const { uploadUrl, publicUrl } = await res.json();

                                // Upload to R2
                                const uploadRes = await fetch(uploadUrl, {
                                    method: 'PUT',
                                    body: file,
                                    headers: { 'Content-Type': file.type },
                                });

                                if (!uploadRes.ok) {
                                    throw new Error('ছবি আপলোড করতে সমস্যা হয়েছে');
                                }

                                return publicUrl;
                            }}
                        />
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-card p-6 rounded-xl border space-y-4">
                        <h2 className="text-lg font-semibold mb-4">SEO সেটিংস (ঐচ্ছিক)</h2>

                        <div>
                            <label htmlFor="metaTitle" className="block text-sm font-medium mb-2">
                                মেটা শিরোনাম
                            </label>
                            <Input
                                id="metaTitle"
                                name="metaTitle"
                                type="text"
                                value={formData.metaTitle}
                                onChange={handleChange}
                                placeholder="SEO এর জন্য শিরোনাম"
                            />
                        </div>

                        <div>
                            <label htmlFor="metaDescription" className="block text-sm font-medium mb-2">
                                মেটা বিবরণ
                            </label>
                            <textarea
                                id="metaDescription"
                                name="metaDescription"
                                rows={2}
                                value={formData.metaDescription}
                                onChange={handleChange}
                                placeholder="SEO এর জন্য সংক্ষিপ্ত বিবরণ"
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                className="rounded"
                            />
                            <label htmlFor="isFeatured" className="text-sm">ফিচারড পোষ্ট হিসেবে দেখান</label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href="/admin/blogs">
                            <Button type="button" variant="outline">
                                বাতিল করুন
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant="outline"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    ড্রাফট সংরক্ষণ করুন
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    প্রকাশ হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    প্রকাশ করুন
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
