import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2 } from 'lucide-react';
import './RenderSplashScreen.css';

interface RenderSplashScreenProps {
  status: 'checking' | 'online' | 'offline';
  children: React.ReactNode;
}

/**
 * Cold starts on Render's free tier land around 30–60s, so progress is modelled
 * as an exponential ease toward a 94% ceiling: it always moves forward, never
 * stalls at a round number, and never claims to be done before the server says so.
 */
const PROGRESS_CEILING = 94;
const PROGRESS_TAU = 20; // seconds — controls how quickly the curve flattens

const progressFor = (seconds: number) =>
  PROGRESS_CEILING * (1 - Math.exp(-seconds / PROGRESS_TAU));

/** Status copy that advances with elapsed time, so the screen never feels stuck. */
const stages = [
  { after: 0, label: 'Contacting the server' },
  { after: 4, label: 'Server is asleep — waking it up' },
  { after: 14, label: 'Starting the backend instance' },
  { after: 32, label: 'Almost there — finishing boot' },
  { after: 70, label: 'Taking longer than usual — hang tight' },
];

const tips = [
  'Free-tier servers sleep after 15 minutes of inactivity.',
  'Cold starts usually take about 30–60 seconds.',
  'Your links are safe — data is persisted in the cloud.',
  'Bookmark your dashboard for one-tap access.',
  'This only happens on the first visit after a nap.',
];

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const RenderSplashScreen: React.FC<RenderSplashScreenProps> = ({ status, children }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const isOnline = status === 'online';

  // Single high-resolution clock drives the timer, the progress curve and the stage copy.
  useEffect(() => {
    if (!showSplash || isOnline) return;
    const startedAt = performance.now();
    const interval = setInterval(() => {
      setElapsedMs(performance.now() - startedAt);
    }, 100);
    return () => clearInterval(interval);
  }, [showSplash, isOnline]);

  useEffect(() => {
    if (!showSplash || isOnline) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [showSplash, isOnline]);

  // Lock page scroll while the overlay covers the (still hidden) app content.
  useEffect(() => {
    if (!showSplash) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showSplash]);

  // Let the completed ring and checkmark land before handing over to the app.
  useEffect(() => {
    if (!isOnline) return;
    const timeout = setTimeout(() => setShowSplash(false), 1900);
    return () => clearTimeout(timeout);
  }, [isOnline]);

  const elapsedSeconds = elapsedMs / 1000;
  const progress = isOnline ? 100 : progressFor(elapsedSeconds);

  const stageLabel = useMemo(() => {
    if (isOnline) return 'Connected — launching app';
    return stages.reduce((current, stage) =>
      elapsedSeconds >= stage.after ? stage : current
    ).label;
  }, [elapsedSeconds, isOnline]);

  const formatTime = (s: number) => {
    const total = Math.floor(s);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return mins > 0 ? `${mins}m ${secs.toString().padStart(2, '0')}s` : `${secs}s`;
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            className={`splash-overlay ${isOnline ? 'is-online' : ''}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* CSS-only aurora backdrop — no per-particle JS animation loops */}
            <div className="splash-aurora" aria-hidden="true">
              <span className="splash-aurora-blob splash-aurora-blob--violet" />
              <span className="splash-aurora-blob splash-aurora-blob--blue" />
            </div>
            <div className="splash-grid" aria-hidden="true" />

            <div
              className="splash-content"
              role="status"
              aria-live="polite"
              aria-busy={!isOnline}
            >
              <div className="splash-ring-stack">
                {/* Slow orbital sweep, purely decorative */}
                <div className="splash-orbit" aria-hidden="true">
                  <span className="splash-orbit-dot" />
                </div>

                <svg className="splash-ring" viewBox="0 0 128 128" aria-hidden="true">
                  <circle
                    className="splash-ring-track"
                    cx="64"
                    cy="64"
                    r={RING_RADIUS}
                    fill="none"
                  />
                  <circle
                    className="splash-ring-progress"
                    cx="64"
                    cy="64"
                    r={RING_RADIUS}
                    fill="none"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
                  />
                </svg>

                <div className="splash-ring-core">
                  <AnimatePresence initial={false}>
                    {isOnline ? (
                      <motion.svg
                        key="check"
                        className="splash-check"
                        viewBox="0 0 32 32"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      >
                        <path
                          className="splash-check-path"
                          fill="none"
                          d="M8 17l5.5 5.5L24 11"
                        />
                      </motion.svg>
                    ) : (
                      <motion.span
                        key="link"
                        className="splash-link-icon"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link2 size={28} className="-rotate-45" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <h1 className="splash-brand">Sutra</h1>

              <div className="splash-status-row">
                <AnimatePresence initial={false}>
                  <motion.p
                    key={stageLabel}
                    className="splash-status"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {stageLabel}
                    {!isOnline && <span className="splash-ellipsis" aria-hidden="true" />}
                  </motion.p>
                </AnimatePresence>
              </div>

              <p className="splash-meta">
                <span className="splash-meta-pct">{Math.round(progress)}%</span>
                <span className="splash-meta-sep" />
                <span className="splash-meta-time">{formatTime(elapsedSeconds)}</span>
              </p>

              <div className="splash-tip-container">
                <AnimatePresence mode="wait" initial={false}>
                  {!isOnline && (
                    <motion.p
                      key={tipIndex}
                      className="splash-tip"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      {tips[tipIndex]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="splash-footer">
              <span className="splash-footer-text">Hosted on Render · Free Tier</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ visibility: showSplash ? 'hidden' : 'visible' }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default RenderSplashScreen;
