"use client";

import React from "react";

export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center group ${className}`}>
            {/* Refined Geometric Logo (Minimalist Tech Style) */}
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Abstract "V" + Soundwave hybridization */}
                <path
                    d="M20 30L50 80L80 30"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-foreground transition-all duration-500 group-hover:scale-95"
                />
                <path
                    d="M35 15V45"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="text-primary/40 group-hover:text-primary transition-colors duration-500"
                >
                    <animate attributeName="d" values="M35 15V45;M35 25V35;M35 15V45" dur="3s" repeatCount="indefinite" />
                </path>
                <path
                    d="M50 5V35"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="text-primary/60 group-hover:text-primary transition-colors duration-500"
                >
                    <animate attributeName="d" values="M50 5V35;M50 15V25;M50 5V35" dur="2.5s" repeatCount="indefinite" />
                </path>
                <path
                    d="M65 15V45"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="text-primary/40 group-hover:text-primary transition-colors duration-500"
                >
                    <animate attributeName="d" values="M65 15V45;M65 25V35;M65 15V45" dur="3s" repeatCount="indefinite" />
                </path>
            </svg>
        </div>
    );
}
