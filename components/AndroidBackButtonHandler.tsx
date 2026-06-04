'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Caminhos base (raízes) onde o botão de voltar do Android
 * fechará o aplicativo, em vez de voltar a página.
 */
const ROOT_PATHS = [
    '/',
    '/login',
    '/role-selection',
];

export function AndroidBackButtonHandler() {
    const router = useRouter();
    const pathname = usePathname();

    const pathnameRef = useRef(pathname);
    // Atualiza a ref sem disparar re-renders do effect
    pathnameRef.current = pathname;

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const listenerPromise = App.addListener('backButton', () => {
            const overrideBtn = document.querySelector('[data-back-override]') as HTMLElement;
            if (overrideBtn) {
                overrideBtn.click();
                return;
            }

            if (ROOT_PATHS.includes(pathnameRef.current)) {
                App.exitApp();
            } else {
                router.back();
            }
        });

        return () => {
            listenerPromise.then(handle => handle.remove());
        };
    }, [router]);

    return null;
}
