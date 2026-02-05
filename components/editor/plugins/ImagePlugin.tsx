'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes } from 'lexical';
import { $createImageNode } from '../nodes/ImageNode';
import { useState, useCallback, useRef } from 'react';

interface ImagePluginProps {
    onUpload?: (file: File) => Promise<string>;
}

export default function ImagePlugin({ onUpload }: ImagePluginProps) {
    const [editor] = useLexicalComposerContext();
    const [showModal, setShowModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const insertImage = useCallback((src: string, alt: string) => {
        editor.update(() => {
            const imageNode = $createImageNode({ src, altText: alt || 'image' });
            $insertNodes([imageNode]);
        });
    }, [editor]);

    const handleUrlInsert = () => {
        if (imageUrl.trim()) {
            insertImage(imageUrl.trim(), altText);
            setShowModal(false);
            setImageUrl('');
            setAltText('');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUpload) return;

        setUploading(true);
        try {
            const url = await onUpload(file);
            insertImage(url, altText || file.name);
            setShowModal(false);
            setImageUrl('');
            setAltText('');
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('ছবি আপলোড করতে সমস্যা হয়েছে');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Insert Image"
                title="ছবি যোগ করুন"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">ছবি যোগ করুন</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>

                        {/* URL Input */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ছবির URL</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-sm text-muted-foreground">অথবা</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* File Upload */}
                            {onUpload && (
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full py-2 px-4 border-2 border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                আপলোড হচ্ছে...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                কম্পিউটার থেকে আপলোড করুন
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Alt Text (ঐচ্ছিক)</label>
                                <input
                                    type="text"
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
                                    placeholder="ছবির বিবরণ"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm rounded-lg hover:bg-muted"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={handleUrlInsert}
                                disabled={!imageUrl.trim()}
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
