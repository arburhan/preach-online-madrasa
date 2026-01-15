'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Lock, Unlock } from 'lucide-react';

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isAdminRegistrationOpen, setIsAdminRegistrationOpen] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (res.ok) {
                setIsAdminRegistrationOpen(data.isAdminRegistrationOpen);
            }
        } catch (error) {
            console.error(error);
            toast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const toggleRegistration = async () => {
        setUpdating(true);
        try {
            const newValue = !isAdminRegistrationOpen;
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAdminRegistrationOpen: newValue }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setIsAdminRegistrationOpen(data.isAdminRegistrationOpen);
            toast.success(newValue ? 'অ্যাডমিন নিবন্ধন চালু করা হয়েছে' : 'অ্যাডমিন নিবন্ধন বন্ধ করা হয়েছে');
        } catch (error) {
            toast.error('সেটিংস আপডেট করতে সমস্যা হয়েছে');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">সেটিংস</h1>

            <div className="bg-card border rounded-lg p-6 max-w-2xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">অ্যাডমিন অ্যাক্সেস কন্ট্রোল</h2>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                        <p className="font-medium text-foreground">অ্যাডমিন নিবন্ধন পেজ</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            বর্তমানে নিবন্ধন {isAdminRegistrationOpen ? <span className="text-green-600 font-medium">চালু</span> : <span className="text-red-600 font-medium">বন্ধ</span>} আছে
                        </p>
                        {isAdminRegistrationOpen && (
                            <p className="text-xs text-muted-foreground mt-1">
                                লিংক: <a href="/admin-register" className="underline hover:text-primary">/admin-register</a>
                            </p>
                        )}
                    </div>

                    <Button
                        variant={isAdminRegistrationOpen ? "destructive" : "default"}
                        onClick={toggleRegistration}
                        disabled={updating}
                        className="w-36 transition-all"
                    >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            isAdminRegistrationOpen ? (
                                <><Lock className="h-4 w-4 mr-2" /> বন্ধ করুন</>
                            ) : (
                                <><Unlock className="h-4 w-4 mr-2" /> চালু করুন</>
                            )
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
