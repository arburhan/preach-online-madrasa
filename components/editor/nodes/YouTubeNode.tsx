'use client';

import {
    DecoratorNode,
    DOMConversionMap,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import { JSX } from 'react';

export type SerializedYouTubeNode = Spread<
    {
        videoId: string;
    },
    SerializedLexicalNode
>;

function YouTubeComponent({ videoId }: { videoId: string }): JSX.Element {
    return (
        <div className="my-4">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video"
                />
            </div>
        </div>
    );
}

export class YouTubeNode extends DecoratorNode<JSX.Element> {
    __videoId: string;

    static getType(): string {
        return 'youtube';
    }

    static clone(node: YouTubeNode): YouTubeNode {
        return new YouTubeNode(node.__videoId, node.__key);
    }

    constructor(videoId: string, key?: NodeKey) {
        super(key);
        this.__videoId = videoId;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = config.theme.youtube || '';
        return div;
    }

    updateDOM(): boolean {
        return false;
    }

    static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
        return $createYouTubeNode(serializedNode.videoId);
    }

    exportJSON(): SerializedYouTubeNode {
        return {
            type: 'youtube',
            version: 1,
            videoId: this.__videoId,
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('iframe');
        element.setAttribute('src', `https://www.youtube.com/embed/${this.__videoId}`);
        element.setAttribute('width', '100%');
        element.setAttribute('height', '315');
        element.setAttribute('frameborder', '0');
        element.setAttribute('allowfullscreen', 'true');
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            iframe: () => ({
                conversion: (domNode: HTMLElement) => {
                    const iframe = domNode as HTMLIFrameElement;
                    const src = iframe.getAttribute('src');
                    if (!src) return null;
                    const videoId = extractYouTubeVideoId(src);
                    if (!videoId) return null;
                    return {
                        node: $createYouTubeNode(videoId),
                    };
                },
                priority: 0,
            }),
        };
    }

    decorate(): JSX.Element {
        return <YouTubeComponent videoId={this.__videoId} />;
    }
}

export function extractYouTubeVideoId(url: string): string | null {
    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

export function $createYouTubeNode(videoId: string): YouTubeNode {
    return new YouTubeNode(videoId);
}

export function $isYouTubeNode(node: LexicalNode | null | undefined): node is YouTubeNode {
    return node instanceof YouTubeNode;
}
