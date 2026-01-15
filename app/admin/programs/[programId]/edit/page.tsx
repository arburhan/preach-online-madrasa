'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    email: string;
    gender: 'male' | 'female';
}

interface ProgramData {
    titleBn: string;
    titleEn: string;
    descriptionBn: string;
    descriptionEn: string;
    thumbnail: string;
    durationMonths: number;
    totalSemesters: number;
    price: number;
    discountPrice?: number;
    isFree: boolean;
    enrollmentStartDate?: string;
    enrollmentEndDate?: string;
    maxStudents?: number;
    status: string;
    isPopular: boolean;
    isFeatured: boolean;
    semesters: string[];
    features: string[];
    maleInstructors?: string[];
    femaleInstructors?: string[];
}

export default function EditProgramPage() {
    const router = useRouter();
    const params = useParams();
    const programId = params.programId as string;

    const [formData, setFormData] = useState<ProgramData | null>(null);
    const [features, setFeatures] = useState<string[]>([]);
    const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
    const [selectedMaleTeachers, setSelectedMaleTeachers] = useState<string[]>([]);
    const [selectedFemaleTeachers, setSelectedFemaleTeachers] = useState<string[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [maleTeachers, setMaleTeachers] = useState<Teacher[]>([]);
    const [femaleTeachers, setFemaleTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Load program data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [programRes, semesterRes, teacherRes] = await Promise.all([
                    fetch(`/api/programs/${programId}`),
                    fetch('/api/semesters'),
                    fetch('/api/admin/teachers?status=approved')
                ]);

                const program = await programRes.json();
                const semesterData = await semesterRes.json();
                const teacherData = await teacherRes.json();

                if (!programRes.ok) throw new Error('প্রোগ্রাম পাওয়া যায়নি');

                setFormData({
                    titleBn: program.titleBn || '',
                    titleEn: program.titleEn || '',
                    descriptionBn: program.descriptionBn || '',
                    descriptionEn: program.descriptionEn || '',
                    thumbnail: program.thumbnail || '',
                    durationMonths: program.durationMonths || 24,
                    totalSemesters: program.totalSemesters || 8,
                    price: program.price || 0,
                    discountPrice: program.discountPrice,
                    isFree: program.isFree || false,
                    enrollmentStartDate: program.enrollmentStartDate?.split('T')[0] || '',
                    enrollmentEndDate: program.enrollmentEndDate?.split('T')[0] || '',
                    maxStudents: program.maxStudents,
                    status: program.status || 'draft',
                    isPopular: program.isPopular || false,
                    isFeatured: program.isFeatured || false,
                    semesters: program.semesters?.map((s: { _id: string }) => s._id) || [],
                    features: program.features || [],
                    maleInstructors: program.maleInstructors || [],
                    femaleInstructors: program.femaleInstructors || [],
                });

                setFeatures(program.features || ['']);
                setSelectedSemesters(program.semesters?.map((s: { _id: string }) => s._id) || []);
                setSelectedMaleTeachers(program.maleInstructors || []);
                setSelectedFemaleTeachers(program.femaleInstructors || []);

                if (Array.isArray(semesterData)) setSemesters(semesterData);
                if (Array.isArray(teacherData)) {
                    setMaleTeachers(teacherData.filter((t: Teacher) => t.gender === 'male'));
                    setFemaleTeachers(teacherData.filter((t: Teacher) => t.gender === 'female'));
                }
            } catch (error) {
                console.error(error);
                toast.error('ডেটা লোড করতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [programId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => prev ? {
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        } : null);
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', 'programs');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setFormData(prev => prev ? { ...prev, thumbnail: data.url } : null);
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
        if (!formData) return;
        setSaving(true);

        try {
            const response = await fetch(`/api/programs/${programId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    semesters: selectedSemesters,
                    features: features.filter(f => f.trim()),
                    maleInstructors: selectedMaleTeachers,
                    femaleInstructors: selectedFemaleTeachers,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'আপডেট করতে সমস্যা হয়েছে');
            }

            toast.success('প্রোগ্রাম আপডেট হয়েছে!');
            router.push(`/admin/programs/${programId}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'সমস্যা হয়েছে';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>প্রোগ্রাম পাওয়া যায়নি</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href={`/admin/programs/${programId}`}
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        প্রোগ্রাম বিস্তারিত
                    </Link>
                    <h1 className="text-3xl font-bold">প্রোগ্রাম এডিট করুন</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                    {/* Thumbnail Upload */}
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">থাম্বনেইল</h2>
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
                                        onClick={() => setFormData(prev => prev ? { ...prev, thumbnail: '' } : null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
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
                                            ছবি আপলোড
                                        </span>
                                    </Button>
                                </label>
                                <p className="text-xs text-muted-foreground mt-2">
                                    সর্বোচ্চ 5MB, JPG/PNG
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
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">প্রোগ্রামের নাম (ইংরেজি) *</label>
                                <input
                                    type="text"
                                    name="titleEn"
                                    value={formData.titleEn}
                                    onChange={handleChange}
                                    required
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
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">মেয়াদ (মাস)</label>
                                <input
                                    type="number"
                                    name="durationMonths"
                                    value={formData.durationMonths}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">মূল্য (৳)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm"
                                />
                            </div>
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
                        </div>
                    </div>

                    {/* Teachers Selection */}
                    <div className="bg-card rounded-xl border p-6 space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">শিক্ষক নির্বাচন</h2>

                        {/* Male Teachers */}
                        <div>
                            <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500" />
                                পুরুষ শিক্ষক
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {maleTeachers.map(teacher => (
                                    <label
                                        key={teacher._id}
                                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-sm ${selectedMaleTeachers.includes(teacher._id)
                                            ? 'border-primary bg-primary/5'
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
                                মহিলা শিক্ষিকা
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {femaleTeachers.map(teacher => (
                                    <label
                                        key={teacher._id}
                                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-sm ${selectedFemaleTeachers.includes(teacher._id)
                                            ? 'border-primary bg-primary/5'
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
                    </div>

                    {/* Semesters */}
                    <div className="bg-card rounded-xl border p-6 space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">সেমিস্টার</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {semesters.map(semester => (
                                <label
                                    key={semester._id}
                                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${selectedSemesters.includes(semester._id)
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
                                    />
                                    <span className="text-sm">{semester.titleBn}</span>
                                </label>
                            ))}
                        </div>
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
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFeatures([...features, ''])}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            সুবিধা যোগ করুন
                        </Button>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={saving} className="flex-1">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                'পরিবর্তন সংরক্ষণ করুন'
                            )}
                        </Button>
                        <Link href={`/admin/programs/${programId}`}>
                            <Button type="button" variant="outline">বাতিল</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
