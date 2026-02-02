'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight, Video, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Module {
    _id: string;
    titleBn: string;
    titleEn?: string;
    order: number;
}

interface ContentItem {
    _id: string;
    titleBn: string;
    type: 'lesson' | 'exam';
    order: number;
    duration?: number;
    status?: string;
}

interface ModuleManagerProps {
    programId: string;
    semesterNumber: number;
    semesterId: string;
}

export default function ModuleManager({ programId, semesterNumber }: ModuleManagerProps) {
    const [modules, setModules] = useState<Module[]>([]);
    const [moduleContents, setModuleContents] = useState<Record<string, ContentItem[]>>({});
    const [unassignedContent, setUnassignedContent] = useState<ContentItem[]>([]);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [showUnassigned, setShowUnassigned] = useState(true);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newModuleName, setNewModuleName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Fetch modules and unassigned content
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch modules
                const modulesRes = await fetch(`/api/admin/programs/${programId}/semesters/${semesterNumber}/modules`);
                if (modulesRes.ok) {
                    const data = await modulesRes.json();
                    // Sort in descending order (latest first)
                    const sortedModules = data.sort((a: Module, b: Module) => b.order - a.order);
                    setModules(sortedModules);
                    // Auto-expand the latest module (first in desc order)
                    if (sortedModules.length > 0) {
                        setExpandedModules(new Set([sortedModules[0]._id]));
                    }
                }

                // Fetch unassigned content (lessons and exams without module)
                const [lessonsRes, examsRes] = await Promise.all([
                    fetch(`/api/admin/programs/${programId}/semesters/${semesterNumber}/lessons`),
                    fetch(`/api/admin/programs/${programId}/semesters/${semesterNumber}/exams`)
                ]);

                const lessons = lessonsRes.ok ? await lessonsRes.json() : [];
                const exams = examsRes.ok ? await examsRes.json() : [];

                // Filter content that doesn't have a module
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const unassigned: ContentItem[] = [
                    ...lessons.filter((l: any) => !l.module).map((l: any) => ({ ...l, type: 'lesson' as const })),
                    ...exams.filter((e: any) => !e.module).map((e: any) => ({ ...e, type: 'exam' as const }))
                ].sort((a, b) => a.order - b.order);

                setUnassignedContent(unassigned);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [programId, semesterNumber]);

    // Fetch module content when expanded
    const fetchModuleContent = async (moduleId: string) => {
        if (moduleContents[moduleId]) return;

        try {
            const [lessonsRes, examsRes] = await Promise.all([
                fetch(`/api/admin/programs/${programId}/semesters/${semesterNumber}/lessons?module=${moduleId}`),
                fetch(`/api/admin/programs/${programId}/semesters/${semesterNumber}/exams?module=${moduleId}`)
            ]);

            const lessons = lessonsRes.ok ? await lessonsRes.json() : [];
            const exams = examsRes.ok ? await examsRes.json() : [];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const content: ContentItem[] = [
                ...lessons.map((l: any) => ({ ...l, type: 'lesson' as const })),
                ...exams.map((e: any) => ({ ...e, type: 'exam' as const }))
            ].sort((a, b) => a.order - b.order);

            setModuleContents(prev => ({ ...prev, [moduleId]: content }));
        } catch (error) {
            console.error('Failed to fetch module content:', error);
        }
    };

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
            fetchModuleContent(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const createModule = async () => {
        if (!newModuleName.trim()) {
            toast.error('মডিউলের নাম দিন');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch(`/api/admin/programs/${programId}/semesters/${semesterNumber}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titleBn: newModuleName.trim() })
            });

            if (res.ok) {
                const newModule = await res.json();
                setModules([...modules, newModule]);
                setNewModuleName('');
                setShowCreateForm(false);
                toast.success('মডিউল তৈরি হয়েছে');
            } else {
                const error = await res.json();
                toast.error(error.error || 'সমস্যা হয়েছে');
            }
        } catch {
            toast.error('মডিউল তৈরি করতে সমস্যা হয়েছে');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Unassigned content (existing content without module) */}
            {unassignedContent.length > 0 && (
                <div className="border rounded-xl overflow-hidden border-amber-500/50 bg-amber-50/10">
                    <button
                        onClick={() => setShowUnassigned(!showUnassigned)}
                        className="w-full flex items-center justify-between p-4 bg-amber-100/20 hover:bg-amber-100/40 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {showUnassigned ? (
                                <ChevronDown className="h-5 w-5 text-amber-600" />
                            ) : (
                                <ChevronRight className="h-5 w-5 text-amber-600" />
                            )}
                            <span className="font-semibold text-amber-700">
                                মডিউলবিহীন কন্টেন্ট
                            </span>
                        </div>
                        <span className="text-sm text-amber-600">
                            {unassignedContent.length} টি কন্টেন্ট
                        </span>
                    </button>

                    {showUnassigned && (
                        <div className="border-t border-amber-200 bg-amber-50/20 p-4 space-y-3">
                            <p className="text-xs text-amber-600 mb-3">
                                এই কন্টেন্টগুলো কোনো মডিউলে যোগ করা হয়নি। মডিউলে সংগঠিত করতে নতুন করে যোগ করুন।
                            </p>
                            {unassignedContent.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                                >
                                    {item.type === 'lesson' ? (
                                        <Video className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-orange-500" />
                                    )}
                                    <span className="flex-1">{item.titleBn}</span>
                                    {item.duration && (
                                        <span className="text-sm text-muted-foreground">
                                            {item.duration} মিনিট
                                        </span>
                                    )}
                                    {/* Manage button for exams */}
                                    {item.type === 'exam' && (
                                        <Link href={`/teacher/exams/${item._id}/manage`}>
                                            <Button variant="outline" size="sm">
                                                ম্যানেজ
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Module list */}
            {modules.map((module, index) => (
                <div key={module._id} className="border rounded-xl overflow-hidden">
                    {/* Module header */}
                    <button
                        onClick={() => toggleModule(module._id)}
                        className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {expandedModules.has(module._id) ? (
                                <ChevronDown className="h-5 w-5 text-primary" />
                            ) : (
                                <ChevronRight className="h-5 w-5" />
                            )}
                            <span className="font-semibold">
                                মডিউল {index + 1}: {module.titleBn}
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {moduleContents[module._id]?.length || 0} টি কন্টেন্ট
                        </span>
                    </button>

                    {/* Module content */}
                    {expandedModules.has(module._id) && (
                        <div className="border-t bg-muted/20 p-4 space-y-3">
                            {/* Content items */}
                            {moduleContents[module._id]?.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                                >
                                    {item.type === 'lesson' ? (
                                        <Video className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-orange-500" />
                                    )}
                                    <span className="flex-1">{item.titleBn}</span>
                                    {item.duration && (
                                        <span className="text-sm text-muted-foreground">
                                            {item.duration} মিনিট
                                        </span>
                                    )}
                                    {/* Manage button for exams */}
                                    {item.type === 'exam' && (
                                        <Link href={`/teacher/exams/${item._id}/manage`}>
                                            <Button variant="outline" size="sm">
                                                ম্যানেজ
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}

                            {/* Empty state */}
                            {(!moduleContents[module._id] || moduleContents[module._id].length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    এই মডিউলে কোনো কন্টেন্ট নেই
                                </p>
                            )}

                            {/* Add content buttons */}
                            <div className="flex gap-2 pt-2">
                                <Link href={`/admin/programs/${programId}/semesters/${semesterNumber}/lessons/new?module=${module._id}`}>
                                    <Button variant="outline" size="sm">
                                        <Video className="mr-2 h-4 w-4" />
                                        ভিডিও যোগ করুন
                                    </Button>
                                </Link>
                                <Link href={`/admin/programs/${programId}/semesters/${semesterNumber}/exams/create?module=${module._id}`}>
                                    <Button variant="outline" size="sm">
                                        <FileText className="mr-2 h-4 w-4" />
                                        পরীক্ষা যোগ করুন
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Empty state */}
            {modules.length === 0 && !showCreateForm && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <h3 className="text-lg font-medium mb-2">কোনো মডিউল নেই</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        প্রথমে মডিউল তৈরি করুন, তারপর মডিউলে কন্টেন্ট যোগ করুন
                    </p>
                </div>
            )}

            {/* Create module form */}
            {showCreateForm ? (
                <div className="flex gap-2 p-4 border rounded-xl bg-card">
                    <input
                        type="text"
                        value={newModuleName}
                        onChange={(e) => setNewModuleName(e.target.value)}
                        placeholder="মডিউলের নাম লিখুন..."
                        className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && createModule()}
                    />
                    <Button onClick={createModule} disabled={creating}>
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'তৈরি করুন'}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                        বাতিল
                    </Button>
                </div>
            ) : (
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCreateForm(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    নতুন মডিউল যোগ করুন
                </Button>
            )}
        </div>
    );
}
