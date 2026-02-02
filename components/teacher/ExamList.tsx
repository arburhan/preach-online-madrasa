'use client';

import { useState } from 'react';
import ExamListItem from './ExamListItem';
import { useRouter } from 'next/navigation';

interface Exam {
    _id: string;
    titleBn: string;
    questionsCount: number;
    totalMarks: number;
    duration: number;
    status: string;
}

interface ExamListProps {
    exams: Exam[];
    courseId: string;
}

export default function ExamList({ exams, courseId }: ExamListProps) {
    const router = useRouter();
    const [examList, setExamList] = useState(exams);

    const handleDelete = (examId: string) => {
        setExamList(prev => prev.filter(exam => exam._id !== examId));
        router.refresh();
    };

    return (
        <div className="space-y-3">
            {examList.map((exam) => (
                <ExamListItem
                    key={exam._id}
                    exam={exam}
                    courseId={courseId}
                    onDelete={() => handleDelete(exam._id)}
                />
            ))}
        </div>
    );
}
