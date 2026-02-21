'use client';

import { useRef, Children } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxHeroProps {
    children: React.ReactNode;
}

export default function ParallaxHero({ children }: ParallaxHeroProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    // Different parallax speeds for each layer (slower = feels farther)
    const speeds = [-100, -50, -30]; // pixels of offset at full scroll
    const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

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
