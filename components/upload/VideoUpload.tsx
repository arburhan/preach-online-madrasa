'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Youtube, Loader2 } from 'lucide-react';

interface VideoUploadProps {
    onVideoSelect: (data: {
        source: 'r2' | 'youtube';
        url: string;
        key?: string;
        duration?: number;
    }) => void;
    currentSource?: 'r2' | 'youtube';
    currentUrl?: string;
}

export default function VideoUpload({
    onVideoSelect,
    currentSource = 'youtube',
    currentUrl = '',
}: VideoUploadProps) {
    const [source, setSource] = useState<'r2' | 'youtube'>(currentSource);
    const [youtubeUrl, setYoutubeUrl] = useState(currentUrl);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleYoutubeSubmit = () => {
        if (!youtubeUrl) return;

        // Extract video ID and validate
        const videoId = extractYoutubeId(youtubeUrl);
        if (!videoId) {
            alert('Invalid YouTube URL');
            return;
        }

        onVideoSelect({
            source: 'youtube',
            url: youtubeUrl,
        });
    };

    const handleR2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            // TODO: Implement actual R2 upload
            // For now, simulate upload
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            onVideoSelect({
                source: 'r2',
                url: 'https://example-r2-url.com/video.mp4', // Replace with actual URL
                key: 'video-key-123', // Replace with actual key
            });
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const extractYoutubeId = (url: string): string | null => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[7].length === 11 ? match[7] : null;
    };

    return (
        <div className="space-y-4">
            <Label>Video Source</Label>
            <RadioGroup
                value={source}
                onValueChange={(value) => setSource(value as 'r2' | 'youtube')}
                className="flex gap-4"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="youtube" id="youtube" />
                    <Label htmlFor="youtube" className="flex items-center gap-2 cursor-pointer">
                        <Youtube className="h-4 w-4" />
                        YouTube
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="r2" id="r2" />
                    <Label htmlFor="r2" className="flex items-center gap-2 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Upload to R2
                    </Label>
                </div>
            </RadioGroup>

            {source === 'youtube' ? (
                <div className="space-y-2">
                    <Label>YouTube URL</Label>
                    <div className="flex gap-2">
                        <Input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                        />
                        <Button onClick={handleYoutubeSubmit} type="button">
                            Validate
                        </Button>
                    </div>
                    {youtubeUrl && extractYoutubeId(youtubeUrl) && (
                        <div className="mt-4">
                            <Label>Preview</Label>
                            <div className="aspect-video mt-2 rounded-lg overflow-hidden">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${extractYoutubeId(youtubeUrl)}`}
                                    title="YouTube preview"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    <Label>Upload Video File</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        {uploading ? (
                            <div className="space-y-2">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                <p className="text-sm text-muted-foreground">
                                    Uploading... {uploadProgress}%
                                </p>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Drop video file here or click to upload
                                </p>
                                <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleR2Upload}
                                    className="max-w-xs mx-auto"
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
