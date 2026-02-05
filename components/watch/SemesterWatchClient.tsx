'use client';

import { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import NoteEditor from '@/components/notes/NoteEditor';
import ExamView from '@/components/exams/ExamView';
import StudentModuleAccordion from '@/components/student/StudentModuleAccordion';
import Link from 'next/link';
import { BookOpen, Clock, FileText, Loader2, CheckCircle, Lock, PlayCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentItem {
    type: 'lesson' | 'exam';
    _id: string;
    order: number;
    titleBn: string;
    titleEn?: string;
    duration?: number;
    videoUrl?: string;
    totalMarks?: number;
    passMarks?: number;
    questionCount?: number;
    isCompleted: boolean;
    isPassed?: boolean;
    isLocked: boolean;
    obtainedMarks?: number;
    percentage?: number;
    module?: string;
}

interface ModuleItem {
    _id: string;
    titleBn: string;
    order: number;
}

interface Lesson {
    titleBn: string;
    descriptionBn?: string;
    duration?: number;
    videoUrl?: string;
    videoSource?: 'r2' | 'youtube' | 'file';
    attachments?: { name: string; url: string; type?: string; _id?: string }[];
}

interface SemesterWatchClientProps {
    programId: string;
    semesterNumber: number;
    contentId: string;
    semesterTitle: string;
    programTitle: string;
    initialLesson?: Lesson;
}

export default function SemesterWatchClient({
    programId,
    semesterNumber,
    contentId,
    semesterTitle,
    programTitle,
    initialLesson,
}: SemesterWatchClientProps) {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [isLessonBased, setIsLessonBased] = useState(false);
    const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(initialLesson || null);
    const [loading, setLoading] = useState(true);
    const [allContentCompleted, setAllContentCompleted] = useState(false);

    // Load unified content sequence
    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/programs/${programId}/semesters/${semesterNumber}/content`);
                const data = await res.json();

                if (res.ok && data) {
                    const contentData = data.content || [];
                    setContent(contentData);
                    setModules(data.modules || []);
                    setIsLessonBased(data.isLessonBased || false);
                    setAllContentCompleted(data.allContentCompleted || false);

                    // Find current content
                    const current = contentData.find((item: ContentItem) => item._id === contentId);
                    if (current) {
                        setCurrentContent(current);

                        // If it's a lesson and we don't have initial data, fetch it
                        if (current.type === 'lesson' && !initialLesson) {
                            const lessonRes = await fetch(`/api/lessons/${contentId}`);
                            const lessonData = await lessonRes.json();
                            setCurrentLesson(lessonData.lesson || lessonData);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [programId, semesterNumber, contentId, initialLesson]);

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (!currentContent) return;

        const currentIndex = content.findIndex(item => item._id === currentContent._id);
        const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex >= 0 && targetIndex < content.length) {
            const targetContent = content[targetIndex];
            // Check if locked
            if (targetContent.isLocked) {
                return;
            }
            // Navigate
            window.location.href = `/student/programs/${programId}/semesters/${semesterNumber}/watch/${targetContent._id}`;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!currentContent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>কনটেন্ট খুঁজে পাওয়া যায়নি</p>
            </div>
        );
    }

    // Get prev/next content
    const currentIndex = content.findIndex(item => item._id === currentContent._id);
    const previousContent = currentIndex > 0 ? content[currentIndex - 1] : null;
    const nextContent = currentIndex < content.length - 1 ? content[currentIndex + 1] : null;

    // Check if this is the last content
    const isLastContent = currentIndex === content.length - 1;
    const isCurrentLesson = currentContent.type === 'lesson';

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                {/* Back to Semester Button */}
                <Link
                    href={`/student/programs/${programId}/semesters/${semesterNumber}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    ← সেমিস্টারে ফিরে যান
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Content Display */}
                        {currentContent.type === 'lesson' && currentLesson ? (
                            <>
                                {/* Video Player */}
                                <div className="bg-black rounded-xl overflow-hidden">
                                    <VideoPlayer
                                        lessonId={contentId}
                                        courseId={programId}
                                        videoUrl={currentLesson.videoUrl || ''}
                                        videoSource={currentLesson.videoSource || 'r2'}
                                        previousLessonId={previousContent?._id || null}
                                        nextLessonId={nextContent?._id || null}
                                        nextContentType={nextContent?.type || undefined}
                                        nextContentLocked={nextContent?.isLocked || false}
                                        basePath={`/student/programs/${programId}/semesters/${semesterNumber}/watch/`}
                                    />
                                </div>

                                {/* Show "দেখা হয়েছে" button for last lesson */}
                                {isLastContent && isCurrentLesson && !currentContent.isCompleted && (
                                    <div className="bg-card rounded-xl border p-4 text-center">
                                        <p className="text-muted-foreground mb-3">
                                            এটি সেমিস্টারের শেষ পাঠ। দেখা শেষ হলে নিচের বাটনে ক্লিক করুন।
                                        </p>
                                        <Button
                                            onClick={async () => {
                                                await fetch('/api/progress/complete', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        lessonId: contentId,
                                                        courseId: programId,
                                                        programSemesterNumber: semesterNumber
                                                    })
                                                });
                                                // Refresh content
                                                window.location.reload();
                                            }}
                                            className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                        >
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                            দেখা হয়েছে
                                        </Button>
                                    </div>
                                )}

                                {/* All completed success message */}
                                {allContentCompleted && isLastContent && (
                                    <div className="bg-linear-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-6 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                                            <Award className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                                            আলহামদুলিল্লাহ!
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            আপনি সেমিস্টার {semesterNumber} এর সব কন্টেন্ট সম্পন্ন করেছেন।
                                        </p>
                                        <Link href={`/student/programs/${programId}`}>
                                            <Button className="bg-linear-to-r from-emerald-600 to-teal-600">
                                                পরবর্তী সেমিস্টারে যান
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Lesson Info */}
                                <div className="bg-card rounded-xl border p-6">
                                    <h1 className="text-2xl font-bold mb-2">{currentLesson.titleBn}</h1>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        {currentLesson.duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{Math.floor(currentLesson.duration / 60)} মিনিট</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{semesterTitle} • {programTitle}</span>
                                        </div>
                                    </div>

                                    {currentLesson.descriptionBn && (
                                        <div>
                                            <h3 className="font-semibold mb-2">বিবরণ</h3>
                                            <p className="text-muted-foreground whitespace-pre-wrap">
                                                {currentLesson.descriptionBn}
                                            </p>
                                        </div>
                                    )}

                                    {/* Attachments Section */}
                                    {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                                        <div className="mt-6 pt-6 border-t">
                                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                সংযুক্ত ফাইল
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {currentLesson.attachments.map((file, index) => (
                                                    <a
                                                        key={index}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors group"
                                                    >
                                                        <div className="bg-primary/10 p-2 rounded group-hover:bg-primary/20 transition-colors">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate">
                                                                {file.name || 'সংযুক্ত ফাইল'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                ডাউনলোড করতে ক্লিক করুন
                                                            </p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes Section */}
                                <div className="bg-card rounded-xl border p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="h-5 w-5" />
                                        <h3 className="font-semibold">নোট</h3>
                                    </div>
                                    <NoteEditor lessonId={contentId} courseId={programId} />
                                </div>
                            </>
                        ) : currentContent.type === 'exam' ? (
                            <ExamView
                                examId={contentId}
                                courseId={programId}
                                onBack={() => handleNavigate('prev')}
                                onNext={() => handleNavigate('next')}
                            />
                        ) : null}
                    </div>

                    {/* Playlist Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-xl border sticky top-6">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold">সেমিস্টার {semesterNumber}</h3>
                                <p className="text-sm text-muted-foreground">{content.length} টি কন্টেন্ট</p>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {isLessonBased && modules.length > 0 ? (
                                    <StudentModuleAccordion
                                        modules={modules}
                                        contents={content.map(item => ({
                                            ...item,
                                            isCompleted: item.type === 'lesson' ? item.isCompleted : !!item.isPassed,
                                        }))}
                                        currentContentId={contentId}
                                        baseUrl={`/student/programs/${programId}/semesters/${semesterNumber}/watch`}
                                    />
                                ) : (
                                    <div className="space-y-1">
                                        {content.map((item, index) => {
                                            const isCurrent = item._id === contentId;
                                            const isCompleted = item.type === 'lesson' ? item.isCompleted : item.isPassed;

                                            return (
                                                <div
                                                    key={item._id}
                                                    className={`p-4 border-b last:border-b-0 ${isCurrent ? 'bg-primary/5' : ''
                                                        } ${item.isLocked ? 'opacity-50' : 'cursor-pointer hover:bg-muted/50'}`}
                                                    onClick={() => {
                                                        if (!item.isLocked && !isCurrent) {
                                                            window.location.href = `/student/programs/${programId}/semesters/${semesterNumber}/watch/${item._id}`;
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Icon */}
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted
                                                            ? 'bg-green-100 text-green-600'
                                                            : item.isLocked
                                                                ? 'bg-gray-100 text-gray-400'
                                                                : isCurrent
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                            {isCompleted ? (
                                                                <CheckCircle className="h-4 w-4" />
                                                            ) : item.isLocked ? (
                                                                <Lock className="h-4 w-4" />
                                                            ) : item.type === 'exam' ? (
                                                                <FileText className="h-4 w-4" />
                                                            ) : (
                                                                <PlayCircle className="h-4 w-4" />
                                                            )}
                                                        </div>

                                                        {/* Content Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : ''
                                                                }`}>
                                                                {index + 1}. {item.titleBn}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {item.type === 'exam'
                                                                    ? `পরীক্ষা • ${item.totalMarks} মার্কস`
                                                                    : item.duration
                                                                        ? `${Math.floor(item.duration / 60)} মিনিট`
                                                                        : 'পাঠ'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
