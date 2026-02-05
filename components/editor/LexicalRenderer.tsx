'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { ImageNode } from './nodes/ImageNode';
import { YouTubeNode } from './nodes/YouTubeNode';

interface LexicalRendererProps {
    content: string; // JSON string or plain text
}

export default function LexicalRenderer({ content }: LexicalRendererProps) {
    if (!content) return null;

    let initialEditorState = null;
    let isJson = false;

    try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && parsed.root) {
            isJson = true;
            initialEditorState = content;
        }
    } catch {
        // Not JSON, fallback to plain text rendering
    }

    if (!isJson) {
        return (
            <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {content}
            </div>
        );
    }

    const initialConfig = {
        namespace: 'CourseRenderer',
        theme: {
            paragraph: 'mb-4 text-muted-foreground leading-relaxed',
            heading: {
                h1: 'text-3xl font-bold mb-4 mt-6 text-foreground',
                h2: 'text-2xl font-bold mb-3 mt-5 text-foreground',
                h3: 'text-xl font-semibold mb-2 mt-4 text-foreground',
            },
            list: {
                nested: {
                    listitem: 'list-none',
                },
                ol: 'list-decimal ml-6 mb-2 text-muted-foreground',
                ul: 'list-disc ml-6 mb-2 text-muted-foreground',
                listitem: 'ml-4 mb-1',
            },
            quote: 'border-l-4 border-primary pl-4 italic my-4 text-muted-foreground',
            link: 'text-primary hover:underline cursor-pointer',
            text: {
                bold: 'font-bold text-foreground',
                italic: 'italic',
                underline: 'underline',
                strikethrough: 'line-through',
                underlineStrikethrough: 'underline line-through',
            },
            table: 'border-collapse border border-border my-4 w-full',
            tableCell: 'border border-border p-3',
            tableCellHeader: 'border border-border p-3 bg-muted font-semibold',
            image: 'my-4',
            youtube: 'my-4',
        },
        nodes: [
            HeadingNode,
            QuoteNode,
            ListNode,
            ListItemNode,
            LinkNode,
            TableNode,
            TableRowNode,
            TableCellNode,
            ImageNode,
            YouTubeNode,
        ],
        editable: false,
        editorState: initialEditorState,
        onError: (error: Error) => {
            console.error('Lexical Renderer Error:', error);
        },
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="relative">
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className="outline-none"
                            readOnly
                        />
                    }
                    placeholder={null}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <ListPlugin />
                <LinkPlugin />
                <TablePlugin />
            </div>
        </LexicalComposer>
    );
}
