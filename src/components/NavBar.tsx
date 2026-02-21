'use client';

import Link from 'next/link';
import MagneticElement from './MagneticElement';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
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
                    <kbd className="cmdk-trigger" onClick={openCommandPalette} style={{ cursor: 'pointer' }}>
                        ⌘K
                    </kbd>
                </MagneticElement>
                <ThemeToggle />
            </div>
        </nav>
    );
}
