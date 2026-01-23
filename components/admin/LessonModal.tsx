'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import VideoUpload from '@/components/upload/VideoUpload';

interface LessonModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (lesson: LessonData) => void;
    initialData?: LessonData;
}

export interface LessonData {
    titleBn: string;
    titleEn?: string;
    descriptionBn?: string;
    videoSource: 'r2' | 'youtube';
    videoUrl: string;
    videoKey?: string;
    duration: number;
}

export default function LessonModal({
    open,
    onClose,
    onSave,
    initialData,
}: LessonModalProps) {
    const [formData, setFormData] = useState<LessonData>(
        initialData || {
            titleBn: '',
            videoSource: 'youtube',
            videoUrl: '',
            duration: 0,
        }
    );

    const handleSave = () => {
        if (!formData.titleBn || !formData.videoUrl) {
            alert('শিরোনাম এবং ভিডিও আবশ্যক');
            return;
        }
        onSave(formData);
        onClose();
    };

    const handleVideoSelect = (data: {
        source: 'r2' | 'youtube';
        url: string;
        key?: string;
        duration?: number;
    }) => {
        setFormData({
            ...formData,
            videoSource: data.source,
            videoUrl: data.url,
            videoKey: data.key,
            duration: data.duration || formData.duration,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'লেসন এডিট করুন' : 'নতুন লেসন যোগ করুন'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Title */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>লেসনের নাম (বাংলা) *</Label>
                            <Input
                                value={formData.titleBn}
                                onChange={(e) =>
                                    setFormData({ ...formData, titleBn: e.target.value })
                                }
                                placeholder="যেমন: হরফ পরিচয়"
                            />
                        </div>
                        <div>
                            <Label>Lesson Title (English)</Label>
                            <Input
                                value={formData.titleEn}
                                onChange={(e) =>
                                    setFormData({ ...formData, titleEn: e.target.value })
                                }
                                placeholder="e.g., Introduction to Letters"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Label>বিবরণ (বাংলা)</Label>
                        <Textarea
                            value={formData.descriptionBn}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    descriptionBn: e.target.value,
                                })
                            }
                            placeholder="লেসনের সংক্ষিপ্ত বিবরণ..."
                            rows={2}
                        />
                    </div>

                    {/* Video Upload */}
                    <div>
                        <VideoUpload
                            onVideoSelect={handleVideoSelect}
                            currentSource={formData.videoSource}
                            currentUrl={formData.videoUrl}
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <Label>সময়কাল (মিনিট)</Label>
                        <Input
                            type="number"
                            value={formData.duration}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    duration: Number(e.target.value),
                                })
                            }
                            min="0"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        বাতিল
                    </Button>
                    <Button onClick={handleSave}>সংরক্ষণ করুন</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
