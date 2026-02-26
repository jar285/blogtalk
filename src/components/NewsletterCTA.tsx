'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterCTA() {
    const [state, setState] = useState<FormState>('idle');
    const [email, setEmail] = useState('');

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (state === 'loading' || state === 'success') return;

        setState('loading');

        // Simulate a 1-second network delay
        await new Promise((r) => setTimeout(r, 1000));

        // Mock success — swap for real API later
        setState('success');
    }, [state]);

    return (
        <motion.div
            className="newsletter-cta glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        >
            <AnimatePresence mode="wait">
                {state === 'success' ? (
                    <motion.div
                        key="success"
                        className="newsletter-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CheckCircle size={36} className="newsletter-success-icon" />
                        <h3 className="newsletter-heading">
                            Thanks for subscribing!
                        </h3>
                        <p className="newsletter-desc">
                            You&rsquo;ll hear from me when the next essay drops. No spam, ever.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="newsletter-heading">
                            Enjoyed this post?
                        </h3>
                        <p className="newsletter-desc">
                            I occasionally send out essays on software design, performance, and the aesthetics of code. No spam, ever.
                        </p>

                        <form
                            className="newsletter-form"
                            onSubmit={handleSubmit}
                        >
                            <label htmlFor="newsletter-email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="newsletter-email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={state === 'loading'}
                                className="newsletter-input"
                                autoComplete="email"
                            />
                            <button
                                type="submit"
                                disabled={state === 'loading'}
                                className={`newsletter-btn${state === 'loading' ? ' newsletter-btn-loading' : ''}`}
                            >
                                {state === 'loading' ? (
                                    <>
                                        <Loader2 size={16} className="newsletter-spinner" />
                                        Subscribing…
                                    </>
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        </form>

                        {state === 'error' && (
                            <p className="newsletter-error" role="alert">
                                Something went wrong. Please try again.
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
