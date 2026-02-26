'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Github, Instagram, Linkedin, Mail } from 'lucide-react';

interface PostData {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    readingTime?: string;
}

interface BentoHomepageProps {
    latestPost: PostData;
}

export default function BentoHomepage({ latestPost }: BentoHomepageProps) {
    const router = useRouter();
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.5 } },
    };

    return (
        <motion.div
            className="bento-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-7)' }}
        >
            {/* Latest Post - spans full width on desktop */}
            <motion.div
                variants={itemVariants}
                className="bento-card featured"
                whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            >
                <Link href={`/blog/${latestPost.slug}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}>
                    <div className="bento-content" style={{ flex: 1 }}>
                        <span style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>
                            Latest Essay
                        </span>
                        <h3>{latestPost.title}</h3>
                        <p>{latestPost.excerpt}</p>
                        <div className="bento-tech">
                            {latestPost.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="tech-badge tag-link"
                                    role="link"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/tags/${tag.toLowerCase()}`);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.push(`/tags/${tag.toLowerCase()}`);
                                        }
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="bento-links" style={{ justifyContent: 'space-between' }}>
                        <span className="date" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{latestPost.date}</span>
                        <span className="bento-link" style={{ gap: '0.3rem' }}>
                            Read <ArrowRight size={16} />
                        </span>
                    </div>
                </Link>
            </motion.div>

            {/* Currently Building */}
            <motion.div
                variants={itemVariants}
                className="bento-card"
                whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            >
                <div className="bento-content">
                    <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>👨‍💻</span>
                    <h3 style={{ fontSize: '1.25rem' }}>Currently Building</h3>
                    <p style={{ fontSize: '0.95rem' }}>
                        I&apos;m focused on AI agents and model context protocol servers, trying to make autonomous research tools feel like magic.
                    </p>
                </div>
            </motion.div>

            {/* Social Links & Contact */}
            <motion.div
                variants={itemVariants}
                className="bento-card"
                style={{ justifyContent: 'center' }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            >
                <div className="bento-content" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Let&apos;s Connect</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <a href="https://github.com/jar285" target="_blank" rel="noopener noreferrer" className="bento-link" style={{ color: 'var(--text-primary)' }}>
                            <Github size={24} />
                        </a>
                        <a href="https://www.instagram.com/jesus_rosarioav/" target="_blank" rel="noopener noreferrer" className="bento-link" style={{ color: 'var(--text-primary)' }}>
                            <Instagram size={24} />
                        </a>
                        <a href="https://www.linkedin.com/in/jesus-adonis-rosario-vargas-371508255" target="_blank" rel="noopener noreferrer" className="bento-link" style={{ color: 'var(--text-primary)' }}>
                            <Linkedin size={24} />
                        </a>
                        <a href="mailto:jar285@njit.edu" className="bento-link" style={{ color: 'var(--text-primary)' }}>
                            <Mail size={24} />
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
