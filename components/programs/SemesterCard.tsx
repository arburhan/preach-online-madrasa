'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Play, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SemesterCardProps {
    semester: {
        _id: string;
        number: number;
        titleBn: string;
        level: string;
        descriptionBn?: string;
        duration?: number;
        status: string;
    };
    index: number;
    programSlug: string;
    isLocked: boolean;
    isCompleted: boolean;
    isAdmin: boolean;
}

export function SemesterCard({ semester, index, programSlug, isLocked, isCompleted, isAdmin }: SemesterCardProps) {
    const [showLockedMessage, setShowLockedMessage] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        if (isLocked && !isAdmin) {
            e.preventDefault();
            setShowLockedMessage(true);
            toast.error('আগের সেমিস্টার কমপ্লিট করুন', {
                description: 'এই সেমিস্টারে প্রবেশ করতে আগের সেমিস্টার সম্পন্ন করতে হবে।'
            });
            setTimeout(() => setShowLockedMessage(false), 3000);
        }
    };

    const content = (
        <div className={`bg-card rounded-xl border overflow-hidden transition-all ${isLocked && !isAdmin
            ? 'opacity-75 cursor-not-allowed'
            : 'hover:shadow-lg hover:border-primary/50 group'
            }`}>
            <div className={`p-4 flex items-center gap-4 ${isCompleted
                ? 'bg-linear-to-r from-green-500 to-emerald-600'
                : isLocked && !isAdmin
                    ? 'bg-linear-to-r from-gray-400 to-gray-500'
                    : 'bg-linear-to-r from-purple-500 to-indigo-600'
                }`}>
                <span className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${isLocked && !isAdmin ? 'bg-white/10' : 'bg-white/20'
                    }`}>
                    {isLocked && !isAdmin ? (
                        <Lock className="h-5 w-5 text-white" />
                    ) : isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                        index + 1
                    )}
                </span>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                        {semester.titleBn}
                    </h3>
                    <p className={`text-sm ${isCompleted
                        ? 'text-green-100'
                        : isLocked && !isAdmin
                            ? 'text-gray-200'
                            : 'text-purple-100'
                        }`}>
                        {isCompleted ? 'সম্পন্ন' : semester.level}
                    </p>
                </div>
            </div>
            <div className="p-4">
                {semester.descriptionBn && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {semester.descriptionBn}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    {semester.duration && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {semester.duration} মাস
                        </span>
                    )}
                    {isLocked && !isAdmin ? (
                        <span className="text-sm text-red-500 flex items-center gap-1">
                            <Lock className="h-4 w-4" />
                            লক করা
                        </span>
                    ) : (
                        <Button
                            size="sm"
                            variant="ghost"
                            className={`transition-colors ${isCompleted
                                ? 'group-hover:bg-green-600 group-hover:text-white'
                                : 'group-hover:bg-primary group-hover:text-white'
                                }`}
                        >
                            <Play className="h-4 w-4 mr-1" />
                            {isCompleted ? 'পুনরায় দেখুন' : 'ক্লাস শুরু করুন'}
                        </Button>
                    )}
                </div>
                {showLockedMessage && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            আগের সেমিস্টার কমপ্লিট করুন
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    if (isLocked && !isAdmin) {
        return (
            <div onClick={handleClick} className="cursor-not-allowed">
                {content}
            </div>
        );
    }

    return (
        <Link
            href={`/student/programs/${programSlug}/semesters/${semester._id}`}
            className="group"
        >
            {content}
        </Link>
    );
}
