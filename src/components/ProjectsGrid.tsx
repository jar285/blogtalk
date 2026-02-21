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
        title: "AI Consultant Portfolio",
        description: "A YAML-driven static site generator for AI consultants. Edit your site with natural language via browser or CLI, preview locally, and deploy to GitHub Pages. Built with Clean Architecture and TDD.",
        tech: ["TypeScript", "HTML", "CSS", "YAML", "GitHub Pages"],
        github: "https://github.com/jar285/consultant",
        featured: true,
    },
    {
        title: "Research Toolkit",
        description: "An autonomous research CLI for AI agents. Perform deep web research queries, generate onboarding docs, and maintain a structured knowledge library — all from the terminal. Built with Clean Architecture and strict dependency inversion.",
        tech: ["Python", "Typer", "OpenAI", "DuckDuckGo"],
        github: "https://github.com/jar285/ai-toolkit",
    },
    {
        title: "JRcalculator",
        description: "A native iOS/macOS calculator app built with SwiftUI. Features memory functions, calculation history with sidebar/sheet UI, spring-animated button presses, and full VoiceOver accessibility.",
        tech: ["Swift", "SwiftUI", "XCTest"],
        github: "https://github.com/jar285/IS322-SwiftCalculator",
    },
    {
        title: "AI Portfolio Monorepo",
        description: "A full-stack portfolio monorepo powered by Next.js 14 App Router, Prisma, and OpenAI. Includes a shared design system, RAG utilities, moderation filters, and Supabase Auth.",
        tech: ["Next.js", "Prisma", "OpenAI", "Supabase", "Tailwind"],
        link: "https://portfolio-web-neon-pi.vercel.app",
        github: "https://github.com/jar285/portfolio",
    },
    {
        title: "FastMCP",
        description: "The fast, Pythonic way to build MCP (Model Context Protocol) servers and clients. Supports tool registration, resource templates, proxy servers, and OpenAPI/FastAPI generation.",
        tech: ["Python", "MCP", "FastAPI"],
        github: "https://github.com/jar285/fastmcp",
    },
    {
        title: "Discord Bartender Bot",
        description: "A Discord bot with slash commands for interacting with a virtual AI bartender. Powered by ChatGPT with scalable Kafka message processing and FastAPI backend.",
        tech: ["Python", "Discord.py", "OpenAI", "Kafka", "FastAPI"],
        github: "https://github.com/jar285/discord-bot",
    },
    {
        title: "Jesus Blog",
        description: "This very site — a radically fast, premium Next.js markdown blog with a ⌘K command palette, dynamic mouse-tracking background, scrollspy TOC, and interactive code blocks.",
        tech: ["Next.js", "React", "Framer Motion", "Markdown"],
        link: "https://jar285.github.io/blogtalk",
        github: "https://github.com/jar285/blogtalk",
    },
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
