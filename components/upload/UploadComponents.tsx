'use client';

import { UploadButton, UploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { toast } from 'sonner';

interface VideoUploaderProps {
    onUploadComplete?: (url: string, key: string) => void;
    onUploadError?: (error: Error) => void;
}

export function VideoUploader({ onUploadComplete, onUploadError }: VideoUploaderProps) {
    return (
        <UploadDropzone<OurFileRouter, 'videoUploader'>
            endpoint="videoUploader"
            onClientUploadComplete={(res) => {
                if (res && res[0]) {
                    console.log('Files: ', res);
                    toast.success('ভিডিও আপলোড সফল হয়েছে!');
                    onUploadComplete?.(res[0].url, res[0].key);
                }
            }}
            onUploadError={(error: Error) => {
                console.error('Upload error:', error);
                toast.error(`আপলোড ব্যর্থ: ${error.message}`);
                onUploadError?.(error);
            }}
            appearance={{
                container: 'border-2 border-dashed border-primary/20 rounded-lg p-8',
                uploadIcon: 'text-primary',
                label: 'text-primary font-medium',
                allowedContent: 'text-muted-foreground text-sm',
            }}
            content={{
                label: 'ভিডিও নির্বাচন করুন অথবা এখানে ড্র্যাগ করুন',
                allowedContent: 'সর্বোচ্চ 512MB ভিডিও',
            }}
        />
    );
}

interface ThumbnailUploaderProps {
    onUploadComplete?: (url: string) => void;
    onUploadError?: (error: Error) => void;
}

export function ThumbnailUploader({ onUploadComplete, onUploadError }: ThumbnailUploaderProps) {
    return (
        <UploadButton<OurFileRouter, 'thumbnailUploader'>
            endpoint="thumbnailUploader"
            onClientUploadComplete={(res) => {
                if (res && res[0]) {
                    toast.success('থাম্বনেইল আপলোড সফল হয়েছে!');
                    onUploadComplete?.(res[0].url);
                }
            }}
            onUploadError={(error: Error) => {
                toast.error(`আপলোড ব্যর্থ: ${error.message}`);
                onUploadError?.(error);
            }}
            appearance={{
                button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
            }}
            content={{
                button: 'থাম্বনেইল আপলোড করুন',
            }}
        />
    );
}

interface AttachmentUploaderProps {
    onUploadComplete?: (files: Array<{ url: string; name: string }>) => void;
    onUploadError?: (error: Error) => void;
}

export function AttachmentUploader({ onUploadComplete, onUploadError }: AttachmentUploaderProps) {
    return (
        <UploadDropzone<OurFileRouter, 'attachmentUploader'>
            endpoint="attachmentUploader"
            onClientUploadComplete={(res) => {
                if (res && res.length > 0) {
                    toast.success('ফাইল আপলোড সফল হয়েছে!');
                    const files = res.map(file => ({ url: file.url, name: file.name }));
                    onUploadComplete?.(files);
                }
            }}
            onUploadError={(error: Error) => {
                toast.error(`আপলোড ব্যর্থ: ${error.message}`);
                onUploadError?.(error);
            }}
            appearance={{
                container: 'border-2 border-dashed border-primary/20 rounded-lg p-6',
                uploadIcon: 'text-primary',
                label: 'text-primary font-medium',
            }}
            content={{
                label: 'পিডিএফ অথবা ছবি আপলোড করুন',
                allowedContent: 'সর্বোচ্চ ৫টি ফাইল (PDF: 16MB, Image: 4MB)',
            }}
        />
    );
}
