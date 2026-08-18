import { AnimatePresence, motion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

export function PageTransitionWrapper({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
