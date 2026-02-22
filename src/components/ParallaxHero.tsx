'use client';

import { useRef, Children } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface ParallaxHeroProps {
    children: React.ReactNode;
}

export default function ParallaxHero({ children }: ParallaxHeroProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const prefersReducedMotion = useReducedMotion();

    // Different parallax speeds for each layer (slower = feels farther)
    // If reduced motion is preferred, lock speeds to 0 to prevent displacement
    const speeds = prefersReducedMotion ? [0, 0, 0] : [-100, -50, -30];
    const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
    // Lock scale effect if reduced motion is preferred
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 0.96]);

    const childArray = Children.toArray(children);

    return (
        <motion.section
            ref={ref}
            className="hero"
            style={{ opacity: heroOpacity, scale: heroScale }}
        >
            {childArray.map((child, i) => {
                const speed = speeds[i] ?? -20;
                return (
                    <ParallaxLayer key={i} scrollYProgress={scrollYProgress} speed={speed}>
                        {child}
                    </ParallaxLayer>
                );
            })}
        </motion.section>
    );
}

function ParallaxLayer({
    children,
    scrollYProgress,
    speed,
}: {
    children: React.ReactNode;
    scrollYProgress: any;
    speed: number;
}) {
    const y = useTransform(scrollYProgress, [0, 1], [0, speed]);

    return (
        <motion.div style={{ y }}>
            {children}
        </motion.div>
    );
}
