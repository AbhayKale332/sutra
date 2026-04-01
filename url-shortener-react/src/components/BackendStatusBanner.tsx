import React from 'react';
import { useBackendStatus } from '@/context/BackendStatusContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

const BackendStatusBanner = () => {
    const { status } = useBackendStatus();

    return (
        <AnimatePresence>
            {status === 'offline' && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-xl"
                >
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 shadow-2xl shadow-amber-500/10 rounded-2xl p-4 flex items-start gap-4">
                        <div className="bg-amber-500/20 p-2 rounded-xl text-amber-600 shrink-0">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                                Backend Warming Up <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Our Render backend is currently waking up from sleep. This usually takes <strong>1-2 minutes</strong>. Thank you for being so patient! 
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BackendStatusBanner;
