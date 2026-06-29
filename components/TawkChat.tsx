'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        Tawk_API?: object;
        Tawk_LoadStart?: Date;
    }
}

export default function TawkChat() {
    useEffect(() => {
        // Get environment variables
        const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
        const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

        // Only load if both IDs are available
        if (!propertyId || !widgetId) {
            return;
        }

        // Defer loading to avoid blocking initial page render
        const loadTawk = () => {
            window.Tawk_API = window.Tawk_API || {};
            window.Tawk_LoadStart = new Date();

            const s1 = document.createElement('script');
            s1.async = true;
            s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            document.body.appendChild(s1);
        };

        // Use requestIdleCallback if available, otherwise setTimeout
        let timerId: ReturnType<typeof setTimeout> | undefined;
        if ('requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(loadTawk, { timeout: 8000 });
            return () => {
                window.cancelIdleCallback(idleId);
                const tawkScript = document.querySelector(`script[src*="embed.tawk.to"]`);
                if (tawkScript) tawkScript.remove();
            };
        } else {
            timerId = setTimeout(loadTawk, 5000);
            return () => {
                if (timerId) clearTimeout(timerId);
                const tawkScript = document.querySelector(`script[src*="embed.tawk.to"]`);
                if (tawkScript) tawkScript.remove();
            };
        }
    }, []);

    return null; // This component doesn't render anything
}
