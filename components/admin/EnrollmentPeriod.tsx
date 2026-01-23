'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface EnrollmentPeriodProps {
    hasEnrollmentPeriod: boolean;
    startDate?: Date;
    endDate?: Date;
    onChange: (data: {
        hasEnrollmentPeriod: boolean;
        enrollmentStartDate?: Date;
        enrollmentEndDate?: Date;
    }) => void;
}

export default function EnrollmentPeriod({
    hasEnrollmentPeriod,
    startDate,
    endDate,
    onChange,
}: EnrollmentPeriodProps) {
    const [enabled, setEnabled] = useState(hasEnrollmentPeriod);

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        if (!checked) {
            onChange({
                hasEnrollmentPeriod: false,
                enrollmentStartDate: undefined,
                enrollmentEndDate: undefined,
            });
        } else {
            onChange({
                hasEnrollmentPeriod: true,
            });
        }
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            hasEnrollmentPeriod: enabled,
            enrollmentStartDate: e.target.value ? new Date(e.target.value) : undefined,
            enrollmentEndDate: endDate,
        });
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            hasEnrollmentPeriod: enabled,
            enrollmentStartDate: startDate,
            enrollmentEndDate: e.target.value ? new Date(e.target.value) : undefined,
        });
    };

    const formatDateForInput = (date?: Date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label>এনরোলমেন্ট পিরিয়ড নির্ধারণ করুন</Label>
                    <p className="text-sm text-muted-foreground">
                        নির্দিষ্ট সময়ের মধ্যে এনরোলমেন্ট সীমাবদ্ধ করুন
                    </p>
                </div>
                <Switch checked={enabled} onCheckedChange={handleToggle} />
            </div>

            {enabled && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                        <Label>শুরুর তারিখ</Label>
                        <Input
                            type="date"
                            value={formatDateForInput(startDate)}
                            onChange={handleStartDateChange}
                        />
                    </div>
                    <div>
                        <Label>শেষ তারিখ</Label>
                        <Input
                            type="date"
                            value={formatDateForInput(endDate)}
                            onChange={handleEndDateChange}
                            min={formatDateForInput(startDate)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
