'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (stored) {
            setTheme(stored);
            document.documentElement.setAttribute('data-theme', stored);
        }
    }, []);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    if (!mounted) return null;

    return (
        <button
            onClick={toggle}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <motion.div
                className="toggle-track"
                animate={{
                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    className="toggle-thumb"
                    animate={{
                        x: theme === 'dark' ? 0 : 20,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    {theme === 'dark' ? '🌙' : '☀️'}
                </motion.div>
            </motion.div>
        </button>
    );
}
