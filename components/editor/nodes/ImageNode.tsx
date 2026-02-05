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

export interface ImagePayload {
    src: string;
    altText: string;
    width?: number;
    height?: number;
    key?: NodeKey;
}

export type SerializedImageNode = Spread<
    {
        src: string;
        altText: string;
        width?: number;
        height?: number;
    },
    SerializedLexicalNode
>;

function ImageComponent({
    src,
    altText,
    width,
    height,
}: {
    src: string;
    altText: string;
    width?: number;
    height?: number;
}): JSX.Element {
    return (
        <div className="my-4 flex justify-center">
            <img
                src={src}
                alt={altText}
                width={width}
                height={height}
                className="max-w-full h-auto rounded-lg shadow-md"
                style={{
                    maxHeight: '500px',
                    objectFit: 'contain',
                }}
            />
        </div>
    );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __width?: number;
    __height?: number;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
            node.__width,
            node.__height,
            node.__key
        );
    }

    constructor(
        src: string,
        altText: string,
        width?: number,
        height?: number,
        key?: NodeKey
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__width = width;
        this.__height = height;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = config.theme.image || '';
        return div;
    }

    updateDOM(): boolean {
        return false;
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { src, altText, width, height } = serializedNode;
        return $createImageNode({ src, altText, width, height });
    }

    exportJSON(): SerializedImageNode {
        return {
            type: 'image',
            version: 1,
            src: this.__src,
            altText: this.__altText,
            width: this.__width,
            height: this.__height,
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        if (this.__width) element.setAttribute('width', String(this.__width));
        if (this.__height) element.setAttribute('height', String(this.__height));
        element.style.maxWidth = '100%';
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: (domNode: HTMLElement) => {
                    const img = domNode as HTMLImageElement;
                    const src = img.getAttribute('src');
                    const altText = img.getAttribute('alt') || '';
                    if (!src) return null;
                    return {
                        node: $createImageNode({ src, altText }),
                    };
                },
                priority: 0,
            }),
        };
    }

    decorate(): JSX.Element {
        return (
            <ImageComponent
                src={this.__src}
                altText={this.__altText}
                width={this.__width}
                height={this.__height}
            />
        );
    }
}

export function $createImageNode(payload: ImagePayload): ImageNode {
    return new ImageNode(
        payload.src,
        payload.altText,
        payload.width,
        payload.height,
        payload.key
    );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}
