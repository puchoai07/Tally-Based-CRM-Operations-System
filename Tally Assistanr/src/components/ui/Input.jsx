import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, icon: Icon, ...props }, ref) => {
    return (
        <div className="relative group">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pucho-purple transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <input
                ref={ref}
                className={cn(
                    "w-full bg-white border border-slate-200 text-pucho-dark placeholder:text-slate-400 rounded-xl outline-none focus:border-pucho-purple focus:ring-4 focus:ring-pucho-purple/10 transition-all font-medium",
                    Icon ? "pl-12 pr-4" : "px-4",
                    "h-14", // Consistent height
                    className
                )}
                {...props}
            />
        </div>
    );
});
Input.displayName = "Input";
