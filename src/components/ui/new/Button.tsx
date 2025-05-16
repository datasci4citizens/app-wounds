import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', fullWidth = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-[20px] px-4 py-2.5 gap-2.5 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          
          // Variant styles
          variant === 'default' && "bg-[#0120AC] text-white hover:bg-[#0120AC]/90",
          variant === 'outline' && "border border-input bg-white hover:bg-slate-100 text-[#0120AC]",
          variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
          variant === 'link' && "underline-offset-4 hover:underline text-primary",
          
          // Size styles
          size === 'default' && "h-11 w-full",
          size === 'sm' && "h-9 py-2 text-sm",
          size === 'lg' && "h-12 py-3",
          
          // Full width option
          fullWidth && "w-full",
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';