'use client';

import { useRef, Children } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

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

    // Dynamic variable font weight for the title (300 → 800)
    // As you scroll down (0 to 0.4 progress), font weight increases
    const titleWeight = useTransform(scrollYProgress, [0, 0.4], [300, 800]);

    const childArray = Children.toArray(children);

    return (
        <motion.section
            ref={ref}
            className="hero"
            style={{ opacity: heroOpacity, scale: heroScale }}
        >
            {childArray.map((child, i) => {
                const speed = speeds[i] ?? -20;
                const isTitle = i === 0;
                return (
                    <ParallaxLayer
                        key={i}
                        scrollYProgress={scrollYProgress}
                        speed={speed}
                        fontWeight={isTitle ? titleWeight : undefined}
                    >
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
    fontWeight,
}: {
    children: React.ReactNode;
    scrollYProgress: any;
    speed: number;
    fontWeight?: MotionValue<number>;
}) {
    const y = useTransform(scrollYProgress, [0, 1], [0, speed]);

    return (
        <motion.div style={{ y, fontWeight }}>
            {children}
        </motion.div>
    );
}
