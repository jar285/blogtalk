'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MagneticElement from './MagneticElement';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';

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
                    <Link href="/tags">Tags</Link>
                </MagneticElement>
                <MagneticElement strength={0.25}>
                    <Link href="/projects">Projects</Link>
                </MagneticElement>
                <MagneticElement strength={0.25}>
                    <Link href="/search" className="nav-icon-link" aria-label="Search">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </Link>
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
                <AuthButton />
            </div>
        </nav>
    );
}
