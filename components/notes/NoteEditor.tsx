'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, Loader2 } from 'lucide-react';

interface NoteEditorProps {
    lessonId: string;
    courseId: string;
}

export function NoteEditor({ lessonId, courseId }: NoteEditorProps) {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load existing notes
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const response = await fetch(`/api/notes?lessonId=${lessonId}&courseId=${courseId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.note) {
                        setContent(data.note.content || '');
                    }
                }
            } catch (error) {
                console.error('Failed to load notes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotes();
    }, [lessonId, courseId]);

    const saveNote = useCallback(async () => {
        if (!content.trim()) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    courseId,
                    content
                })
            });

            if (response.ok) {
                setLastSaved(new Date());
            }
        } catch (error) {
            console.error('Failed to save note:', error);
        } finally {
            setIsSaving(false);
        }
    }, [content, lessonId, courseId]);

    // Auto-save debounced
    useEffect(() => {
        if (isLoading || !content) return;

        const timeoutId = setTimeout(() => {
            saveNote();
        }, 2000); // Save 2 seconds after user stops typing

        return () => clearTimeout(timeoutId);
    }, [content, isLoading, saveNote]);

    const formatLastSaved = () => {
        if (!lastSaved) return '';
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

        if (diff < 60) return 'এইমাত্র সংরক্ষিত';
        if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে সংরক্ষিত`;
        return lastSaved.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>সংরক্ষণ হচ্ছে...</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <Save className="h-4 w-4" />
                            <span>{formatLastSaved()}</span>
                        </>
                    ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                    {content.length} অক্ষর
                </div>
            </div>

            {/* Editor */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="এখানে আপনার নোট লিখুন... (স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে)"
                className="w-full min-h-[200px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ fontFamily: 'inherit' }}
            />

            {/* Manual Save Button */}
            <button
                onClick={saveNote}
                disabled={isSaving || !content.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        সংরক্ষণ হচ্ছে...
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4" />
                        নোট সংরক্ষণ করুন
                    </>
                )}
            </button>
        </div>
    );
}
