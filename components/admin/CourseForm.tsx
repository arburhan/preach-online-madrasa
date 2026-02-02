'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import LexicalEditor from '@/components/editor/LexicalEditor';
import EnrollmentPeriod from '@/components/admin/EnrollmentPeriod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface CourseFormProps {
    mode: 'create' | 'edit';
    courseId?: string;
}

export default function CourseForm({ mode }: CourseFormProps) {
    const [formData, setFormData] = useState({
        titleBn: '',
        titleEn: '',
        descriptionBn: '',
        descriptionEn: '',
        contentBn: '',
        price: 0,
        isFree: false,
        thumbnail: '',
        hasEnrollmentPeriod: false,
        enrollmentStartDate: undefined as Date | undefined,
        enrollmentEndDate: undefined as Date | undefined,
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // TODO: Implement API call
            console.log('Saving course:', formData);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert('Course saved successfully!');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/courses">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {mode === 'create' ? 'নতুন কোর্স তৈরি করুন' : 'কোর্স এডিট করুন'}
                    </h1>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </Button>
            </div>

            <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>মৌলিক তথ্য</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>কোর্স নাম (বাংলা) *</Label>
                                <Input
                                    value={formData.titleBn}
                                    onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                                    placeholder="যেমন: আরবি ভাষা শিক্ষা"
                                />
                            </div>
                            <div>
                                <Label>Course Name (English)</Label>
                                <Input
                                    value={formData.titleEn}
                                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                    placeholder="e.g., Arabic Language Learning"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>বিবরণ (বাংলা) *</Label>
                            <Textarea
                                value={formData.descriptionBn}
                                onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                                placeholder="কোর্সের সংক্ষিপ্ত বিবরণ লিখুন..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label>Description (English)</Label>
                            <Textarea
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                placeholder="Brief course description..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Course Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>কোর্সে কি কি থাকবে</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LexicalEditor
                            initialContent={formData.contentBn}
                            onChange={(json) => setFormData({ ...formData, contentBn: json })}
                            placeholder="কোর্সের বিস্তারিত কন্টেন্ট লিখুন..."
                        />
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle>মূল্য নির্ধারণ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Label>কোর্স ফি (টাকা)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    min="0"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="isFree"
                                    checked={formData.isFree}
                                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? 0 : formData.price })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="isFree">বিনামূল্যে</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enrollment Period */}
                <Card>
                    <CardHeader>
                        <CardTitle>এনরোলমেন্ট সময়সীমা</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EnrollmentPeriod
                            hasEnrollmentPeriod={formData.hasEnrollmentPeriod}
                            startDate={formData.enrollmentStartDate}
                            endDate={formData.enrollmentEndDate}
                            onChange={(data) => setFormData({ ...formData, ...data })}
                        />
                    </CardContent>
                </Card>

                {/* Sections & Lessons - Coming Next */}
                <Card>
                    <CardHeader>
                        <CardTitle>সেকশন ও লেসন</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            কোর্স তৈরির পর সেকশন এবং লেসন যোগ করতে পারবেন।
                        </p>
                        <Button variant="outline" className="mt-4" disabled>
                            সেকশন ম্যানেজ করুন (শীঘ্রই আসছে)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
