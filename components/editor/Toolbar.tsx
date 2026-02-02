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
import { $createParagraphNode } from 'lexical';
import {
    Bold,
    Italic,
    Underline,
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

export default function Toolbar() {
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
            >
                <Bold className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Italic"
            >
                <Italic className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Underline"
            >
                <Underline className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Headings */}
            <button
                onClick={() => formatHeading('h1')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </button>
            <button
                onClick={() => formatHeading('h2')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </button>
            <button
                onClick={() => formatHeading('h3')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Heading 3"
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
            >
                <List className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Numbered List"
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
            >
                <AlignLeft className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Align Center"
            >
                <AlignCenter className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Align Right"
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
            >
                <Quote className="h-4 w-4" />
            </button>
        </div>
    );
}
