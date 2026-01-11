'use client';

import Link from 'next/link';
import { Lock, PlayCircle, Clock } from 'lucide-react';

interface Lesson {
    _id: { toString: () => string };
    titleBn: string;
    duration?: number;
    order: number;
    isFree?: boolean;
}

interface LessonPlaylistProps {
    courseId: string;
    currentLessonId: string;
    lessons: Lesson[];
    isEnrolled: boolean;
}

export function LessonPlaylist({ courseId, currentLessonId, lessons, isEnrolled }: LessonPlaylistProps) {
    return (
        <div className="bg-card rounded-xl border overflow-hidden sticky top-6">
            <div className="p-4 border-b">
                <h3 className="font-semibold">কোর্স সূচিপত্র</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {lessons.length} টি পাঠ
                </p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, index) => {
                    const lessonId = lesson._id.toString();
                    const isCurrent = lessonId === currentLessonId;
                    const isLocked = !isEnrolled && !lesson.isFree;

                    return (
                        <Link
                            key={lessonId}
                            href={isLocked ? '#' : `/student/watch/${courseId}/${lessonId}`}
                            className={`block p-4 border-b hover:bg-muted/50 transition-colors ${isCurrent ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''
                                } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Lesson Number/Status Icon */}
                                <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                    {isLocked ? (
                                        <Lock className="h-4 w-4" />
                                    ) : isCurrent ? (
                                        <PlayCircle className="h-4 w-4 text-purple-600" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Lesson Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-sm mb-1 ${isCurrent ? 'text-purple-600' : ''}`}>
                                        {lesson.titleBn}
                                    </h4>
                                    {lesson.duration && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{Math.floor(lesson.duration / 60)} মিনিট</span>
                                        </div>
                                    )}
                                </div>

                                {/* Completion Status - Placeholder */}
                                {!isLocked && (
                                    <div className="shrink-0">
                                        {/* <CheckCircle2 className="h-5 w-5 text-green-600" /> */}
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
