'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface CertificateData {
    studentName: string;
    studentEmail: string;
    courseName: string;
    courseNameEn?: string;
    instructorName: string;
    completionDate: string;
    totalLessons: number;
    totalExams: number;
    certificateId: string;
}

interface CertificateProps {
    data: CertificateData;
    onClose?: () => void;
}

export default function Certificate({ data, onClose }: CertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateEn = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:py-0 print:bg-white">
            {/* Action Buttons - Hidden in Print */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-center gap-4 print:hidden">
                <Button onClick={handlePrint} className="gap-2">
                    <Printer className="h-4 w-4" />
                    প্রিন্ট করুন
                </Button>
                {onClose && (
                    <Button variant="outline" onClick={onClose}>
                        বন্ধ করুন
                    </Button>
                )}
            </div>

            {/* Certificate */}
            <div
                ref={certificateRef}
                className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none"
            >
                <div className="relative p-6 print:p-6" style={{ minHeight: '600px' }}>
                    {/* Decorative Border */}
                    <div className="absolute inset-3 border-4 border-double border-emerald-700" />
                    <div className="absolute inset-5 border-2 border-emerald-600" />

                    {/* Corner Decorations */}
                    <div className="absolute top-6 left-6 w-12 h-12 border-l-4 border-t-4 border-emerald-700" />
                    <div className="absolute top-6 right-6 w-12 h-12 border-r-4 border-t-4 border-emerald-700" />
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-l-4 border-b-4 border-emerald-700" />
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-r-4 border-b-4 border-emerald-700" />

                    {/* Content */}
                    <div className="relative flex flex-col items-center justify-between py-6 px-10 text-center" style={{ minHeight: '560px' }}>
                        {/* Header */}
                        <div className="space-y-2">
                            {/* Bismillah */}
                            <p className="text-2xl text-emerald-800 font-arabic">
                                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                            </p>

                            {/* Logo/Title */}
                            <div className="pt-4">
                                <h1 className="text-4xl font-bold text-emerald-800 tracking-wider">
                                    সনদপত্র
                                </h1>
                                <p className="text-xl text-emerald-700 mt-1">CERTIFICATE OF COMPLETION</p>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="space-y-3 flex-1 flex flex-col justify-center max-w-2xl">
                            <p className="text-lg text-gray-600">
                                এই মর্মে প্রত্যয়ন করা হচ্ছে যে
                            </p>

                            {/* Student Name */}
                            <div className="py-4">
                                <h2 className="text-4xl font-bold text-emerald-900 border-b-2 border-emerald-600 pb-2 inline-block px-8">
                                    {data.studentName}
                                </h2>
                            </div>

                            <p className="text-lg text-gray-600">
                                সফলভাবে নিম্নলিখিত কোর্সটি সম্পন্ন করেছেন
                            </p>

                            {/* Course Name */}
                            <div className="bg-emerald-50 rounded-lg py-4 px-8 border border-emerald-200">
                                <h3 className="text-2xl font-bold text-emerald-800">
                                    {data.courseName}
                                </h3>
                                {data.courseNameEn && (
                                    <p className="text-lg text-emerald-600 mt-1">
                                        {data.courseNameEn}
                                    </p>
                                )}
                            </div>

                            {/* Course Stats */}
                            <div className="flex justify-center gap-8 text-gray-600 mb-2">
                                <div>
                                    <span className="font-semibold">{data.totalLessons}</span> টি পাঠ
                                </div>
                                <div className="text-emerald-600">•</div>
                                <div>
                                    <span className="font-semibold">{data.totalExams}</span> টি পরীক্ষা
                                </div>
                            </div>

                            {/* Completion Date */}
                            <p className="text-gray-600">
                                সমাপ্তির তারিখ: <span className="font-semibold">{formatDate(data.completionDate)}</span>
                                <br />
                                <span className="text-sm">({formatDateEn(data.completionDate)})</span>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="w-full space-y-3">
                            {/* Signature Area */}
                            <div className="flex justify-between items-end px-8">
                                <div className="text-center">
                                    <div className="w-48 border-b-2 border-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">শিক্ষার্থীর স্বাক্ষর</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-8 mb-1 flex items-end justify-center">
                                        <p className="text-lg font-semibold text-emerald-800 font-signature">
                                            {data.instructorName}
                                        </p>
                                    </div>
                                    <div className="w-48 border-b-2 border-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">প্রশিক্ষক</p>
                                </div>
                            </div>

                            {/* Certificate ID */}
                            <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-400">
                                    সার্টিফিকেট আইডি: {data.certificateId}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    ইসলামিক অনলাইন একাডেমি | ioa.bd
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #certificate-container,
                    #certificate-container * {
                        visibility: visible;
                    }
                    #certificate-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
                @font-face {
                    font-family: 'Arabic';
                    src: local('Traditional Arabic'), local('Arial');
                }
                .font-arabic {
                    font-family: 'Traditional Arabic', 'Arial', serif;
                }
            `}</style>
        </div>
    );
}
