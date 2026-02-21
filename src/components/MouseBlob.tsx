'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function MouseBlob() {
    const [mounted, setMounted] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out the movement
    const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        setMounted(true);

        const handleMouseMove = (e: MouseEvent) => {
            // Center the blob on the cursor (-300px because the blob is 600x600)
            mouseX.set(e.clientX - 300);
            mouseY.set(e.clientY - 300);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseX, mouseY]);

    if (!mounted) return null;

    return (
        <motion.div
            style={{
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                position: 'fixed',
                left: smoothX,
                top: smoothY,
                pointerEvents: 'none',
                zIndex: -1,
                filter: 'blur(50px)',
                opacity: 0.6,
            }}
        />
    );
}
