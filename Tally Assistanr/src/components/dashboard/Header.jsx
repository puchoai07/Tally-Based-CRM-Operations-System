import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

export function Header({ onMenuClick }) {
    const hours = new Date().getHours();
    const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

    // Typewriter Effect Logic
    const TITLES = [
        "Pucho Tally Assistant",
        "पूछो टैली असिस्टेंट",   // Hindi
        "પૂછો ટેલી આસિસ્ટન્ટ", // Gujarati
        "पूछो टॅली असिस्टंट"   // Marathi
    ];

    const [displayText, setDisplayText] = useState("");
    const [titleIndex, setTitleIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentTitle = TITLES[titleIndex];
        const typeSpeed = isDeleting ? 50 : 100;

        const timer = setTimeout(() => {
            if (!isDeleting && displayText === currentTitle) {
                // Finished typing, wait before deleting
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && displayText === "") {
                // Finished deleting, move to next title
                setIsDeleting(false);
                setTitleIndex((prev) => (prev + 1) % TITLES.length);
            } else {
                // Typing or deleting
                const nextText = isDeleting
                    ? currentTitle.substring(0, displayText.length - 1)
                    : currentTitle.substring(0, displayText.length + 1);
                setDisplayText(nextText);
            }
        }, typeSpeed);

        return () => clearTimeout(timer);
    }, [displayText, isDeleting, titleIndex]);

    return (
        <header className="h-16 md:h-20 px-4 md:px-8 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-2">
            {/* Mobile Menu Trigger & Title (Left) */}
            <div className="flex items-center gap-2 overflow-hidden flex-1">
                <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg flex-shrink-0">
                    <Menu className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Typing Title */}
                <h1 className="text-sm md:text-2xl font-bold tracking-tight flex items-center whitespace-nowrap overflow-hidden text-ellipsis text-pucho-dark">
                    <span>{displayText.split(" ")[0]}</span>
                    &nbsp;
                    <span className="text-pucho-purple">{displayText.split(" ").slice(1).join(" ")}</span>
                    <span className="animate-pulse ml-0.5 text-pucho-purple">|</span>
                </h1>
            </div>

            {/* Greeting (Right) */}
            <div className="flex items-center flex-shrink-0 text-right">
                <div className="animate-fade-in flex flex-col items-end leading-none">
                    <span className="text-[10px] md:text-sm text-slate-400 font-medium uppercase tracking-wider block">
                        {hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening'}
                    </span>
                    <h2 className="text-sm md:text-lg font-bold text-pucho-dark">
                        Explorer!
                    </h2>
                </div>
            </div>
        </header>
    );
}
