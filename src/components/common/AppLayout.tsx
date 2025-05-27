import React from 'react'

interface AppLayoutProps {
    children: React.ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* Fixed header */}
            <div className=""/>
            
            {/* Scrollable content */}
            <div className="flex-grow bg-white relative z-10 overflow-auto">
                <div className="">
                    {children}
                </div>
            </div>
        </div>
    );
}