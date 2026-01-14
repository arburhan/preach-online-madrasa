'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, Maximize, Gauge, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface VideoPlayerProps {
    lessonId: string;
    courseId: string;
    videoUrl: string;
    currentIndex?: number;
    totalLessons?: number;
    previousLessonId?: string | null;
    nextLessonId?: string | null;
}

export function VideoPlayer({ lessonId, courseId, videoUrl, previousLessonId, nextLessonId }: VideoPlayerProps) {
    const router = useRouter();
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
                    if (data.progress && videoRef.current) {
                        videoRef.current.currentTime = data.progress.lastWatchedPosition || 0;
                    }
                }
            } catch (error) {
                console.error('Failed to load progress:', error);
            }
        };

        loadProgress();
    }, [lessonId, courseId]);

    // Auto-save progress every 10 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            if (!videoRef.current || videoRef.current.paused) return;

            const progress = (currentTime / duration) * 100;

            try {
                await fetch('/api/progress/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lessonId,
                        courseId,
                        progress,
                        lastWatchedPosition: currentTime,
                        watchedDuration: currentTime,
                        totalDuration: duration
                    })
                });

                // Mark as complete if 90% watched
                if (progress >= 90) {
                    await fetch('/api/progress/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lessonId, courseId })
                    });
                }
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        }, 10000); // Save every 10 seconds

        return () => clearInterval(interval);
    }, [lessonId, courseId, currentTime, duration]);

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

    if (!videoUrl) {
        return (
            <div className="aspect-video bg-black flex items-center justify-center">
                <p className="text-white">ভিডিও উপলব্ধ নেই</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div
                className="relative aspect-video bg-black group"
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
                {isLoading && (
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

            {/* Navigation Buttons */}
            <div className="flex gap-3">
                {previousLessonId ? (
                    <Link href={`/student/watch/${courseId}/${previousLessonId}`} className="flex-1">
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
                            fetch('/api/progress/complete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ lessonId, courseId })
                            }).catch(error => console.error('Failed to mark as complete:', error));

                            // Navigate immediately using Next.js router (no page reload)
                            router.push(`/student/watch/${courseId}/${nextLessonId}`);
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
