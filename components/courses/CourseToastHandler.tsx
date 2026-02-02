'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

export default function CourseToastHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const error = searchParams.get('error');

        if (error === 'no_content') {
            toast.error('ক্লাস ভিডিও আপলোড করা হয়নি অপেক্ষা করুন', {
                duration: 4000,
            });

            // Clean up the URL
            const params = new URLSearchParams(searchParams);
            params.delete('error');
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [searchParams, router, pathname]);

    return null;
}
