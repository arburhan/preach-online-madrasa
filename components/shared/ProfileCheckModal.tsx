'use client';

import { X, UserCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProfileCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    missingFields: string[];
}

export function ProfileCheckModal({ isOpen, onClose, missingFields }: ProfileCheckModalProps) {
    if (!isOpen) return null;

    const getFieldName = (field: string) => {
        switch (field) {
            case 'gender':
                return 'জেন্ডার';
            case 'phone':
                return 'ফোন নম্বর';
            default:
                return field;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-amber-600" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center mb-2">
                    প্রোফাইল আপডেট করুন
                </h2>

                {/* Message */}
                <p className="text-center text-muted-foreground mb-4">
                    কোর্সে এনরোল করতে আপনার প্রোফাইল সম্পূর্ণ করতে হবে।
                </p>

                {/* Missing Fields */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium mb-2">নিম্নলিখিত তথ্য প্রয়োজন:</p>
                    <ul className="space-y-2">
                        {missingFields.map((field) => (
                            <li key={field} className="flex items-center gap-2 text-sm">
                                <UserCircle className="h-4 w-4 text-amber-600" />
                                <span>{getFieldName(field)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full">
                        <Link href="/student/profile/edit">
                            প্রোফাইল এডিট করুন
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                    >
                        পরে করব
                    </Button>
                </div>
            </div>
        </div>
    );
}
