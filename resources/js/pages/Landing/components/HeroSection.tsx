import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkle, Terminal, ShieldCheck } from '@phosphor-icons/react';
import { motion, type Variants } from 'framer-motion';

export function HeroSection() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 16 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    return (
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
            {/* Background Decorative Warm Accent Gradients */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#d88f6d] to-[#c47b59] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
            >
                {/* Badge */}
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-xs backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-[#d88f6d]" />
                    <span>The Academic Craftsman IDE</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Zero-latency LaTeX</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="mt-6 font-serif text-5xl tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
                >
                    Craft scientific papers with{' '}
                    <span className="italic text-[#d88f6d] underline decoration-border/40 underline-offset-8">
                        unrivaled elegance.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl font-normal"
                >
                    A local-first, distraction-free environment uniting raw Monaco code editing, visual split view, multi-engine compilation, and bidirectional SyncTeX precision.
                </motion.p>

                {/* Actions */}
                <motion.div
                    variants={itemVariants}
                    className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <Link
                        href="/register"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d88f6d] px-6 text-base font-medium text-white shadow-md transition-all hover:bg-[#c47b59] hover:shadow-lg active:scale-[0.98] sm:w-auto"
                    >
                        <span>Start Writing Free</span>
                        <ArrowRight size={18} weight="bold" />
                    </Link>
                    <a
                        href="#features"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-6 text-base font-medium text-foreground shadow-xs backdrop-blur-sm transition-all hover:bg-accent/40 sm:w-auto"
                    >
                        <span>Explore Capabilities</span>
                    </a>
                </motion.div>

                {/* Value Micro-Pills */}
                <motion.div
                    variants={itemVariants}
                    className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
                >
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck size={16} weight="duotone" className="text-[#d88f6d]" />
                        <span>100% Local-First Storage</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Terminal size={16} weight="duotone" className="text-[#d88f6d]" />
                        <span>pdfLaTeX • XeLaTeX • LuaLaTeX</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Sparkle size={16} weight="duotone" className="text-[#d88f6d]" />
                        <span>Sub-second SyncTeX</span>
                    </div>
                </motion.div>

                {/* Preview Window Card */}
                <motion.div
                    variants={itemVariants}
                    className="mt-14 rounded-2xl border border-border/70 bg-card/80 p-2 shadow-2xl backdrop-blur-md transition-all sm:p-4"
                >
                    <div className="overflow-hidden rounded-xl border border-border/60 bg-[#1e1e1e] text-left font-mono text-xs shadow-inner">
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between border-b border-[#2e2e2e] bg-[#252526] px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                                <span className="ml-2 font-sans text-xs text-zinc-400">main.tex — paperForge</span>
                            </div>
                            <span className="rounded bg-[#333] px-2 py-0.5 text-[10px] text-zinc-300">XeLaTeX 3.14</span>
                        </div>
                        {/* Code snippet display */}
                        <div className="p-4 leading-relaxed text-zinc-300 sm:p-6">
                            <p><span className="text-[#569cd6]">\documentclass</span><span className="text-[#dcdcaa]">&#123;</span>article<span className="text-[#dcdcaa]">&#125;</span></p>
                            <p><span className="text-[#569cd6]">\usepackage</span><span className="text-[#dcdcaa]">&#123;</span>fontspec, amsmath, hyperref<span className="text-[#dcdcaa]">&#125;</span></p>
                            <p className="text-zinc-500">% Editorial Craftsman Precision Compilation</p>
                            <p><span className="text-[#569cd6]">\title</span><span className="text-[#ce9178]">&#123;Neural Architectures for High-Fidelity Scientific Typography&#125;</span></p>
                            <p><span className="text-[#569cd6]">\author</span><span className="text-[#ce9178]">&#123;Paperforge Collaborative Guild&#125;</span></p>
                            <p><span className="text-[#569cd6]">\begin</span><span className="text-[#dcdcaa]">&#123;document&#125;</span></p>
                            <p className="pl-4"><span className="text-[#569cd6]">\maketitle</span></p>
                            <p className="pl-4 text-emerald-400">\textbf&#123;Abstract:&#125; \textit&#123;Real-time bidirectional synchronization elevates the scholarly writing experience to an artisanal craft...&#125;</p>
                            <p><span className="text-[#569cd6]">\end</span><span className="text-[#dcdcaa]">&#123;document&#125;</span></p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
