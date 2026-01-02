import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/rbac';

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAuth();

    // Only students can access this area
    if (user.role !== 'student') {
        redirect('/unauthorized');
    }

    return <>{children}</>;
}
