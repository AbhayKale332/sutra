import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RenderSplashScreen.css';

interface RenderSplashScreenProps {
  status: 'checking' | 'online' | 'offline';
  children: React.ReactNode;
}

const tips = [
  "Free-tier servers sleep after 15 min of inactivity…",
  "Cold starts usually take about 30–60 seconds.",
  "Your links are safe — data is persisted in the cloud.",
  "Tip: Bookmark your dashboard for quick access!",
  "Almost there… the server is compiling and booting.",
];

const RenderSplashScreen: React.FC<RenderSplashScreenProps> = ({ status, children }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Cycle tips every 5 seconds
  useEffect(() => {
    if (!showSplash) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showSplash]);

  // Animate dots
  useEffect(() => {
    if (!showSplash) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [showSplash]);

  // Elapsed timer
  useEffect(() => {
    if (!showSplash) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showSplash]);

  // When status goes online, wait a beat then dismiss
  useEffect(() => {
    if (status === 'online') {
      const timeout = setTimeout(() => setShowSplash(false), 1400);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}m ${secs.toString().padStart(2, '0')}s` : `${secs}s`;
  };

  const isOnline = status === 'online';

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="splash-overlay"
          >
            {/* Floating particles */}
            <div className="splash-particles">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="splash-particle"
                  style={{
                    width: `${Math.random() * 3 + 2}px`,
                    height: `${Math.random() * 3 + 2}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.1 + Math.random() * 0.2,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.1, 0.4, 0.1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Main content container */}
            <div className="splash-content">

              {/* Hypnotic checkerboard loader */}
              <motion.div
                className="splash-loader-wrapper"
                animate={isOnline ? { scale: [1, 0], opacity: [1, 0] } : {}}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className={`loader ${isOnline ? 'loader--done' : ''}`} />
              </motion.div>

              {/* Brand */}
              <motion.h1
                className="splash-brand"
                style={{
                  background: isOnline
                    ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                    : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={isOnline ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {isOnline ? '✓ Connected!' : 'Sutra'}
              </motion.h1>

              {/* Status text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={status}
                  className="splash-status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {isOnline
                    ? 'Server is ready — launching app…'
                    : status === 'checking'
                      ? 'Connecting to server…'
                      : `Waking up Render server${dots}`}
                </motion.p>
              </AnimatePresence>

              {/* Progress bar */}
              <div className={`splash-progress-track ${isOnline ? 'splash-progress-track--done' : ''}`}>
                {isOnline ? (
                  <motion.div
                    className="splash-progress-bar splash-progress-bar--done"
                    initial={{ width: '50%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                ) : (
                  <motion.div
                    className="splash-progress-bar splash-progress-bar--loading"
                    animate={{
                      backgroundPosition: ['0% 0%', '200% 0%'],
                      width: ['15%', '85%', '35%', '65%', '50%'],
                    }}
                    transition={{
                      backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
                      width: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  />
                )}
              </div>

              {/* Timer + tip (only when not online) */}
              {!isOnline && (
                <>
                  <p className="splash-timer">
                    Elapsed: {formatTime(elapsedSeconds)}
                  </p>

                  <div className="splash-tip-container">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={tipIndex}
                        className="splash-tip"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35 }}
                      >
                        💡 {tips[tipIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="splash-footer">
              <span className="splash-footer-text">Hosted on Render · Free Tier</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App content — hidden behind splash until ready */}
      <div style={{ visibility: showSplash ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  );
};

export default RenderSplashScreen;
