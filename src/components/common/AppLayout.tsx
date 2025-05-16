import React from 'react'

interface AppLayoutProps {
    children: React.ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {
    return (
        <div className="flex flex-col">
            <div className="bg-sky-900 h-24 fixed top-0 left-0 right-0 z-10"/>

            <div className={`mt-16 pt-8 flex-1 overflow-y-auto bg-white rounded-t-[40px] z-20`}>
                {children}
            </div>
        </div>
    );
}