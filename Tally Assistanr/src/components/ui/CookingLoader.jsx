import React from 'react';
import { motion } from 'framer-motion';

export function CookingLoader() {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                    {/* Pot Handles */}
                    <path d="M5 45 Q0 50 5 55 L10 55 L10 45 Z" fill="#334155" />
                    <path d="M95 45 Q100 50 95 55 L90 55 L90 45 Z" fill="#334155" />

                    {/* Pot Body */}
                    <circle cx="50" cy="50" r="42" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

                    {/* Base Gravy Layer */}
                    <circle cx="50" cy="50" r="36" fill="#fbbf24" />

                    {/* Rotating Inner Content (Liquid, Veggies) */}
                    {/* BOUNDING BOX TRICK: Implicit center rotation by using 100x100 box */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ originX: "50%", originY: "50%" }}
                    >
                        {/* Swirls */}
                        <path d="M50 50 m-25,0 a25,25 0 1,1 50,0 a25,25 0 1,1 -50,0" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="10 30" opacity="0.5" />
                        {/* Bottom Veggies */}
                        <circle cx="30" cy="50" r="3" fill="#4ade80" />
                        <rect x="60" y="30" width="6" height="6" fill="#f87171" rx="1" transform="rotate(20 63 33)" />
                    </motion.g>

                    {/* Spoon REVOLVING Group */}
                    {/* We rotate the entire coordinate system around 50,50 */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{ originX: "50%", originY: "50%" }}
                    >
                        {/* Invisible Rect to define transform origin as 50,50 center of canvas */}
                        {/* This ensures 'center' rotation is actually the pot center */}
                        <rect x="0" y="0" width="100" height="100" fill="none" />

                        {/* Spoon Drawn OFFSET (at x=65 approx via translate) */}
                        <g transform="translate(15, 0)">
                            {/* Handle */}
                            <path d="M50 10 L50 45" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                            {/* Head */}
                            <circle cx="50" cy="50" r="9" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                            {/* Submerged Overlay */}
                            <circle cx="50" cy="50" r="9" fill="#fbbf24" fillOpacity="0.5" />
                            {/* Reflection */}
                            <path d="M50 46 Q53 46 54 50" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
                        </g>
                    </motion.g>

                    {/* Floating Veggies Top Layer (Separate rotation speed for depth) */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ originX: "50%", originY: "50%" }}
                    >
                        <rect x="0" y="0" width="100" height="100" fill="none" />
                        <circle cx="45" cy="70" r="4" fill="#4ade80" />
                        <rect x="25" y="40" width="7" height="7" fill="#f87171" rx="1" transform="rotate(45 28 43)" />
                    </motion.g>

                    {/* Steam - EXTRA VISIBLE */}
                    {[0, 1, 2].map((i) => (
                        <motion.path
                            key={i}
                            d={`M${50 + ((i - 1) * 12)} 30 Q${55 + ((i - 1) * 12)} 15 ${50 + ((i - 1) * 12)} 0`}
                            stroke="#94a3b8" // Slate-400 (Solid Grey)
                            strokeWidth="4"  // Very Thick
                            strokeLinecap="round"
                            fill="none"
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: [0, 1, 0], y: -35 }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "easeInOut"
                            }}
                        />
                    ))}

                </svg>
            </div>

            <motion.div
                className="mt-6 flex flex-col items-center"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pucho-purple to-indigo-600">
                    Pucho.ai is cooking...
                </h3>
            </motion.div>
        </div>
    );
}
