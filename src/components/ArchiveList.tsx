'use client';

import { PostData } from '@/lib/markdown';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

function formatFullDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default function ArchiveList({ posts }: { posts: Omit<PostData, 'content'>[] }) {
    // Fade-in animation for the list container
    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            className="archive-list"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {posts.map((post) => (
                <motion.div key={post.slug} variants={item} className="list-item-wrapper">
                    <Link href={`/blog/${post.slug}`} className="list-item">
                        <div className="list-date">
                            <span style={{ display: 'block' }}>{formatFullDate(post.date)}</span>
                            <span style={{
                                display: 'block',
                                marginTop: '0.4rem',
                                fontSize: '0.85rem',
                                color: '#d97706',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {post.readingTime}
                            </span>
                        </div>
                        <div className="list-content">
                            <div className="list-header">
                                <h3>{post.title}</h3>
                                <div className="tags">
                                    {post.tags.map((tag) => (
                                        <span key={tag} className="tag">{tag.toUpperCase()}</span>
                                    ))}
                                </div>
                            </div>
                            <p>{post.excerpt}</p>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
