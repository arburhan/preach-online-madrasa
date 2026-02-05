'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useState, useCallback } from 'react';
import { $getSelection, $isRangeSelection, $isTextNode, TextNode } from 'lexical';

const TEXT_COLORS = [
    { name: 'কালো', value: '#000000' },
    { name: 'লাল', value: '#dc2626' },
    { name: 'সবুজ', value: '#16a34a' },
    { name: 'নীল', value: '#2563eb' },
    { name: 'বেগুনি', value: '#9333ea' },
    { name: 'কমলা', value: '#ea580c' },
    { name: 'গোলাপী', value: '#db2777' },
    { name: 'ধূসর', value: '#6b7280' },
];

const BG_COLORS = [
    { name: 'হলুদ', value: '#fef08a' },
    { name: 'সবুজ', value: '#bbf7d0' },
    { name: 'নীল', value: '#bfdbfe' },
    { name: 'গোলাপী', value: '#fbcfe8' },
    { name: 'বেগুনি', value: '#e9d5ff' },
    { name: 'কমলা', value: '#fed7aa' },
    { name: 'ধূসর', value: '#e5e7eb' },
    { name: 'সাদা', value: 'transparent' },
];

export function TextColorPlugin() {
    const [editor] = useLexicalComposerContext();
    const [showPicker, setShowPicker] = useState(false);

    const applyColor = useCallback((color: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach((node) => {
                    if ($isTextNode(node)) {
                        const textNode = node as TextNode;
                        const style = textNode.getStyle();
                        const newStyle = style
                            .split(';')
                            .filter((s: string) => !s.trim().startsWith('color'))
                            .join(';');
                        textNode.setStyle(`${newStyle};color:${color}`.replace(/^;/, ''));
                    }
                });
            }
        });
        setShowPicker(false);
    }, [editor]);

    return (
        <div className="relative">
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-2 hover:bg-accent rounded flex items-center gap-1"
                type="button"
                aria-label="Text Color"
                title="টেক্সট কালার"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(to right, #dc2626, #16a34a, #2563eb)' }} />
            </button>

            {showPicker && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPicker(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-[200px]">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">টেক্সট কালার</p>
                        <div className="grid grid-cols-4 gap-3">
                            {TEXT_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => applyColor(color.value)}
                                    className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:scale-110 transition-all shadow-sm"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                    type="button"
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function BackgroundColorPlugin() {
    const [editor] = useLexicalComposerContext();
    const [showPicker, setShowPicker] = useState(false);

    const applyBgColor = useCallback((color: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach((node) => {
                    if ($isTextNode(node)) {
                        const textNode = node as TextNode;
                        const style = textNode.getStyle();
                        const newStyle = style
                            .split(';')
                            .filter((s: string) => !s.trim().startsWith('background'))
                            .join(';');
                        if (color === 'transparent') {
                            textNode.setStyle(newStyle);
                        } else {
                            textNode.setStyle(`${newStyle};background-color:${color}`.replace(/^;/, ''));
                        }
                    }
                });
            }
        });
        setShowPicker(false);
    }, [editor]);

    return (
        <div className="relative">
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-2 hover:bg-accent rounded flex items-center gap-1"
                type="button"
                aria-label="Background Color"
                title="হাইলাইট কালার"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400" />
            </button>

            {showPicker && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPicker(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-[200px]">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">হাইলাইট কালার</p>
                        <div className="grid grid-cols-4 gap-3">
                            {BG_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => applyBgColor(color.value)}
                                    className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:scale-110 transition-all shadow-sm flex items-center justify-center"
                                    style={{ backgroundColor: color.value === 'transparent' ? '#ffffff' : color.value }}
                                    title={color.name}
                                    type="button"
                                >
                                    {color.value === 'transparent' && (
                                        <span className="text-gray-400 text-xs">✕</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
