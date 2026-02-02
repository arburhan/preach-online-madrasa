'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, PlayCircle, FileText, CheckCircle, Lock, Play } from 'lucide-react';

interface ContentItem {
    type: 'lesson' | 'exam';
    _id: string;
    order: number;
    titleBn: string;
    duration?: number;
    totalMarks?: number;
    passMarks?: number;
    isLocked: boolean;
    isCompleted: boolean;
    module?: string;
}

interface ModuleItem {
    _id: string;
    titleBn: string;
    order: number;
}

interface StudentModuleAccordionProps {
    modules: ModuleItem[];
    contents: ContentItem[];
    currentContentId?: string; // If watching a specific content
    baseUrl: string; // e.g., /student/programs/xxx/semesters/1/watch
}

export default function StudentModuleAccordion({
    modules,
    contents,
    currentContentId,
    baseUrl,
}: StudentModuleAccordionProps) {
    // Find which module contains the current content
    const findCurrentModuleId = () => {
        if (!currentContentId) return null;
        const currentContent = contents.find(c => c._id === currentContentId);
        return currentContent?.module || null;
    };

    const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
        const currentModuleId = findCurrentModuleId();
        if (currentModuleId) {
            return new Set([currentModuleId]);
        }
        // Default to first module expanded if no current content
        return modules.length > 0 ? new Set([modules[0]._id]) : new Set();
    });

    // Group content by module
    const groupedContents = modules.map(module => ({
        module,
        contents: contents
            .filter(c => c.module === module._id)
            .sort((a, b) => a.order - b.order),
    }));

    // Unassigned content (no module)
    const unassignedContents = contents
        .filter(c => !c.module)
        .sort((a, b) => a.order - b.order);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        return `${mins} মিনিট`;
    };

    const renderContentItem = (item: ContentItem, isCurrent: boolean) => {
        const isLocked = item.isLocked;
        const isCompleted = item.isCompleted;

        return (
            <Link
                key={item._id}
                href={isLocked ? '#' : `${baseUrl}/${item._id}`}
                className={`
                    flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${isCurrent
                        ? 'bg-primary/10 border-l-4 border-primary'
                        : isLocked
                            ? 'bg-muted/30 cursor-not-allowed opacity-60'
                            : 'hover:bg-muted'
                    }
                `}
                onClick={e => isLocked && e.preventDefault()}
            >
                <div className={`
                    p-2 rounded-full
                    ${isCompleted
                        ? 'bg-green-500/10 text-green-600'
                        : isCurrent
                            ? 'bg-primary/10 text-primary'
                            : isLocked
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-blue-500/10 text-blue-600'
                    }
                `}>
                    {isLocked ? (
                        <Lock className="h-4 w-4" />
                    ) : isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : item.type === 'lesson' ? (
                        isCurrent ? <Play className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />
                    ) : (
                        <FileText className="h-4 w-4" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : ''}`}>
                        {item.titleBn}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {item.type === 'lesson' ? (
                            item.duration && <span>{formatDuration(item.duration)}</span>
                        ) : (
                            <span>{item.totalMarks} নম্বর</span>
                        )}
                        <span className={`
                            px-1.5 py-0.5 rounded text-xs
                            ${item.type === 'lesson'
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'bg-orange-500/10 text-orange-600'
                            }
                        `}>
                            {item.type === 'lesson' ? 'ভিডিও' : 'পরীক্ষা'}
                        </span>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="space-y-3">
            {/* Module accordions */}
            {groupedContents.map(({ module, contents: moduleContents }) => (
                <div key={module._id} className="border rounded-xl overflow-hidden bg-card">
                    <button
                        onClick={() => toggleModule(module._id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <PlayCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{module.titleBn}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {moduleContents.length}টি কন্টেন্ট
                                    {moduleContents.filter(c => c.isCompleted).length > 0 && (
                                        <span className="ml-2 text-green-600">
                                            • {moduleContents.filter(c => c.isCompleted).length}টি সম্পন্ন
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        {expandedModules.has(module._id) ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </button>

                    {expandedModules.has(module._id) && (
                        <div className="border-t p-2 space-y-1 bg-background/50">
                            {moduleContents.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    এই মডিউলে কোনো কন্টেন্ট নেই
                                </p>
                            ) : (
                                moduleContents.map(item =>
                                    renderContentItem(item, item._id === currentContentId)
                                )
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Unassigned content (content without module) */}
            {unassignedContents.length > 0 && (
                <div className="border rounded-xl overflow-hidden bg-card">
                    <div className="p-4 bg-muted/30">
                        <h3 className="font-semibold">অন্যান্য কন্টেন্ট</h3>
                        <p className="text-xs text-muted-foreground">
                            {unassignedContents.length}টি কন্টেন্ট
                        </p>
                    </div>
                    <div className="border-t p-2 space-y-1 bg-background/50">
                        {unassignedContents.map(item =>
                            renderContentItem(item, item._id === currentContentId)
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
