'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, MapPin, Phone, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface TeacherApprovalCardProps {
    teacher: {
        _id: string;
        name: string;
        email: string;
        mobileNumber?: string;
        fatherName?: string;
        motherName?: string;
        address?: string;
        teacherQualifications?: string;
        gender?: string;
        createdAt: string;
    };
}

export function TeacherApprovalCard({ teacher }: TeacherApprovalCardProps) {
    const router = useRouter();
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApprove = async () => {
        if (!confirm('এই শিক্ষককে অনুমোদন করতে চান?')) {
            return;
        }

        setIsApproving(true);

        try {
            const response = await fetch('/api/admin/teachers/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: teacher._id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'অনুমোদন ব্যর্থ হয়েছে');
            }

            toast.success('শিক্ষক সফলভাবে অনুমোদিত হয়েছেন!');
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'অনুমোদন ব্যর্থ হয়েছে';
            toast.error(errorMessage);
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('এই শিক্ষককে প্রত্যাখ্যান করতে চান? এটি তাদের অ্যাকাউন্ট মুছে ফেলবে।')) {
            return;
        }

        setIsRejecting(true);

        try {
            const response = await fetch('/api/admin/teachers/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: teacher._id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'প্রত্যাখ্যান ব্যর্থ হয়েছে');
            }

            toast.success('শিক্ষক প্রত্যাখ্যান করা হয়েছে');
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'প্রত্যাখ্যান ব্যর্থ হয়েছে';
            toast.error(errorMessage);
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <div className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-semibold">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {teacher.email}
                    </p>
                </div>
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                    অপেক্ষমাণ
                </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {teacher.mobileNumber && (
                    <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">মোবাইল নম্বর</p>
                            <p className="text-sm font-medium">{teacher.mobileNumber}</p>
                        </div>
                    </div>
                )}

                {teacher.gender && (
                    <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">লিঙ্গ</p>
                            <p className="text-sm font-medium">
                                {teacher.gender === 'male' ? 'পুরুষ' : 'মহিলা'}
                            </p>
                        </div>
                    </div>
                )}

                {teacher.fatherName && (
                    <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">পিতার নাম</p>
                            <p className="text-sm font-medium">{teacher.fatherName}</p>
                        </div>
                    </div>
                )}

                {teacher.motherName && (
                    <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">মাতার নাম</p>
                            <p className="text-sm font-medium">{teacher.motherName}</p>
                        </div>
                    </div>
                )}

                {teacher.address && (
                    <div className="flex items-start gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">ঠিকানা</p>
                            <p className="text-sm font-medium">{teacher.address}</p>
                        </div>
                    </div>
                )}

                {teacher.teacherQualifications && (
                    <div className="md:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">শিক্ষাগত যোগ্যতা</p>
                        <p className="text-sm font-medium bg-muted p-3 rounded-lg">
                            {teacher.teacherQualifications}
                        </p>
                    </div>
                )}
            </div>

            {/* Join Date */}
            <p className="text-xs text-muted-foreground mb-4">
                আবেদনের তারিখ: {new Date(teacher.createdAt).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                >
                    {isApproving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            অনুমোদন হচ্ছে...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            অনুমোদন করুন
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleReject}
                    disabled={isApproving || isRejecting}
                    variant="destructive"
                    className="flex-1"
                >
                    {isRejecting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            প্রত্যাখ্যান হচ্ছে...
                        </>
                    ) : (
                        <>
                            <X className="mr-2 h-4 w-4" />
                            প্রত্যাখ্যান করুন
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
