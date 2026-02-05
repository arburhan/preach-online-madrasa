'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useState, useCallback, useEffect } from 'react';
import { $getSelection, $isRangeSelection, RangeSelection, LexicalNode } from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isAtNodeEnd } from '@lexical/selection';

function getSelectedNode(selection: RangeSelection): LexicalNode {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    if (anchorNode === focusNode) {
        return anchorNode;
    }

    const isBackward = selection.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
    }
}

export default function LinkPlugin() {
    const [editor] = useLexicalComposerContext();
    const [showModal, setShowModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isLink, setIsLink] = useState(false);

    // Check if current selection is a link
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const node = getSelectedNode(selection);
                    const parent = node.getParent();
                    if ($isLinkNode(parent)) {
                        setIsLink(true);
                        setLinkUrl(parent.getURL());
                    } else if ($isLinkNode(node)) {
                        setIsLink(true);
                        setLinkUrl(node.getURL());
                    } else {
                        setIsLink(false);
                        setLinkUrl('');
                    }
                }
            });
        });
    }, [editor]);

    const insertLink = useCallback(() => {
        if (!linkUrl.trim()) {
            // Remove link
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        } else {
            // Add/update link
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
        }
        setShowModal(false);
    }, [editor, linkUrl]);

    const removeLink = useCallback(() => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        setShowModal(false);
        setLinkUrl('');
    }, [editor]);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`p-2 hover:bg-accent rounded ${isLink ? 'bg-accent text-primary' : ''}`}
                type="button"
                aria-label="Insert Link"
                title="লিঙ্ক যোগ করুন"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">লিঙ্ক যোগ করুন</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">URL</label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex justify-between gap-2 mt-6">
                            <div>
                                {isLink && (
                                    <button
                                        onClick={removeLink}
                                        className="px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                                    >
                                        লিঙ্ক মুছুন
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm rounded-lg hover:bg-muted"
                                >
                                    বাতিল
                                </button>
                                <button
                                    onClick={insertLink}
                                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                                >
                                    সেভ করুন
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
