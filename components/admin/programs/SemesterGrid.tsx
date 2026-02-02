'use client';

import { SemesterGridCard } from '@/components/admin/programs/SemesterGridCard';

interface Semester {
    _id: string;
    semesterNumber: number;
    titleBn: string;
    status: 'draft' | 'active';
    isCompleted: boolean;
    totalLessons: number;
    totalExams: number;
    contentMode: 'direct' | 'lesson-based';
}

interface SemesterGridProps {
    programId: string;
    totalSemesters: number;
    semesters: Semester[];
    basePath?: string;
}

export function SemesterGrid({ programId, totalSemesters, semesters, basePath = '/admin' }: SemesterGridProps) {
    // Create an array of semester numbers
    const semesterNumbers = Array.from({ length: totalSemesters }, (_, i) => i + 1);

    // Map existing semesters by number
    const semesterMap = new Map(semesters.map(s => [s.semesterNumber, s]));

    return (
        <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">সেমিস্টারসমূহ</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        মোট {totalSemesters} টি সেমিস্টার | {semesters.length} টি কনফিগার করা হয়েছে
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesterNumbers.map((num) => {
                    const semester = semesterMap.get(num);
                    return (
                        <SemesterGridCard
                            key={num}
                            programId={programId}
                            semesterNumber={num}
                            semester={semester || null}
                            basePath={basePath}
                        />
                    );
                })}
            </div>
        </div>
    );
}
