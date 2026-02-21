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
        title: "MCP-Discord",
        description: "A Model Context Protocol server that gives AI agents like Claude full control over Discord — send messages, manage channels, create forum posts, handle reactions, and orchestrate webhooks.",
        tech: ["Node.js", "MCP", "Discord.js", "TypeScript"],
        github: "https://github.com/jar285/mcp-discord",
    },
    {
        title: "Campus Companion",
        description: "A mobile-first campus navigation and student companion app designed in Figma. Features real-time maps, event discovery, course scheduling, and a clean, accessible UI system.",
        tech: ["Figma", "UI/UX", "Prototyping", "Mobile Design"],
        link: "https://www.figma.com/proto/vIh7oksGDMljicrzth29bm/Campus-Companion?node-id=22007-238662&p=f&t=mOVZAisodN61SaMC-0&scaling=min-zoom&content-scaling=fixed&page-id=21911%3A234988&starting-point-node-id=22007%3A238662&show-proto-sidebar=1",
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
