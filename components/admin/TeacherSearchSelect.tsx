'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Teacher {
    _id: string;
    name: string;
    email: string;
}

interface TeacherSearchSelectProps {
    selectedTeachers: Teacher[];
    onTeachersChange: (teachers: Teacher[]) => void;
    placeholder?: string;
}

export default function TeacherSearchSelect({ selectedTeachers, onTeachersChange }: TeacherSearchSelectProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const debounce = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/teachers/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();

                // Filter out already selected teachers
                const filtered = data.teachers.filter(
                    (teacher: Teacher) => !selectedTeachers.some(t => t._id === teacher._id)
                );

                setSearchResults(filtered);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery, selectedTeachers]);

    const handleSelectTeacher = (teacher: Teacher) => {
        onTeachersChange([...selectedTeachers, teacher]);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    const handleRemoveTeacher = (teacherId: string) => {
        onTeachersChange(selectedTeachers.filter(t => t._id !== teacherId));
    };

    return (
        <div className="space-y-4">
            {/* Selected Teachers */}
            {selectedTeachers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedTeachers.map((teacher) => (
                        <Badge
                            key={teacher._id}
                            variant="secondary"
                            className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100"
                        >
                            <span className="mr-2">{teacher.name}</span>
                            <span className="text-xs text-muted-foreground">({teacher.email})</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2 hover:bg-purple-200 dark:hover:bg-purple-800"
                                onClick={() => handleRemoveTeacher(teacher._id)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="শিক্ষকের নাম বা ইমেইল দিয়ে খুঁজুন..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                        className="pl-10 pr-10"
                    />
                    {loading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {searchResults.map((teacher) => (
                            <button
                                type="button"
                                key={teacher._id}
                                onClick={() => handleSelectTeacher(teacher)}
                                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                            >
                                <div className="font-medium">{teacher.name}</div>
                                <div className="text-sm text-muted-foreground">{teacher.email}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* No Results */}
                {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
                    <div className="absolute z-10 w-full mt-2 bg-card border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
                        কোনো শিক্ষক পাওয়া যায়নি
                    </div>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                একাধিক শিক্ষক নিয়োগ করতে পারবেন। ন্যূনতম একজন শিক্ষক নিয়োগ আবশ্যক।
            </p>
        </div>
    );
}
