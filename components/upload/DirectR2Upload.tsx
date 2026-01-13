'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DirectR2UploadProps {
    onUploadComplete: (url: string, key: string) => void;
    onUploadError?: (error: Error) => void;
}

export function DirectR2VideoUpload({ onUploadComplete, onUploadError }: DirectR2UploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('video/')) {
                toast.error('শুধুমাত্র ভিডিও ফাইল আপলোড করুন');
                return;
            }

            // Check file size (512MB)
            const maxSize = 512 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('ফাইল সাইজ 512MB এর বেশি হতে পারবে না');
                return;
            }

            setSelectedFile(file);
            console.log('✅ File selected:', file.name, (file.size / (1024 * 1024)).toFixed(2), 'MB');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setProgress(0);
        console.log('🚀 Starting upload to Cloudflare R2...');

        try {
            // Step 1: Get presigned URL from our API
            console.log('📡 Requesting presigned URL...');
            const response = await fetch('/api/r2/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'প্রিসাইন URL পেতে সমস্যা হয়েছে');
            }

            const { uploadUrl, key, publicUrl } = await response.json();
            console.log('✅ Presigned URL received');
            console.log('🔑 Key:', key);
            console.log('🌐 Public URL:', publicUrl);

            // Step 2: Upload directly to R2 with progress tracking
            console.log('📤 Uploading to R2...');

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        setProgress(percentComplete);
                        console.log(`📊 Progress: ${percentComplete}%`);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        console.log('✅ Upload complete!');
                        toast.success('ভিডিও সফলভাবে Cloudflare R2 এ আপলোড হয়েছে!');
                        onUploadComplete(publicUrl, key);
                        setSelectedFile(null);
                        setProgress(0);
                        resolve();
                    } else {
                        console.error('❌ Upload failed:', xhr.status, xhr.statusText);
                        reject(new Error(`আপলোড ব্যর্থ: ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    console.error('❌ Network error');
                    reject(new Error('নেটওয়ার্ক এরর'));
                });

                xhr.addEventListener('abort', () => {
                    console.log('⚠️ Upload cancelled');
                    reject(new Error('আপলোড বাতিল করা হয়েছে'));
                });

                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', selectedFile.type);
                xhr.send(selectedFile);
            });

        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'আপলোড করতে সমস্যা হয়েছে';
            toast.error(errorMessage);
            onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Progress Bar */}
            {uploading && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Cloudflare R2 এ আপলোড হচ্ছে... {progress}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-green-600 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* File Selection */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 hover:border-primary/50 transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />

                {selectedFile ? (
                    <div className="text-center space-y-4">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                        <div>
                            <p className="font-medium text-lg">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        আপলোড হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        R2 এ আপলোড করুন
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedFile(null)}
                                disabled={uploading}
                            >
                                <X className="mr-2 h-4 w-4" />
                                বাতিল
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            size="lg"
                        >
                            ভিডিও নির্বাচন করুন
                        </Button>
                        <p className="text-sm text-muted-foreground mt-4">
                            MP4, WebM বা OGG (সর্বোচ্চ 512MB)
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            ✨ সরাসরি Cloudflare R2 এ আপলোড হবে
                        </p>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
                <p className="font-medium mb-1">ℹ️ Direct R2 Upload:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Unlimited storage - কোন limit নেই</li>
                    <li>সরাসরি Cloudflare তে যাবে</li>
                    <li>Real-time progress tracking</li>
                </ul>
            </div>
        </div>
    );
}
