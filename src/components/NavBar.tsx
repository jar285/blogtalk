'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MagneticElement from './MagneticElement';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
    const [isMac, setIsMac] = useState(true);

    // Detect OS on client to avoid hydration mismatch
    useEffect(() => {
        setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
    }, []);

    const openCommandPalette = () => {
        document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'k', metaKey: true })
        );
    };

    return (
        <nav>
            <Link href="/" className="logo">Jesus&apos;s Blog</Link>
            <div className="nav-links">
                <MagneticElement strength={0.25}>
                    <Link href="/">Home</Link>
                </MagneticElement>
                <MagneticElement strength={0.25}>
                    <Link href="/blog">Articles</Link>
                </MagneticElement>
                <MagneticElement strength={0.25}>
                    <Link href="/projects">Projects</Link>
                </MagneticElement>
                <MagneticElement strength={0.2}>
                    <kbd
                        className="cmdk-trigger"
                        onClick={openCommandPalette}
                        role="button"
                        tabIndex={0}
                        aria-label="Open command palette"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openCommandPalette(); }}
                        style={{ cursor: 'pointer' }}
                    >
                        {isMac ? '⌘K' : 'Ctrl+K'}
                    </kbd>
                </MagneticElement>
                <ThemeToggle />
            </div>
        </nav>
    );
}
