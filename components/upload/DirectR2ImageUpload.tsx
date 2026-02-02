'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface DirectR2ImageUploadProps {
    onUploadComplete: (url: string, key: string) => void;
    onUploadError?: (error: Error) => void;
}

export function DirectR2ImageUpload({ onUploadComplete, onUploadError }: DirectR2ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error('শুধুমাত্র ছবি ফাইল আপলোড করুন');
                return;
            }

            // Check file size (5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('ফাইল সাইজ 5MB এর বেশি হতে পারবে না');
                return;
            }

            setSelectedFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);

            console.log('✅ Image selected:', file.name, (file.size / (1024 * 1024)).toFixed(2), 'MB');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setProgress(0);
        console.log('🚀 Starting image upload to Cloudflare R2...');

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
                        toast.success('ছবি সফলভাবে Cloudflare R2 এ আপলোড হয়েছে!');
                        onUploadComplete(publicUrl, key);
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

    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Progress Bar */}
            {uploading && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                            R2 এ আপলোড হচ্ছে... {progress}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-purple-600 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* File Selection */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />

                {selectedFile && previewUrl ? (
                    <div className="space-y-4">
                        {/* Image Preview */}
                        <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                fill
                                className="object-contain"
                            />
                        </div>

                        <div className="text-center">
                            <p className="font-medium text-sm">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>

                        <div className="flex gap-2 justify-center">
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-purple-600 hover:bg-purple-700"
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
                                onClick={handleClear}
                                disabled={uploading}
                            >
                                <X className="mr-2 h-4 w-4" />
                                বাতিল
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            size="lg"
                        >
                            থাম্বনেইল নির্বাচন করুন
                        </Button>
                        <p className="text-sm text-muted-foreground mt-4">
                            JPG, PNG বা WebP (সর্বোচ্চ 5MB)
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                            ✨ সরাসরি Cloudflare R2 এ আপলোড হবে
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
