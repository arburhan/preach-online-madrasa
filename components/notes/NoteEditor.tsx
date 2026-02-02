'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
    _id: string;
    content: string;
    timestamp: number;
    createdAt: string;
}

interface NoteEditorProps {
    lessonId: string;
    courseId: string;
}

export default function NoteEditor({ lessonId, courseId }: NoteEditorProps) {
    const [newNote, setNewNote] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingNotes, setFetchingNotes] = useState(true);

    // Fetch existing notes
    const fetchNotes = useCallback(async () => {
        try {
            setFetchingNotes(true);
            const response = await fetch(`/api/notes?lessonId=${lessonId}&courseId=${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setNotes(data.notes || []);
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setFetchingNotes(false);
        }
    }, [lessonId, courseId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error('নোট খালি হতে পারবে না');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    courseId,
                    content: newNote,
                    timestamp: 0,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setNotes([data.note, ...notes]);
                setNewNote('');
                toast.success('নোট সফলভাবে সংরক্ষিত হয়েছে! ✓');
            } else {
                toast.error('নোট সংরক্ষণ করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Failed to add note:', error);
            toast.error('নোট সংরক্ষণ করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setNotes(notes.filter(note => note._id !== noteId));
                toast.success('নোট মুছে ফেলা হয়েছে');
            } else {
                toast.error('নোট মুছতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Failed to delete note:', error);
            toast.error('নোট মুছতে সমস্যা হয়েছে');
        }
    };

    return (
        <div className="space-y-4">
            {/* Add Note Form */}
            <div className="space-y-3">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="এখানে আপনার নোট লিখুন..."
                    className="w-full min-h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                />
                <Button
                    onClick={handleAddNote}
                    disabled={loading || !newNote.trim()}
                    className="w-full"
                >
                    {loading ? (
                        <span>সংরক্ষণ হচ্ছে...</span>
                    ) : (
                        <>
                            <Plus className="h-4 w-4 mr-2" />
                            নোট যুক্ত করুন
                        </>
                    )}
                </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
                {fetchingNotes ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto" />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>এখনও কোনো নোট নেই</p>
                        <p className="text-sm">উপরে নোট যুক্ত করুন</p>
                    </div>
                ) : (
                    <>
                        <h4 className="font-semibold text-sm text-muted-foreground">সংরক্ষিত নোট ({notes.length})</h4>
                        {notes.map((note) => (
                            <div
                                key={note._id}
                                className="bg-muted/50 p-4 rounded-lg border border-border group hover:border-purple-500 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(note.createdAt).toLocaleDateString('bn-BD', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNote(note._id)}
                                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="নোট মুছুন"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
