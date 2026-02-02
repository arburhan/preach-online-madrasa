'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Settings, CheckCircle, Clock, FileText, GraduationCap, Pencil } from 'lucide-react';

interface Semester {
    _id: string;
    semesterNumber: number;
    titleBn: string;
    status: 'draft' | 'active';
    isCompleted: boolean;
    totalLessons: number;
    totalExams: number;
    contentMode: 'direct' | 'lesson-based';
}

interface SemesterGridCardProps {
    programId: string;
    semesterNumber: number;
    semester: Semester | null;
    basePath?: string; // '/admin' or '/teacher'
}

// বাংলা সংখ্যা কনভার্টার
const toBengaliNumber = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
};

// সেমিস্টার নাম জেনারেট
const getSemesterName = (num: number): string => {
    const ordinals = ['প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', 'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম'];
    if (num <= 10) return `${ordinals[num - 1]} সেমিস্টার`;
    return `${toBengaliNumber(num)} নং সেমিস্টার`;
};

export function SemesterGridCard({ programId, semesterNumber, semester, basePath = '/admin' }: SemesterGridCardProps) {
    const isConfigured = !!semester;
    const isCompleted = semester?.isCompleted || false;
    const isActive = semester?.status === 'active';

    // Status badge
    const getStatusBadge = () => {
        if (isCompleted) {
            return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                সম্পন্ন
            </span>;
        }
        if (isActive) {
            return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                সক্রিয়
            </span>;
        }
        if (isConfigured) {
            return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                ড্রাফট
            </span>;
        }
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" />
            কনফিগার করা হয়নি
        </span>;
    };

    return (
        <div className={`border rounded-xl p-5 transition-all hover:shadow-md ${isCompleted
            ? 'bg-green-50/50 border-green-200'
            : isConfigured
                ? 'bg-card'
                : 'bg-muted/30 border-dashed'
            }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCompleted
                        ? 'bg-green-100'
                        : isConfigured
                            ? 'bg-primary/10'
                            : 'bg-muted'
                        }`}>
                        <GraduationCap className={`h-5 w-5 ${isCompleted
                            ? 'text-green-600'
                            : isConfigured
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`} />
                    </div>
                    <div>
                        <h3 className="font-semibold">
                            {semester?.titleBn || getSemesterName(semesterNumber)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            সেমিস্টার #{toBengaliNumber(semesterNumber)}
                        </p>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            {/* Stats */}
            {isConfigured && (
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{toBengaliNumber(semester.totalLessons)} পাঠ</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{toBengaliNumber(semester.totalExams)} পরীক্ষা</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <Link
                    href={`${basePath}/programs/${programId}/semesters/${semesterNumber}`}
                    className="flex-1"
                >
                    <Button
                        variant={isConfigured ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        ম্যানেজ
                    </Button>
                </Link>

                {isConfigured && (
                    <Link href={`${basePath}/programs/${programId}/semesters/${semesterNumber}/edit`}>
                        <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
