'use client';

import { useEffect } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AndroidBackButtonHandler } from "@/components/AndroidBackButtonHandler";
import { ToastContainer } from "@/components/Toast";

import { Capacitor } from "@capacitor/core";
import { Fullscreen } from "@boengli/capacitor-fullscreen";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const registerPWAElements = async () => {
      const { defineCustomElements } = await import("@ionic/pwa-elements/loader");
      defineCustomElements(window);
    };
    registerPWAElements();

    const setupFullscreen = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await Fullscreen.activateImmersiveMode();
        } catch (error) {
          console.warn('Erro ao inicializar modo imersivo:', error);
        }
      }
    };
    setupFullscreen();
  }, []);

  return (
    <html lang="pt-BR" className={cn("h-full", "antialiased", inter.variable, plusJakarta.variable, "font-sans")}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="flex flex-col h-[100dvh] w-full overflow-hidden bg-background text-foreground overscroll-none selection:bg-primary/20">
        <AndroidBackButtonHandler />
        <ToastContainer />
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar w-full relative h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
