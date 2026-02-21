import ProjectsGrid from '@/components/ProjectsGrid';

export const metadata = {
    title: 'Projects | Jesus Blog',
    description: 'A collection of my work, side projects, and open-source contributions.',
};

export default function ProjectsPage() {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
            <div className="post-header" style={{ marginBottom: '4rem', textAlign: 'left' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Portfolio
                </span>
                <h1 style={{ fontSize: '3.5rem', marginTop: '0.5rem', marginBottom: '1rem', letterSpacing: '-1px' }}>
                    Projects
                </h1>
                <p className="meta" style={{ textAlign: 'left', justifyContent: 'flex-start', maxWidth: '600px' }}>
                    A collection of technical tools, full-stack applications, and open-source contributions. Built with a heavy focus on performance and minimal aesthetics.
                </p>
            </div>

            <ProjectsGrid />
        </div>
    );
}
