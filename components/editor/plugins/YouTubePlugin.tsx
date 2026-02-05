'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes } from 'lexical';
import { $createYouTubeNode, extractYouTubeVideoId } from '../nodes/YouTubeNode';
import { useState, useCallback } from 'react';

export default function YouTubePlugin() {
    const [editor] = useLexicalComposerContext();
    const [showModal, setShowModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState('');

    const insertVideo = useCallback(() => {
        const videoId = extractYouTubeVideoId(videoUrl);
        if (!videoId) {
            setError('সঠিক YouTube লিঙ্ক দিন');
            return;
        }

        editor.update(() => {
            const youtubeNode = $createYouTubeNode(videoId);
            $insertNodes([youtubeNode]);
        });

        setShowModal(false);
        setVideoUrl('');
        setError('');
    }, [editor, videoUrl]);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Insert YouTube Video"
                title="YouTube ভিডিও যোগ করুন"
            >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">YouTube ভিডিও যোগ করুন</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setError('');
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">YouTube লিঙ্ক</label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => {
                                        setVideoUrl(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
                                />
                                {error && (
                                    <p className="text-sm text-red-500 mt-1">{error}</p>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                সাপোর্টেড ফরম্যাট: youtube.com/watch?v=..., youtu.be/...
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setError('');
                                }}
                                className="px-4 py-2 text-sm rounded-lg hover:bg-muted"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={insertVideo}
                                disabled={!videoUrl.trim()}
                                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                যোগ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
