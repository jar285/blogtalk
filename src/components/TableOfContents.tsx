'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface Heading {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-10% 0px -80% 0px' } // Highlight when it hits top 10%
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className="toc">
            <h4 className="toc-title">ON THIS PAGE</h4>
            <ul className="toc-list">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={`toc-item ${heading.level === 3 ? 'toc-subitem' : ''}`}
                    >
                        <a
                            href={`#${heading.id}`}
                            className={`toc-link ${activeId === heading.id ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(heading.id)?.scrollIntoView({
                                    behavior: 'smooth',
                                });
                            }}
                        >
                            {activeId === heading.id && (
                                <motion.span
                                    layoutId="toc-indicator"
                                    className="toc-indicator"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
