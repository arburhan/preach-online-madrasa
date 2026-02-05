'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorState } from 'lexical';
import Toolbar from './Toolbar';
import { ImageNode } from './nodes/ImageNode';
import { YouTubeNode } from './nodes/YouTubeNode';

interface LexicalEditorProps {
    initialContent?: string; // JSON string
    onChange: (json: string) => void;
    placeholder?: string;
    editable?: boolean;
    onImageUpload?: (file: File) => Promise<string>;
}

export default function LexicalEditor({
    initialContent,
    onChange,
    placeholder = 'কন্টেন্ট লিখুন...',
    editable = true,
    onImageUpload,
}: LexicalEditorProps) {

    const initialConfig = {
        namespace: 'CourseEditor',
        theme: {
            paragraph: 'mb-2',
            heading: {
                h1: 'text-3xl font-bold mb-4',
                h2: 'text-2xl font-bold mb-3',
                h3: 'text-xl font-semibold mb-2',
            },
            list: {
                nested: {
                    listitem: 'list-none',
                },
                ol: 'list-decimal ml-6 mb-2',
                ul: 'list-disc ml-6 mb-2',
                listitem: 'ml-4',
            },
            link: 'text-blue-600 hover:underline cursor-pointer',
            quote: 'border-l-4 border-primary pl-4 py-2 my-4 italic bg-muted/30',
            text: {
                bold: 'font-bold',
                italic: 'italic',
                underline: 'underline',
                strikethrough: 'line-through',
            },
            table: 'border-collapse border border-border my-4 w-full',
            tableCell: 'border border-border p-2 min-w-[50px]',
            tableCellHeader: 'border border-border p-2 bg-muted font-semibold',
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
        editable,
        editorState: initialContent || undefined,
        onError: (error: Error) => {
            console.error('Lexical Editor Error:', error);
        },
    };

    const handleChange = (editorState: EditorState) => {
        editorState.read(() => {
            const json = JSON.stringify(editorState.toJSON());
            onChange(json);
        });
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="relative rounded-lg border border-input bg-background">
                {editable && <Toolbar onImageUpload={onImageUpload} />}
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="min-h-[200px] max-h-[500px] overflow-y-auto p-4 outline-none"
                                style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}
                            />
                        }
                        placeholder={
                            <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin onChange={handleChange} />
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <TablePlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}
