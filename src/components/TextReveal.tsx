'use client';

import { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface TextRevealProps {
    children: string;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
    className?: string;
    style?: React.CSSProperties;
    delay?: number;       // seconds before animation starts
    stagger?: number;     // seconds between each word
    once?: boolean;       // animate only once (default true)
}

export default function TextReveal({
    children,
    as: Tag = 'h1',
    className,
    style,
    delay = 0,
    stagger = 0.04,
    once = true,
}: TextRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: '-10% 0px' });

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: stagger,
                delayChildren: delay,
            },
        },
    };

    const wordVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            filter: 'blur(4px)',
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 0.5,
                ease: [0.25, 0.4, 0.25, 1],
            },
        },
    };

    const words = children.split(' ');

    return (
        <Tag className={className} style={{ ...style, overflow: 'hidden' }} ref={ref}>
            <motion.span
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.3em' }}
            >
                {words.map((word, i) => (
                    <motion.span
                        key={i}
                        variants={wordVariants}
                        style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.span>
        </Tag>
    );
}
