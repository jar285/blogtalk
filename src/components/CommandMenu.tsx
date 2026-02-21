'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Home, FolderOpen, TerminalSquare } from 'lucide-react';
import { PostData } from '@/lib/markdown';

export default function CommandMenu({ posts }: { posts: Omit<PostData, 'content'>[] }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

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
                        className="cmdk-dialog"
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
                        </Command>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
