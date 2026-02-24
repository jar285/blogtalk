'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, FileText, Home, FolderOpen, TerminalSquare,
    Sun, Moon, Link2, Mail
} from 'lucide-react';
import { PostData } from '@/lib/markdown';

export default function CommandMenu({ posts }: { posts: Omit<PostData, 'content'>[] }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const dialogRef = useRef<HTMLDivElement>(null);

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [open]);

    // Focus trap — keep Tab cycling inside the dialog
    useEffect(() => {
        if (!open || !dialogRef.current) return;

        const trap = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusable = dialogRef.current!.querySelectorAll<HTMLElement>(
                'input, button, [tabindex]:not([tabindex="-1"]), [cmdk-item]'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', trap);
        return () => document.removeEventListener('keydown', trap);
    }, [open]);

    const runCommand = useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    // --- Action handlers ---
    const toggleTheme = useCallback(() => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    }, []);

    const copyPageLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch { /* fallback: do nothing */ }
    }, []);

    const scrollToNewsletter = useCallback(() => {
        const el = document.querySelector('.newsletter-cta');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    const isDark = typeof document !== 'undefined'
        ? (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark'
        : true;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="cmdk-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        ref={dialogRef}
                        className="cmdk-dialog"
                        role="dialog"
                        aria-label="Command palette"
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Command label="Global Command Menu">
                            <div className="cmdk-header">
                                <Search size={18} className="cmdk-search-icon" />
                                <Command.Input placeholder="Type a command or search..." />
                            </div>
                            <Command.List>
                                <Command.Empty>No results found.</Command.Empty>

                                <Command.Group heading="Actions">
                                    <Command.Item onSelect={() => runCommand(toggleTheme)}>
                                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                                        Toggle Theme
                                        <span className="cmdk-item-badge">
                                            {isDark ? 'Light' : 'Dark'}
                                        </span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(copyPageLink)}>
                                        <Link2 size={16} />
                                        Copy Page Link
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(scrollToNewsletter)}>
                                        <Mail size={16} />
                                        Jump to Newsletter
                                    </Command.Item>
                                </Command.Group>

                                <Command.Group heading="Navigation">
                                    <Command.Item onSelect={() => runCommand(() => router.push('/'))}>
                                        <Home size={16} />
                                        Home
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/blog'))}>
                                        <FileText size={16} />
                                        All Articles
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => router.push('/projects'))}>
                                        <FolderOpen size={16} />
                                        Projects
                                    </Command.Item>
                                </Command.Group>

                                {posts.length > 0 && (
                                    <Command.Group heading="Essays">
                                        {posts.map((post) => (
                                            <Command.Item
                                                key={post.slug}
                                                onSelect={() => runCommand(() => router.push(`/blog/${post.slug}`))}
                                            >
                                                <TerminalSquare size={16} />
                                                {post.title}
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                )}
                            </Command.List>

                            <div className="cmdk-footer">
                                <span className="cmdk-hint">
                                    <kbd>↑↓</kbd> navigate
                                </span>
                                <span className="cmdk-hint">
                                    <kbd>↵</kbd> select
                                </span>
                                <span className="cmdk-hint">
                                    <kbd>esc</kbd> close
                                </span>
                            </div>
                        </Command>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
