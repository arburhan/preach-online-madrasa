import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAuth();

    // Only teachers and admins can access
    if (!['teacher', 'admin'].includes(user.role)) {
        redirect('/unauthorized');
    }

    // Check teacher approval
    if (user.role === 'teacher' && !user.isTeacherApproved) {
        redirect('/teacher/pending-approval');
    }

    return <>{children}</>;
}
