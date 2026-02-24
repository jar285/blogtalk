'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, Copy, WrapText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLLAPSE_THRESHOLD = 500; // px — blocks taller than this collapse by default

export default function CodeBlock({ children, className }: any) {
    const [copied, setCopied] = useState(false);
    const [wrapped, setWrapped] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [isCollapsible, setIsCollapsible] = useState(false);
    const codeRef = useRef<HTMLPreElement>(null);
    const preWrapperRef = useRef<HTMLDivElement>(null);

    // Extract the language from the className (e.g., "language-python")
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    // Measure the code block height after mount to decide if it should be collapsible
    useEffect(() => {
        if (preWrapperRef.current) {
            const scrollHeight = preWrapperRef.current.scrollHeight;
            if (scrollHeight > COLLAPSE_THRESHOLD) {
                setIsCollapsible(true);
                setCollapsed(true);
            }
        }
    }, []);

    const handleCopy = useCallback(async () => {
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
    }, []);

    const toggleWrap = useCallback(() => setWrapped(w => !w), []);
    const toggleCollapse = useCallback(() => setCollapsed(c => !c), []);

    return (
        <div className={`code-block-container${collapsed ? ' code-block-collapsed' : ''}`}>
            <div className="code-block-header">
                <div className="code-block-mac-dots">
                    <div className="mac-dot close" />
                    <div className="mac-dot minimize" />
                    <div className="mac-dot maximize" />
                </div>

                <div className="code-block-language">
                    {language}
                </div>

                <div className="code-block-actions">
                    <button
                        onClick={toggleWrap}
                        className={`code-block-btn${wrapped ? ' active' : ''}`}
                        aria-label={wrapped ? 'Disable word wrap' : 'Enable word wrap'}
                        title={wrapped ? 'Unwrap lines' : 'Wrap lines'}
                    >
                        <WrapText size={14} />
                    </button>

                    <button
                        onClick={handleCopy}
                        className="code-block-btn"
                        aria-label="Copy code"
                        title="Copy code"
                    >
                        {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>

            <div
                ref={preWrapperRef}
                className={`code-block-body${wrapped ? ' code-wrapped' : ''}`}
            >
                <pre className={className} ref={codeRef}>
                    <code>{children}</code>
                </pre>
            </div>

            {isCollapsible && (
                <button
                    className="code-block-expander"
                    onClick={toggleCollapse}
                    aria-label={collapsed ? 'Expand code block' : 'Collapse code block'}
                >
                    {collapsed ? (
                        <>
                            <ChevronDown size={14} />
                            <span>Show more</span>
                        </>
                    ) : (
                        <>
                            <ChevronUp size={14} />
                            <span>Show less</span>
                        </>
                    )}
                </button>
            )}

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
