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
        // Initialize Tawk.to variables
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Get environment variables
        const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
        const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

        // Only load if both IDs are available
        if (!propertyId || !widgetId) {
            console.warn('Tawk.to: Missing PROPERTY_ID or WIDGET_ID');
            return;
        }

        // Create and append the script
        const s1 = document.createElement('script');
        s1.async = true;
        s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        document.body.appendChild(s1);

        // Cleanup on unmount
        return () => {
            // Remove the script when component unmounts
            const tawkScript = document.querySelector(`script[src*="embed.tawk.to"]`);
            if (tawkScript) {
                tawkScript.remove();
            }
        };
    }, []);

    return null; // This component doesn't render anything
}
