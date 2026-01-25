'use client';

import Link from 'next/link';
import { Lock, CheckCircle, PlayCircle, Clock } from 'lucide-react';

interface Lesson {
    _id: string;
    titleBn: string;
    duration?: number;
    order: number;
}

interface Section {
    _id: string;
    titleBn: string;
    lessons: Lesson[];
}

interface ProgramLessonPlaylistProps {
    sections: Section[];
    allLessons: Lesson[];
    completedLessonIds: string[];
    currentLessonId: string;
    programId: string;
    semesterId: string;
    isAdmin: boolean;
}

export function ProgramLessonPlaylist({
    sections,
    allLessons,
    completedLessonIds,
    currentLessonId,
    programId,
    semesterId,
    isAdmin
}: ProgramLessonPlaylistProps) {
    // Convert to Set for quick lookup
    const completedSet = new Set(completedLessonIds);

    // Find the index of the last completed lesson for sequential access
    const lastCompletedIndex = allLessons.reduce((acc, lesson, idx) => {
        return completedSet.has(lesson._id) ? idx : acc;
    }, -1);

    return (
        <div className="bg-card rounded-xl border sticky top-24">
            <div className="p-4 border-b">
                <h2 className="font-semibold">পাঠ তালিকা</h2>
                <p className="text-sm text-muted-foreground">
                    {allLessons.length}টি পাঠ • {completedLessonIds.length}টি সম্পূর্ণ
                </p>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {sections.map((section) => (
                    <div key={section._id} className="border-b last:border-b-0">
                        <div className="px-4 py-3 bg-muted/50">
                            <h3 className="font-medium text-sm">{section.titleBn}</h3>
                        </div>
                        <div className="divide-y">
                            {section.lessons?.map((lesson) => {
                                const lessonIdStr = lesson._id;
                                const lessonIndex = allLessons.findIndex(l => l._id === lessonIdStr);
                                const isActive = lessonIdStr === currentLessonId;
                                const isCompleted = completedSet.has(lessonIdStr);

                                // Allow access if:
                                // 1. First lesson (index 0)
                                // 2. Lesson is completed
                                // 3. Lesson is current
                                // 4. Lesson index is <= lastCompletedIndex + 1
                                const canAccess =
                                    isAdmin ||
                                    lessonIndex === 0 ||
                                    isCompleted ||
                                    isActive ||
                                    lessonIndex <= lastCompletedIndex + 1;

                                const isLocked = !canAccess;

                                const handleClick = (e: React.MouseEvent) => {
                                    if (isLocked) {
                                        e.preventDefault();
                                    }
                                };

                                return (
                                    <Link
                                        key={lessonIdStr}
                                        href={isLocked ? '#' : `/student/programs/${programId}/semesters/${semesterId}?lesson=${lesson._id}`}
                                        onClick={handleClick}
                                        className={`flex items-center gap-3 p-3 transition-colors ${isActive
                                                ? 'bg-primary/5 border-l-2 border-primary'
                                                : isLocked
                                                    ? 'opacity-60 cursor-not-allowed'
                                                    : 'hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isActive
                                                    ? 'bg-primary text-white'
                                                    : isLocked
                                                        ? 'bg-muted text-muted-foreground'
                                                        : 'bg-muted'
                                            }`}>
                                            {isLocked ? (
                                                <Lock className="h-4 w-4" />
                                            ) : isActive ? (
                                                <PlayCircle className="h-4 w-4" />
                                            ) : isCompleted ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                <span className="text-sm font-medium">{lessonIndex + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${isActive
                                                    ? 'font-semibold text-primary'
                                                    : isCompleted
                                                        ? 'text-green-600'
                                                        : ''
                                                }`}>
                                                {lesson.titleBn}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {lesson.duration && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {Math.floor(lesson.duration / 60)} মিনিট
                                                    </span>
                                                )}
                                                {isLocked && (
                                                    <span className="text-red-500">লক করা</span>
                                                )}
                                                {isCompleted && (
                                                    <span className="text-green-600">সম্পূর্ণ</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
