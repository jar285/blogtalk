'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CodeBlock({ children, className }: any) {
    const [copied, setCopied] = useState(false);

    // Extract the language from the className (e.g., "language-python")
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    // ReactMarkdown passes the raw text as children[0]
    const rawCode = Array.isArray(children) ? children[0] : children;

    const handleCopy = async () => {
        if (typeof rawCode === 'string') {
            await navigator.clipboard.writeText(rawCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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

            <pre className={className}>
                <code>
                    {children}
                </code>
            </pre>
        </div>
    );
}
