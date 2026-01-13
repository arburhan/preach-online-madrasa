import { redirect } from 'next/navigation';

export default function CoursesPage() {
    // Redirect to student browse page
    redirect('/student/browse');
}
