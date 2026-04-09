import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    ...props
}) {
    const variants = {
        primary: "bg-pucho-purple text-white hover:bg-violet-600 shadow-lg shadow-pucho-purple/20 hover:shadow-pucho-purple/30",
        secondary: "bg-white text-pucho-dark border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
        ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-pucho-dark",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-4 text-base",
    };

    return (
        <button
            className={cn(
                "rounded-xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
