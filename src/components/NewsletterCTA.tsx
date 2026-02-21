'use client';

import { motion } from 'framer-motion';

export default function NewsletterCTA() {
    return (
        <motion.div
            className="newsletter-cta glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-5) var(--space-4)',
                textAlign: 'center',
                borderTop: '1px solid var(--glass-border)',
                background: 'linear-gradient(180deg, transparent 0%, rgba(20,20,20,0.3) 100%)',
            }}
        >
            <h3 style={{
                fontSize: 'var(--fs-h2)',
                fontWeight: 700,
                marginBottom: 'var(--space-2)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
            }}>
                Enjoyed this post?
            </h3>
            <p style={{
                fontSize: 'var(--fs-body)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)',
                maxWidth: '500px',
                margin: '0 auto var(--space-4)'
            }}>
                I occasionally send out essays on software design, performance, and the aesthetics of code. No spam, ever.
            </p>

            <form
                className="newsletter-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    // Future backend integration
                    alert("Thanks for subscribing! (This is a demo frontend)");
                }}
                style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    maxWidth: '400px',
                    margin: '0 auto',
                    position: 'relative'
                }}
            >
                <input
                    type="email"
                    placeholder="name@example.com"
                    required
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                />
                <button
                    type="submit"
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--text-primary)',
                        color: 'var(--bg-color)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        fontSize: '1rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Subscribe
                </button>
            </form>
        </motion.div>
    );
}
