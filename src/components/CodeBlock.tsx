'use client';

import { useState, useRef } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CodeBlock({ children, className }: any) {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLPreElement>(null);

    // Extract the language from the className (e.g., "language-python")
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    const handleCopy = async () => {
        if (codeRef.current) {
            const text = codeRef.current.textContent || '';
            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text', err);
            }
        }
    };

    return (
        <div className="code-block-container">
            <div className="code-block-header">
                <div className="code-block-mac-dots">
                    <div className="mac-dot close" />
                    <div className="mac-dot minimize" />
                    <div className="mac-dot maximize" />
                </div>

                <div className="code-block-language">
                    {language}
                </div>

                <button
                    onClick={handleCopy}
                    className="code-block-copy"
                    aria-label="Copy code"
                    title="Copy code"
                >
                    {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                </button>
            </div>

            <pre className={className} ref={codeRef}>
                <code>{children}</code>
            </pre>

            {/* Global Fixed Toast for Copy Status */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            background: 'var(--accent-color)',
                            color: '#fff',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '50px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <Check size={16} />
                        Copied to clipboard
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
