'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Save, Eye, Trash2 } from 'lucide-react';
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

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [loadingPost, setLoadingPost] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
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
        const fetchData = async () => {
            try {
                const [postRes, catRes] = await Promise.all([
                    fetch(`/api/admin/blogs/${postId}`),
                    fetch('/api/admin/categories')
                ]);

                const postData = await postRes.json();
                const catData = await catRes.json();

                if (postRes.ok && postData) {
                    setFormData({
                        title: postData.title || '',
                        excerpt: postData.excerpt || '',
                        content: postData.content || '',
                        category: postData.category?._id || '',
                        status: postData.status || 'draft',
                        isFeatured: postData.isFeatured || false,
                        metaTitle: postData.metaTitle || '',
                        metaDescription: postData.metaDescription || '',
                    });
                    setThumbnailUrl(postData.thumbnail || '');
                }

                if (catRes.ok && Array.isArray(catData)) {
                    setCategories(catData);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('ডাটা লোড করতে সমস্যা হয়েছে');
            } finally {
                setLoadingPost(false);
            }
        };

        if (postId) {
            fetchData();
        }
    }, [postId]);

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

        if (!formData.title.trim()) {
            toast.error('শিরোনাম আবশ্যক');
            return;
        }

        if (!formData.excerpt.trim()) {
            toast.error('সংক্ষিপ্ত বিবরণ আবশ্যক');
            return;
        }

        if (!formData.category) {
            toast.error('ক্যাটাগরি নির্বাচন করুন');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/admin/blogs/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    thumbnail: thumbnailUrl,
                    status: publishNow ? 'published' : formData.status,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'পোষ্ট আপডেট করতে সমস্যা হয়েছে');
            }

            toast.success('পোষ্ট সফলভাবে আপডেট হয়েছে!');
            router.push('/admin/blogs');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'পোষ্ট আপডেট করতে সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('আপনি কি নিশ্চিত এই পোষ্ট মুছে ফেলতে চান?')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/blogs/${postId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Delete failed');

            toast.success('পোষ্ট মুছে ফেলা হয়েছে');
            router.push('/admin/blogs');
        } catch {
            toast.error('পোষ্ট মুছতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    if (loadingPost) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">পোষ্ট সম্পাদনা</h1>
                            <p className="text-muted-foreground mt-2">
                                ব্লগ পোষ্ট আপডেট করুন
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            মুছে ফেলুন
                        </Button>
                    </div>
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
                                    width={100}
                                    height={100}
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
                    </div>

                    {/* Basic Info */}
                    <div className="bg-card p-6 rounded-xl border space-y-4">
                        <h2 className="text-lg font-semibold mb-4">পোষ্টের তথ্য</h2>

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

                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium mb-2">
                                স্ট্যাটাস
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                            >
                                <option value="draft">ড্রাফট</option>
                                <option value="published">প্রকাশিত</option>
                                <option value="archived">আর্কাইভ</option>
                            </select>
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
                                    সংরক্ষণ করুন
                                </>
                            )}
                        </Button>
                        {formData.status !== 'published' && (
                            <Button
                                type="button"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                প্রকাশ করুন
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
