'use client';

import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AndroidBackButtonHandler } from "@/components/AndroidBackButtonHandler";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("h-full", "antialiased", inter.variable, plusJakarta.variable, "font-sans")}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="flex flex-col h-[100dvh] w-full overflow-hidden bg-background text-foreground overscroll-none selection:bg-primary/20">
        <AndroidBackButtonHandler />
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar w-full relative h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
