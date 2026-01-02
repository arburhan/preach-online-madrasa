'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
                style: {
                    fontFamily: 'var(--font-bengali), var(--font-inter)',
                },
            }}
        />
    );
}
