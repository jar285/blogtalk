'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LayoutGroup } from 'framer-motion';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <LayoutGroup>
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                    transition={{
                        duration: 0.35,
                        ease: [0.25, 0.4, 0.25, 1],
                    }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </LayoutGroup>
    );
}
