'use client';

import Link from 'next/link';
import { Clock, Lock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ContentItem {
    type: 'lesson' | 'exam';
    _id: string;
    titleBn: string;
    order: number;
    // For lessons
    duration?: number;
    // For exams
    totalMarks?: number;
    passMarks?: number;
    questionCount?: number;
    // Status
    isCompleted: boolean;
    isPassed?: boolean;
    isLocked: boolean;
    obtainedMarks?: number;
}

interface LessonPlaylistProps {
    courseId: string;
    currentContentId: string;
    content: ContentItem[];
}

export function LessonPlaylist({ courseId, currentContentId, content }: LessonPlaylistProps) {
    const lessonCount = content.filter(c => c.type === 'lesson').length;
    const examCount = content.filter(c => c.type === 'exam').length;

    return (
        <div className="bg-card rounded-xl border overflow-hidden sticky top-6">
            <div className="p-4 border-b">
                <h3 className="font-semibold">কোর্স সূচিপত্র</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {lessonCount} টি পাঠ {examCount > 0 && `• ${examCount} টি পরীক্ষা`}
                </p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
                {content.map((item, index) => {
                    const isCurrent = item._id === currentContentId;
                    const isLesson = item.type === 'lesson';
                    const isExam = item.type === 'exam';

                    return (
                        <Link
                            key={item._id}
                            href={item.isLocked ? '#' : `/student/watch/${courseId}/${item._id}`}
                            className={`block p-4 border-b hover:bg-muted/50 transition-colors ${isCurrent ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                                } ${item.isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                            onClick={(e) => {
                                if (item.isLocked) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon/Number */}
                                {isLesson ? (
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${item.isCompleted
                                        ? 'bg-green-500 text-white'
                                        : isCurrent
                                            ? 'bg-purple-600 text-white'
                                            : item.isLocked
                                                ? 'bg-muted text-muted-foreground'
                                                : 'bg-muted text-foreground'
                                        }`}>
                                        {item.isLocked ? (
                                            <Lock className="h-4 w-4" />
                                        ) : item.isCompleted ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <span>{index + 1}</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item.isCompleted && item.isPassed
                                        ? 'bg-green-500 text-white'
                                        : item.isCompleted && !item.isPassed
                                            ? 'bg-red-500 text-white'
                                            : isCurrent
                                                ? 'bg-purple-600 text-white'
                                                : item.isLocked
                                                    ? 'bg-muted text-muted-foreground'
                                                    : 'bg-blue-500 text-white'
                                        }`}>
                                        {item.isLocked ? (
                                            <Lock className="h-4 w-4" />
                                        ) : item.isCompleted && item.isPassed ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : item.isCompleted && !item.isPassed ? (
                                            <XCircle className="h-4 w-4" />
                                        ) : (
                                            <FileText className="h-4 w-4" />
                                        )}
                                    </div>
                                )}

                                {/* Content Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-medium line-clamp-2 ${isCurrent ? 'text-purple-600' : ''
                                            }`}>
                                            {item.titleBn}
                                        </p>
                                        {isExam && item.isCompleted && (
                                            <Badge
                                                variant={item.isPassed ? 'default' : 'destructive'}
                                                className="text-xs shrink-0"
                                            >
                                                {item.obtainedMarks}/{item.totalMarks}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        {isLesson && item.duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{Math.floor(item.duration / 60)} মিনিট</span>
                                            </div>
                                        )}
                                        {isExam && (
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                <span>
                                                    {item.questionCount} টি প্রশ্ন • {item.totalMarks} মার্কস
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {isExam && !item.isCompleted && !item.isLocked && (
                                        <Badge variant="secondary" className="text-xs mt-2">
                                            পরীক্ষা দিন
                                        </Badge>
                                    )}
                                    {item.isLocked && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                            <Lock className="h-3 w-3" />
                                            <span>লক করা আছে</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

// Keep old interfaces for backward compatibility
export interface PlaylistLesson {
    _id: string;
    titleBn: string;
    duration?: number;
    order: number;
    isFree?: boolean;
    isCompleted?: boolean;
}

export interface PlaylistExam {
    _id: string;
    titleBn: string;
    totalMarks: number;
    passMarks: number;
    duration: number;
    status: string;
    result?: {
        obtainedMarks: number;
        passed: boolean;
        canRetake?: boolean;
    };
}
