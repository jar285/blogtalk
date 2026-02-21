'use client';

import { motion, Variants } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

interface Project {
    title: string;
    description: string;
    tech: string[];
    link?: string;
    github?: string;
    featured?: boolean;
}

const projects: Project[] = [
    {
        title: "Jesus Blog",
        description: "A radically fast, intensely premium Next.js markdown blog. Features a globally accessible Command Palette, a dynamic physics-based background, scrollspy TOC, and interactive code blocks.",
        tech: ["Next.js 15", "React", "Framer Motion", "Markdown"],
        link: "https://jar285.github.io/blogtalk",
        github: "https://github.com/jar285/blogtalk",
        featured: true // Takes up full width in grid
    },
    {
        title: "Echo AI",
        description: "A local, private inference bridge linking macOS system audio to offline LLMs like LLaMA 3. Designed for privacy-first developers.",
        tech: ["Python", "Ollama", "Whisper", "Swift"],
        github: "https://github.com/example/echo-ai",
    },
    {
        title: "Geometric Logic",
        description: "A minimalist path-finding algorithm visualizer inspired by Bauhaus design principles. Built strictly with HTML Canvas.",
        tech: ["TypeScript", "Canvas API", "CSS"],
        link: "#",
    },
    {
        title: "Terminal Fetch",
        description: "A highly customizable system fetching tool for Unix-like operating systems. Written in pure Rust for sub-millisecond execution times.",
        tech: ["Rust", "Bash"],
        github: "#",
    }
];

export default function ProjectsGrid() {
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
        >
            {projects.map((project, index) => (
                <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`bento-card ${project.featured ? 'featured' : ''}`}
                    whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                >
                    <div className="bento-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>

                        <div className="bento-tech">
                            {project.tech.map((t) => (
                                <span key={t} className="tech-badge">{t}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bento-links">
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="bento-link">
                                <Github size={18} />
                                <span>Source</span>
                            </a>
                        )}
                        {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="bento-link">
                                <ExternalLink size={18} />
                                <span>Visit</span>
                            </a>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
