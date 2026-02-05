'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, Loader2, AlertCircle, Check, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ProfileData {
    name: string;
    phone: string;
    address: string;
    bio: string;
    gender: 'male' | 'female' | null;
}

interface GenderChangeRequest {
    status: 'pending' | 'approved' | 'rejected';
    requestedAt?: string;
    reason?: string;
}

export default function EditProfilePage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [submittingRequest, setSubmittingRequest] = useState(false);
    const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
    const [changeRequestReason, setChangeRequestReason] = useState('');
    const [genderChangeRequest, setGenderChangeRequest] = useState<GenderChangeRequest | null>(null);

    const [formData, setFormData] = useState<ProfileData>({
        name: '',
        phone: '',
        address: '',
        bio: '',
        gender: null
    });

    // Load existing profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile');
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.user.name || '',
                        phone: data.user.phone || '',
                        address: data.user.address || '',
                        bio: data.user.bio || '',
                        gender: data.user.gender || null
                    });
                    setGenderChangeRequest(data.user.genderChangeRequest || null);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                toast.error('প্রোফাইল লোড করতে সমস্যা হয়েছে');
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleGenderChange = (gender: 'male' | 'female') => {
        // Only allow change if gender is not set or if change request is approved
        if (!formData.gender || genderChangeRequest?.status === 'approved') {
            setFormData({ ...formData, gender });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate phone number
        if (!formData.phone || formData.phone.trim() === '') {
            toast.error('ফোন নম্বর আবশ্যক');
            return;
        }

        // Validate gender
        if (!formData.gender) {
            toast.error('জেন্ডার সিলেক্ট করুন');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('প্রোফাইল সফলভাবে আপডেট হয়েছে');

                // Update session if name changed
                if (formData.name !== session?.user?.name) {
                    await update({ name: formData.name });
                }

                router.push('/student/profile');
            } else {
                toast.error('প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('একটি ত্রুটি ঘটেছে');
        } finally {
            setLoading(false);
        }
    };

    const handleGenderChangeRequest = async () => {
        if (!changeRequestReason || changeRequestReason.trim().length < 10) {
            toast.error('অনুগ্রহ করে কারণ বিস্তারিত লিখুন (কমপক্ষে ১০ অক্ষর)');
            return;
        }

        setSubmittingRequest(true);

        try {
            const response = await fetch('/api/user/profile/gender-change-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: changeRequestReason })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setGenderChangeRequest({ status: 'pending', reason: changeRequestReason });
                setShowChangeRequestModal(false);
                setChangeRequestReason('');
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Change request error:', error);
            toast.error('অনুরোধ জমা দিতে সমস্যা হয়েছে');
        } finally {
            setSubmittingRequest(false);
        }
    };

    const isGenderLocked = Boolean(formData.gender && genderChangeRequest?.status !== 'approved');

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/student/profile"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">প্রোফাইল এডিট করুন</h1>
                        <p className="text-muted-foreground mt-1">আপনার ব্যক্তিগত তথ্য আপডেট করুন</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-8 space-y-6">
                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            ইমেইল (পরিবর্তনযোগ্য নয়)
                        </label>
                        <input
                            type="email"
                            value={session?.user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-lg border bg-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                            নিরাপত্তার কারণে ইমেইল পরিবর্তন করা যাবে না
                        </p>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="আপনার পুরো নাম লিখুন"
                        />
                    </div>

                    {/* Gender */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            জেন্ডার <span className="text-red-500">*</span>
                        </label>

                        <div className="flex gap-4">
                            <label
                                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.gender === 'male'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                    : 'border-muted hover:border-blue-300'
                                    } ${isGenderLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={() => handleGenderChange('male')}
                                    disabled={isGenderLocked}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.gender === 'male' ? 'border-blue-500' : 'border-muted-foreground'
                                    }`}>
                                    {formData.gender === 'male' && (
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    )}
                                </div>
                                <span className="font-medium">পুরুষ</span>
                            </label>

                            <label
                                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.gender === 'female'
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30'
                                    : 'border-muted hover:border-pink-300'
                                    } ${isGenderLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={() => handleGenderChange('female')}
                                    disabled={isGenderLocked}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.gender === 'female' ? 'border-pink-500' : 'border-muted-foreground'
                                    }`}>
                                    {formData.gender === 'female' && (
                                        <div className="w-3 h-3 rounded-full bg-pink-500" />
                                    )}
                                </div>
                                <span className="font-medium">মহিলা</span>
                            </label>
                        </div>

                        {/* Gender locked message and change request */}
                        {isGenderLocked && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    জেন্ডার একবার সিলেক্ট করার পর পরিবর্তন করা যায় না
                                </p>

                                {genderChangeRequest?.status === 'pending' ? (
                                    <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>আপনার পরিবর্তনের অনুরোধ পর্যালোচনাধীন</span>
                                    </div>
                                ) : genderChangeRequest?.status === 'rejected' ? (
                                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                                        <X className="h-4 w-4" />
                                        <span>আপনার পরিবর্তনের অনুরোধ প্রত্যাখ্যান করা হয়েছে</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowChangeRequestModal(true)}
                                        className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                                    >
                                        জেন্ডার পরিবর্তনের অনুরোধ করুন
                                    </button>
                                )}
                            </div>
                        )}

                        {genderChangeRequest?.status === 'approved' && (
                            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                                <Check className="h-4 w-4" />
                                <span>আপনার পরিবর্তনের অনুরোধ অনুমোদিত হয়েছে। এখন জেন্ডার পরিবর্তন করতে পারবেন।</span>
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            ফোন নম্বর <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="+৮৮০ ১৭XX XXXXXX"
                        />
                        <p className="text-xs text-muted-foreground">
                            গুরুত্বপূর্ণ বিজ্ঞপ্তির জন্য ফোন নম্বর আবশ্যক
                        </p>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            ঠিকানা
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="আপনার সম্পূর্ণ ঠিকানা"
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            সম্পর্কে
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="নিজের সম্পর্কে কিছু লিখুন..."
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    আপডেট হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    সংরক্ষণ করুন
                                </>
                            )}
                        </button>
                        <Link
                            href="/student/profile"
                            className="px-6 py-3 border rounded-lg hover:bg-muted transition-colors"
                        >
                            বাতিল করুন
                        </Link>
                    </div>
                </form>
            </div>

            {/* Gender Change Request Modal */}
            {showChangeRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowChangeRequestModal(false)}
                    />
                    <div className="relative bg-card border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <button
                            onClick={() => setShowChangeRequestModal(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-xl font-bold mb-2">জেন্ডার পরিবর্তনের অনুরোধ</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            জেন্ডার পরিবর্তনের জন্য অ্যাডমিনের অনুমোদন প্রয়োজন। অনুগ্রহ করে কারণ উল্লেখ করুন।
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium block mb-2">
                                    পরিবর্তনের কারণ <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={changeRequestReason}
                                    onChange={(e) => setChangeRequestReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="আপনার জেন্ডার পরিবর্তনের কারণ বিস্তারিত লিখুন..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleGenderChangeRequest}
                                    disabled={submittingRequest}
                                    className="flex-1"
                                >
                                    {submittingRequest ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            জমা দেওয়া হচ্ছে...
                                        </>
                                    ) : (
                                        'অনুরোধ জমা দিন'
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowChangeRequestModal(false)}
                                >
                                    বাতিল
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
