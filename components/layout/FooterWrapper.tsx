'use client';

import { usePathname } from 'next/navigation';

// Routes where footer should be hidden (dashboard areas with sidebars)
const hiddenRoutes = ['/admin'];

export default function FooterWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const shouldHideFooter = hiddenRoutes.some(route => pathname.startsWith(route));

    if (shouldHideFooter) {
        return null;
    }

    return <>{children}</>;
}
