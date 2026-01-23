'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Plus,
    GripVertical,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    Video,
} from 'lucide-react';

interface Section {
    id: string;
    titleBn: string;
    titleEn?: string;
    order: number;
    lessons: Lesson[];
}

interface Lesson {
    id: string;
    titleBn: string;
    videoSource: 'r2' | 'youtube';
    videoUrl: string;
    duration: number;
    order: number;
}

interface SectionManagerProps {
    courseId?: string;
    subjectId?: string;
    sections: Section[];
    onUpdate: (sections: Section[]) => void;
}

export default function SectionManager({
    sections,
    onUpdate,
}: SectionManagerProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set()
    );
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const addSection = () => {
        if (!newSectionTitle.trim()) return;

        const newSection: Section = {
            id: `temp-${Date.now()}`,
            titleBn: newSectionTitle,
            order: sections.length,
            lessons: [],
        };

        onUpdate([...sections, newSection]);
        setNewSectionTitle('');
    };

    const deleteSection = (sectionId: string) => {
        if (!confirm('এই সেকশনটি মুছে ফেলবেন?')) return;
        onUpdate(sections.filter((s) => s.id !== sectionId));
    };

    const addLesson = (sectionId: string) => {
        // TODO: Open lesson modal
        console.log('Add lesson to section:', sectionId);
    };

    return (
        <div className="space-y-4">
            {/* Add Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">নতুন সেকশন যোগ করুন</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="সেকশনের নাম (যেমন: পরিচিতি)"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSection()}
                        />
                        <Button onClick={addSection}>
                            <Plus className="h-4 w-4 mr-2" />
                            যোগ করুন
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sections List */}
            <div className="space-y-3">
                {sections.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            কোন সেকশন নেই। উপরে নতুন সেকশন যোগ করুন।
                        </CardContent>
                    </Card>
                ) : (
                    sections.map((section) => {
                        const isExpanded = expandedSections.has(section.id);
                        return (
                            <Card key={section.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="cursor-move p-1 hover:bg-accent rounded"
                                            aria-label="Drag to reorder"
                                        >
                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        </button>

                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="p-1"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>

                                        <div className="flex-1">
                                            <h3 className="font-semibold">
                                                {section.titleBn}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {section.lessons.length} টি লেসন
                                            </p>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingSection(section.id)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteSection(section.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="pt-0">
                                        <div className="space-y-2">
                                            {section.lessons.length === 0 ? (
                                                <div className="text-center py-4 text-muted-foreground text-sm">
                                                    কোন লেসন নেই
                                                </div>
                                            ) : (
                                                section.lessons.map((lesson) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent/50"
                                                    >
                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                        <Video className="h-4 w-4" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">
                                                                {lesson.titleBn}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {lesson.videoSource === 'youtube'
                                                                    ? 'YouTube'
                                                                    : 'R2'}{' '}
                                                                • {lesson.duration} মিনিট
                                                            </p>
                                                        </div>
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}

                                            <Button
                                                variant="outline"
                                                className="w-full mt-2"
                                                onClick={() => addLesson(section.id)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                লেসন যোগ করুন
                                            </Button>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
