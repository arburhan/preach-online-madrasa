import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{
        id: string;
        lessonId: string;
    }>;
}

export default async function EditLessonPage({ params }: PageProps) {
    const { id } = await params;

    // Redirect to course page for now
    // TODO: Implement lesson edit functionality
    redirect(`/teacher/courses/${id}`);
}
