'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Semester {
    _id: string;
    number: number;
    titleBn: string;
    level: string;
}

interface Teacher {
    _id: string;
    name: string;
    gender: 'male' | 'female';
}

export default function CreateProgramPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        descriptionEn: '',
        thumbnail: '',
        durationMonths: '24',
        totalSemesters: '8',
        price: '0',
        discountPrice: '',
        isFree: false,
        enrollmentStartDate: '',
        enrollmentEndDate: '',
        maxStudents: '',
        status: 'draft',
        isPopular: false,
        isFeatured: false,
    });

    const [features, setFeatures] = useState<string[]>(['']);
    const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
    const [selectedMaleTeachers, setSelectedMaleTeachers] = useState<string[]>([]);
    const [selectedFemaleTeachers, setSelectedFemaleTeachers] = useState<string[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [maleTeachers, setMaleTeachers] = useState<Teacher[]>([]);
    const [femaleTeachers, setFemaleTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Load semesters and teachers
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [semesterRes, teacherRes] = await Promise.all([
                    fetch('/api/semesters'),
                    fetch('/api/admin/teachers?status=approved')
                ]);

                const semesterData = await semesterRes.json();
                const teacherData = await teacherRes.json();

                if (Array.isArray(semesterData)) setSemesters(semesterData);
                if (Array.isArray(teacherData)) {
                    setMaleTeachers(teacherData.filter((t: Teacher) => t.gender === 'male'));
                    setFemaleTeachers(teacherData.filter((t: Teacher) => t.gender === 'female'));
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'programs');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setFormData(prev => ({ ...prev, thumbnail: data.url }));
            toast.success('ছবি আপলোড হয়েছে!');
        } catch (error) {
            console.error(error);
            toast.error('ছবি আপলোড করতে সমস্যা হয়েছে');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/programs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    durationMonths: parseInt(formData.durationMonths),
                    totalSemesters: parseInt(formData.totalSemesters),
                    price: parseInt(formData.price),
                    discountPrice: formData.discountPrice ? parseInt(formData.discountPrice) : undefined,
                    maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined,
                    semesters: selectedSemesters,
                    features: features.filter(f => f.trim()),
                    maleInstructors: selectedMaleTeachers,
                    femaleInstructors: selectedFemaleTeachers,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'প্রোগ্রাম তৈরি করতে সমস্যা হয়েছে');
            }

            toast.success('প্রোগ্রাম সফলভাবে তৈরি হয়েছে!');
            router.push('/admin/programs');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href="/admin/programs"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        প্রোগ্রাম তালিকায় ফিরে যান
                    </Link>
                    <h1 className="text-3xl font-bold">নতুন লং কোর্স / প্রোগ্রাম তৈরি</h1>
                    <p className="text-muted-foreground mt-1">
                        সেমিস্টার ভিত্তিক দীর্ঘ মেয়াদি কোর্স তৈরি করুন
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                    {/* Thumbnail Upload */}
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">থাম্বনেইল ছবি</h2>
                        <div className="flex items-start gap-6">
                            {formData.thumbnail ? (
                                <div className="relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.thumbnail}
                                        alt="Thumbnail"
                                        className="w-48 h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailUpload}
                                    className="hidden"
                                    id="thumbnail-upload"
                                />
                                <label htmlFor="thumbnail-upload">
                                    <Button type="button" variant="outline" disabled={uploading} asChild>
                                        <span>
                                            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                            {uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                                        </span>
                                    </Button>
                                </label>
                                <p className="text-xs text-muted-foreground mt-2">
                                    সর্বোচ্চ 5MB, JPG/PNG/WebP
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-card rounded-xl border p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-2">মৌলিক তথ্য</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">প্রোগ্রামের নাম (বাংলা) *</label>
                                <input
                                    type="text"
                                    name="titleBn"
                                    value={formData.titleBn}
                                    onChange={handleChange}
                                    required
                                    placeholder="যেমন: আলিম কোর্স"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">প্রোগ্রামের নাম (ইংরেজি) * <span className="text-xs text-muted-foreground">(URL এ ব্যবহৃত হবে)</span></label>
                                <input
                                    type="text"
                                    name="titleEn"
                                    value={formData.titleEn}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Alim Course"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">বিবরণ (বাংলা) *</label>
                            <textarea
                                name="descriptionBn"
                                value={formData.descriptionBn}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="প্রোগ্রামের বিস্তারিত বিবরণ লিখুন..."
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">মোট মেয়াদ (মাস)</label>
                                <input
                                    type="number"
                                    name="durationMonths"
                                    value={formData.durationMonths}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">মোট সেমিস্টার</label>
                                <input
                                    type="number"
                                    name="totalSemesters"
                                    value={formData.totalSemesters}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Teachers Selection */}
                    <div className="bg-card rounded-xl border p-6 space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">শিক্ষক নির্বাচন</h2>
                        <p className="text-sm text-muted-foreground">
                            এই প্রোগ্রামে কোন শিক্ষকরা পড়াবেন তা নির্বাচন করুন
                        </p>

                        {loadingData ? (
                            <div className="text-center py-4">শিক্ষক লোড হচ্ছে...</div>
                        ) : (
                            <>
                                {/* Male Teachers */}
                                <div>
                                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                                        পুরুষ শিক্ষক ({selectedMaleTeachers.length} জন নির্বাচিত)
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-muted rounded-lg">
                                        {maleTeachers.length === 0 ? (
                                            <p className="col-span-full text-muted-foreground text-sm">কোনো পুরুষ শিক্ষক নেই</p>
                                        ) : maleTeachers.map(teacher => (
                                            <label
                                                key={teacher._id}
                                                className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-sm bg-background ${selectedMaleTeachers.includes(teacher._id)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'hover:bg-muted'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMaleTeachers.includes(teacher._id)}
                                                    onChange={() => setSelectedMaleTeachers(prev =>
                                                        prev.includes(teacher._id)
                                                            ? prev.filter(id => id !== teacher._id)
                                                            : [...prev, teacher._id]
                                                    )}
                                                />
                                                {teacher.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Female Teachers */}
                                <div>
                                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-pink-500" />
                                        মহিলা শিক্ষিকা ({selectedFemaleTeachers.length} জন নির্বাচিত)
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-muted rounded-lg">
                                        {femaleTeachers.length === 0 ? (
                                            <p className="col-span-full text-muted-foreground text-sm">কোনো মহিলা শিক্ষিকা নেই</p>
                                        ) : femaleTeachers.map(teacher => (
                                            <label
                                                key={teacher._id}
                                                className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-sm bg-background ${selectedFemaleTeachers.includes(teacher._id)
                                                    ? 'border-pink-500 bg-pink-50'
                                                    : 'hover:bg-muted'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFemaleTeachers.includes(teacher._id)}
                                                    onChange={() => setSelectedFemaleTeachers(prev =>
                                                        prev.includes(teacher._id)
                                                            ? prev.filter(id => id !== teacher._id)
                                                            : [...prev, teacher._id]
                                                    )}
                                                />
                                                {teacher.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Semesters Selection */}
                    <div className="bg-card rounded-xl border p-6 space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">সেমিস্টার নির্বাচন</h2>
                        <p className="text-sm text-muted-foreground">
                            এই প্রোগ্রামে যে সেমিস্টারগুলো অন্তর্ভুক্ত থাকবে সেগুলো নির্বাচন করুন
                        </p>

                        {loadingData ? (
                            <div className="text-center py-4">সেমিস্টার লোড হচ্ছে...</div>
                        ) : semesters.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                কোনো সেমিস্টার পাওয়া যায়নি। আগে সেমিস্টার তৈরি করুন।
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {semesters.map(semester => (
                                    <label
                                        key={semester._id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedSemesters.includes(semester._id)
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSemesters.includes(semester._id)}
                                            onChange={() => setSelectedSemesters(prev =>
                                                prev.includes(semester._id)
                                                    ? prev.filter(id => id !== semester._id)
                                                    : [...prev, semester._id]
                                            )}
                                            className="rounded"
                                        />
                                        <div>
                                            <p className="font-medium text-sm">{semester.titleBn}</p>
                                            <p className="text-xs text-muted-foreground">{semester.level}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            নির্বাচিত: {selectedSemesters.length}টি সেমিস্টার
                        </p>
                    </div>

                    {/* Pricing */}
                    <div className="bg-card rounded-xl border p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-2">মূল্য ও এনরোলমেন্ট</h2>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="isFree"
                                checked={formData.isFree}
                                onChange={handleChange}
                                id="isFree"
                                className="rounded"
                            />
                            <label htmlFor="isFree" className="text-sm font-medium">বিনামূল্যে কোর্স</label>
                        </div>

                        {!formData.isFree && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">মূল্য (৳)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">ছাড়কৃত মূল্য (৳)</label>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        value={formData.discountPrice}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="ঐচ্ছিক"
                                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="bg-card rounded-xl border p-6 space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">সুবিধাসমূহ</h2>

                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => {
                                        const updated = [...features];
                                        updated[index] = e.target.value;
                                        setFeatures(updated);
                                    }}
                                    placeholder="যেমন: লাইভ ক্লাস সপ্তাহে ৩ দিন"
                                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => setFeatures([...features, ''])}>
                            <Plus className="h-4 w-4 mr-2" />
                            সুবিধা যোগ করুন
                        </Button>
                    </div>

                    {/* Status */}
                    <div className="bg-card rounded-xl border p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-2">প্রকাশনা সেটিংস</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">স্ট্যাটাস</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                >
                                    <option value="draft">ড্রাফট</option>
                                    <option value="published">প্রকাশিত</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isPopular"
                                    checked={formData.isPopular}
                                    onChange={handleChange}
                                    id="isPopular"
                                    className="rounded"
                                />
                                <label htmlFor="isPopular" className="text-sm font-medium">জনপ্রিয়</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    id="isFeatured"
                                    className="rounded"
                                />
                                <label htmlFor="isFeatured" className="text-sm font-medium">ফিচার্ড</label>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    অপেক্ষা করুন...
                                </>
                            ) : (
                                'প্রোগ্রাম তৈরি করুন'
                            )}
                        </Button>
                        <Link href="/admin/programs">
                            <Button type="button" variant="outline">বাতিল</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
