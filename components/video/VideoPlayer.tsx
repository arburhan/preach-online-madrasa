'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Maximize, Gauge, ChevronLeft, ChevronRight, Download, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '../ui/button';

// Dynamically import ReactPlayer to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Dynamically import ReactPlayer to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface VideoPlayerProps {
    lessonId: string;
    courseId: string;
    videoUrl: string;
    videoSource?: 'r2' | 'youtube' | 'file';
    currentIndex?: number;
    totalLessons?: number;
    previousLessonId?: string | null;
    nextLessonId?: string | null;
    basePath?: string; // Custom base path for navigation (e.g., '/student/programs/xyz/semesters/abc?lesson=')
}



export function VideoPlayer({ lessonId, courseId, videoUrl, videoSource = 'r2', previousLessonId, nextLessonId, basePath }: VideoPlayerProps) {
    const router = useRouter();

    // Generate navigation URL
    const getNavigationUrl = (targetLessonId: string) => {
        if (basePath) {
            return `${basePath}${targetLessonId}`;
        }
        return `/student/watch/${courseId}/${targetLessonId}`;
    };
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    // Load saved progress on mount
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const response = await fetch(`/api/progress?lessonId=${lessonId}&courseId=${courseId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.progress && videoRef.current && videoSource === 'r2') {
                        videoRef.current.currentTime = data.progress.lastWatchedPosition || 0;
                    }
                    // For YouTube, we might need to seek onReady, but ReactPlayer handles url changes well.
                }
            } catch (error) {
                console.error('Failed to load progress:', error);
            }
        };

        loadProgress();
    }, [lessonId, courseId, videoSource]);

    const updateProgress = async (progress: number, lastWatchedPosition: number, watchedDuration: number, totalDuration: number) => {
        await fetch('/api/progress/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lessonId,
                courseId,
                progress,
                lastWatchedPosition,
                watchedDuration,
                totalDuration
            })
        });

        // Mark as complete if 90% watched
        if (progress >= 90) {
            completeLesson();
        }
    };

    const completeLesson = async () => {
        await fetch('/api/progress/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId, courseId })
        });
    };

    // Auto-save progress every 10 seconds (Only for R2 for now, YouTube has its own event loop we can hook into but for simplicity using same interval if we can get time)
    useEffect(() => {
        if (videoSource !== 'r2') return;

        const interval = setInterval(async () => {
            if (!videoRef.current || videoRef.current.paused) return;

            const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

            try {
                await updateProgress(progress, currentTime, currentTime, duration);
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        }, 10000); // Save every 10 seconds

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonId, courseId, currentTime, duration, videoSource]);

    // Video event handlers
    const handlePlayPause = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
        setIsLoading(false);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const newTime = parseFloat(e.target.value);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = () => {
        if (!videoRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoRef.current.requestFullscreen();
        }
    };

    const changePlaybackSpeed = (speed: number) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = speed;
        setPlaybackSpeed(speed);
        setShowSpeedMenu(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderContent = () => {
        // Auto-detect YouTube URL to override source if needed
        const isYoutube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
        const effectiveSource = isYoutube ? 'youtube' : videoSource;

        console.log('VideoPlayer Render:', { videoUrl, videoSource, isYoutube, effectiveSource });

        if (effectiveSource === 'file') {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-card text-card-foreground p-8 text-center space-y-6">
                    <div className="bg-primary/10 p-6 rounded-full">
                        <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">পাঠের ফাইল</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            এই পাঠটি একটি ডকুমেন্ট ফাইল। আপনি নিচে ডাউনলোড করে পড়তে পারেন।
                        </p>
                        <div className="flex gap-4 justify-center">
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer" download>
                                <Button className="gap-2">
                                    <Download className="h-4 w-4" />
                                    ফাইল ডাউনলোড করুন
                                </Button>
                            </a>
                            <Button variant="outline" onClick={() => completeLesson()} className="gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                সম্পন্ন হিসেবে মার্ক করুন
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (effectiveSource === 'youtube') {
            const videoId = getYoutubeId(videoUrl);
            // If we can't extract ID, try generic fallback. But with valid URL it should work.
            // If videoId is null, iframe will fail gracefully or show error, better than black screen.
            return (
                <div className="relative w-full h-full bg-black">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId || ''}?rel=0`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
            );
        }

        // Default R2 Video
        return (
            <div
                className="relative w-full h-full bg-black group"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
            >
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={handlePlayPause}
                />

                {/* Loading Overlay */}
                {isLoading && videoSource === 'r2' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
                    </div>
                )}

                {/* Controls */}
                <div
                    className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Progress Bar */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 mb-4 bg-white/30 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                        }}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Play/Pause */}
                            <button
                                onClick={handlePlayPause}
                                className="text-white hover:text-purple-400 transition-colors"
                            >
                                {isPlaying ? (
                                    <Pause className="h-6 w-6" />
                                ) : (
                                    <Play className="h-6 w-6" />
                                )}
                            </button>

                            {/* Time */}
                            <span className="text-white text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>

                            {/* Volume */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleMute}
                                    className="text-white hover:text-purple-400 transition-colors"
                                >
                                    {isMuted ? (
                                        <VolumeX className="h-5 w-5" />
                                    ) : (
                                        <Volume2 className="h-5 w-5" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Playback Speed */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                    className="flex items-center gap-1 text-white hover:text-purple-400 transition-colors text-sm px-2 py-1 rounded bg-white/10"
                                >
                                    <Gauge className="h-4 w-4" />
                                    {playbackSpeed}x
                                </button>
                                {showSpeedMenu && (
                                    <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-lg py-2 min-w-24">
                                        {playbackSpeeds.map((speed) => (
                                            <button
                                                key={speed}
                                                onClick={() => changePlaybackSpeed(speed)}
                                                className={`w-full px-4 py-2 text-sm text-white hover:bg-purple-600 transition-colors text-left ${playbackSpeed === speed ? 'bg-purple-600' : ''
                                                    }`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="text-white hover:text-purple-400 transition-colors"
                            >
                                <Maximize className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!videoUrl) {
        return (
            <div className="aspect-video bg-black flex items-center justify-center">
                <p className="text-white">ভিডিও উপলব্ধ নেই</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                {renderContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
                {previousLessonId ? (
                    <Link href={getNavigationUrl(previousLessonId)} className="flex-1">
                        <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                            <span>আগের ভিডিও</span>
                        </button>
                    </Link>
                ) : (
                    <button
                        disabled
                        className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-500 py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>আগের ভিডিও</span>
                    </button>
                )}

                {nextLessonId ? (
                    <button
                        onClick={() => {
                            // Mark current lesson as complete (fire and forget - don't wait)
                            completeLesson().catch(error => console.error('Failed to mark as complete:', error));

                            // Navigate immediately using Next.js router (no page reload)
                            router.push(getNavigationUrl(nextLessonId));
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <span>পরবর্তী ভিডিও</span>
                        <ChevronRight className="h-5 w-5" />
                    </button>
                ) : (
                    <button
                        disabled
                        className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-500 py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <span>পরবর্তী ভিডিও</span>
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
