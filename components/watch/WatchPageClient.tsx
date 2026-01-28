'use client';

import { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { LessonPlaylist } from '@/components/video/LessonPlaylist';
import NoteEditor from '@/components/notes/NoteEditor';
import ExamView from '@/components/exams/ExamView';
import Link from 'next/link';
import { BookOpen, Clock, FileText, Loader2, CheckCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentItem {
    type: 'lesson' | 'exam' | 'certificate';
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
}

interface Lesson {
    titleBn: string;
    descriptionBn?: string;
    duration?: number;
    videoUrl?: string;
    videoSource?: 'r2' | 'youtube' | 'file';
    attachments?: { name: string; url: string; type?: string; _id?: string }[];
}

interface WatchPageClientProps {
    courseId: string;
    contentId: string; // Can be lesson or exam ID
    courseTitle: string;
    initialLesson?: Lesson; // Pre-fetched lesson data from server
}

export default function WatchPageClient({
    courseId,
    contentId,
    courseTitle,
    initialLesson,
}: WatchPageClientProps) {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(initialLesson || null);
    const [loading, setLoading] = useState(true);

    // Load unified content sequence
    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/courses/${courseId}/content`);
                const data = await res.json();

                if (res.ok && data) {
                    // Handle new response format with courseIsCompleted
                    const contentData = data.content || data;

                    if (Array.isArray(contentData)) {
                        // Fallback: If accessing certificate directly and not in list, add it manually
                        // This handles cases where resume/direct link points to certificate but API hasn't returned it yet
                        if (contentId.startsWith('certificate-') && !contentData.find((c: ContentItem) => c._id === contentId)) {
                            const allLessonsCompleted = contentData
                                .filter((c: ContentItem) => c.type === 'lesson')
                                .every((c: ContentItem) => c.isCompleted);
                            const allExamsPassed = contentData
                                .filter((c: ContentItem) => c.type === 'exam')
                                .every((c: ContentItem) => c.isPassed);
                            const isUnlocked = allLessonsCompleted && allExamsPassed;

                            contentData.push({
                                type: 'certificate',
                                _id: contentId,
                                order: 9999,
                                titleBn: 'সার্টিফিকেট',
                                titleEn: 'Certificate',
                                isCompleted: false,
                                isPassed: isUnlocked,
                                isLocked: !isUnlocked,
                            });
                        }

                        setContent(contentData);

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
                }
            } catch (error) {
                console.error('Failed to load content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [courseId, contentId, initialLesson]);

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
            window.location.href = `/student/watch/${courseId}/${targetContent._id}`;
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

    // Check if current is the last content before certificate (if it exists)
    const regularContent = content.filter(c => c.type !== 'certificate');
    const isLastRegularContent = regularContent.length > 0 &&
        currentContent._id === regularContent[regularContent.length - 1]._id;
    const isCurrentLesson = currentContent.type === 'lesson';

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                {/* Back to Course Button */}
                <Link
                    href={`/student/browse/${courseId}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    ← কোর্সে ফিরে যান
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
                                        courseId={courseId}
                                        videoUrl={currentLesson.videoUrl || ''}
                                        videoSource={currentLesson.videoSource || 'r2'}
                                        previousLessonId={previousContent?._id || null}
                                        nextLessonId={nextContent?._id || null}
                                        nextContentType={nextContent?.type || undefined}
                                        nextContentLocked={nextContent?.isLocked || false}
                                    />
                                </div>

                                {/* Show "দেখা হয়েছে" button for last lesson (before certificate) */}
                                {isLastRegularContent && isCurrentLesson && !currentContent.isCompleted && (
                                    <div className="bg-card rounded-xl border p-4 text-center">
                                        <p className="text-muted-foreground mb-3">
                                            এটি কোর্সের শেষ পাঠ। দেখা শেষ হলে নিচের বাটনে ক্লিক করুন।
                                        </p>
                                        <Button
                                            onClick={async () => {
                                                await fetch('/api/progress/complete', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ lessonId: contentId, courseId })
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
                                            <span>{courseTitle}</span>
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
                                    <NoteEditor lessonId={contentId} courseId={courseId} />
                                </div>
                            </>
                        ) : currentContent.type === 'exam' ? (
                            <ExamView
                                examId={contentId}
                                courseId={courseId}
                                onBack={() => handleNavigate('prev')}
                                onNext={() => handleNavigate('next')}
                            />
                        ) : currentContent.type === 'certificate' ? (
                            // Certificate View
                            <div className="bg-linear-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-8 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
                                    <Award className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                </div>

                                <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                                    جَزَاكَ اللَّهُ خَيْرًا
                                </h2>
                                <h3 className="text-2xl font-semibold mb-4">
                                    আলহামদুলিল্লাহ!
                                </h3>

                                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 mb-4">
                                    <CheckCircle className="h-5 w-5" />
                                    <p className="text-lg">
                                        আপনি সফলভাবে এই কোর্সটি সম্পন্ন করেছেন!
                                    </p>
                                </div>

                                <p className="text-muted-foreground mb-6">
                                    আপনি সব পাঠ দেখেছেন এবং সব পরীক্ষায় উত্তীর্ণ হয়েছেন।
                                    এখন আপনার সার্টিফিকেট ডাউনলোড করতে পারবেন।
                                </p>

                                <Link href={`/student/courses/${courseId}/certificate`}>
                                    <Button size="lg" className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                                        <Award className="mr-2 h-5 w-5" />
                                        সার্টিফিকেট ডাউনলোড করুন
                                    </Button>
                                </Link>
                            </div>
                        ) : null}
                    </div>

                    {/* Playlist Sidebar */}
                    <div className="lg:col-span-1">
                        <LessonPlaylist
                            courseId={courseId}
                            currentContentId={contentId}
                            content={content}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
