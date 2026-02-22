'use client';

import React, { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';

interface CopyableHeadingProps {
    level: 2 | 3 | 4 | 5 | 6;
    id?: string;
    children?: React.ReactNode;
}

export default function CopyableHeading({ level, id, children }: CopyableHeadingProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!id) return;
        const url = new URL(window.location.href);
        url.hash = id;
        navigator.clipboard.writeText(url.toString());

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const content = (
        <>
            {children}
            {id && (
                <button
                    onClick={handleCopy}
                    className="heading-anchor"
                    aria-label="Link to this section"
                    title="Copy link to clipboard"
                >
                    {copied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} />}
                </button>
            )}
        </>
    );

    const className = "copyable-heading flex items-center relative";

    switch (level) {
        case 3: return <h3 id={id} className={className}>{content}</h3>;
        case 4: return <h4 id={id} className={className}>{content}</h4>;
        case 5: return <h5 id={id} className={className}>{content}</h5>;
        case 6: return <h6 id={id} className={className}>{content}</h6>;
        case 2:
        default:
            return <h2 id={id} className={className}>{content}</h2>;
    }
}
