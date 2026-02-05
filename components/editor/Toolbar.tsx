'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    $getSelection,
    $isRangeSelection,
} from 'lexical';
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Quote,
} from 'lucide-react';

// Import custom plugins
import ImagePlugin from './plugins/ImagePlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import TablePluginUI from './plugins/TablePlugin';
import LinkPlugin from './plugins/LinkPlugin';
import { TextColorPlugin, BackgroundColorPlugin } from './plugins/ColorPlugin';

interface ToolbarProps {
    onImageUpload?: (file: File) => Promise<string>;
}

export default function Toolbar({ onImageUpload }: ToolbarProps) {
    const [editor] = useLexicalComposerContext();

    const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            }
        });
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-muted/50">
            {/* Text Formatting */}
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Bold"
                title="বোল্ড"
            >
                <Bold className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Italic"
                title="ইটালিক"
            >
                <Italic className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Underline"
                title="আন্ডারলাইন"
            >
                <Underline className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Strikethrough"
                title="স্ট্রাইকথ্রু"
            >
                <Strikethrough className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Text & Background Colors */}
            <TextColorPlugin />
            <BackgroundColorPlugin />

            <div className="w-px h-6 bg-border mx-1" />

            {/* Headings */}
            <button
                onClick={() => formatHeading('h1')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Heading 1"
                title="হেডিং ১"
            >
                <Heading1 className="h-4 w-4" />
            </button>
            <button
                onClick={() => formatHeading('h2')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Heading 2"
                title="হেডিং ২"
            >
                <Heading2 className="h-4 w-4" />
            </button>
            <button
                onClick={() => formatHeading('h3')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Heading 3"
                title="হেডিং ৩"
            >
                <Heading3 className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Lists */}
            <button
                onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Bullet List"
                title="বুলেট লিস্ট"
            >
                <List className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Numbered List"
                title="নম্বর লিস্ট"
            >
                <ListOrdered className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Alignment */}
            <button
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Align Left"
                title="বামে"
            >
                <AlignLeft className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Align Center"
                title="মাঝে"
            >
                <AlignCenter className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Align Right"
                title="ডানে"
            >
                <AlignRight className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Quote */}
            <button
                onClick={formatQuote}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Quote"
                title="কোট"
            >
                <Quote className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Link */}
            <LinkPlugin />

            <div className="w-px h-6 bg-border mx-1" />

            {/* Media */}
            <ImagePlugin onUpload={onImageUpload} />
            <YouTubePlugin />

            <div className="w-px h-6 bg-border mx-1" />

            {/* Table */}
            <TablePluginUI />
        </div>
    );
}
