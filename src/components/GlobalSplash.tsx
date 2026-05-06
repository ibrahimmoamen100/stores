import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

// ─── Particle helpers ─────────────────────────────────────────────────────────
function Particles({ color }: { color: string }) {
  const particles = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => {
        const size = 4 + Math.random() * 8;
        const x = Math.random() * 100;
        const delay = Math.random() * 2;
        const dur = 2.5 + Math.random() * 2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: size, height: size, left: `${x}%`, bottom: '-20px', background: color, opacity: 0.5 }}
            animate={{ y: [0, -(400 + Math.random() * 300)], opacity: [0.5, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

// ─── Wave background ──────────────────────────────────────────────────────────
function WaveBackground({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: `${35 + i * 15}%`,
            background: color,
            opacity: 0.12 + i * 0.06,
            borderRadius: '60% 60% 0 0 / 40% 40% 0 0',
          }}
          animate={{ y: [0, -14 + i * 5, 0], scaleX: [1, 1.03, 1] }}
          transition={{ duration: 3.5 + i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Neon glow ring ───────────────────────────────────────────────────────────
function NeonRing({ color }: { color: string }) {
  return (
    <>
      <motion.div
        className="absolute rounded-full border-2"
        style={{ width: 220, height: 220, borderColor: color, boxShadow: `0 0 30px ${color}88, inset 0 0 30px ${color}44` }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full border"
        style={{ width: 300, height: 300, borderColor: color, opacity: 0.3 }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const GlobalSplash = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const { settings } = useSiteSettings();
  const loading = useStore((state) => state.loading);

  const {
    splashEnabled = true,
    splashTheme = 'elegant',
    splashText = 'مع كمبيو سيف انت دايماً في الأمان',
    splashSubtext = '',
    splashShowLogo = true,
    splashLogoUrl = '',
    splashBgColor = '#ffffff',
    splashTextColor = '#1e3a8a',
    splashDuration = 2,
    logoUrl = '/logo1.png',
  } = settings;

  const logoSrc = splashLogoUrl?.trim() || logoUrl || '/logo1.png';
  const minMs = (splashDuration ?? 2) * 1000;

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), minMs);
    return () => clearTimeout(t);
  }, [minMs]);

  useEffect(() => {
    const handleReady = () => setIsAppReady(true);
    window.addEventListener('app-ready', handleReady);
    const fallback = setTimeout(() => setIsAppReady(true), 5000);
    return () => { window.removeEventListener('app-ready', handleReady); clearTimeout(fallback); };
  }, []);

  useEffect(() => {
    if (!loading && isAppReady && minTimeElapsed) {
      setTimeout(() => setShowSplash(false), 200);
    }
  }, [loading, isAppReady, minTimeElapsed]);

  if (!splashEnabled || !showSplash) return null;

  // ── Words animation ──────────────────────────────────────────────────────
  const words = splashText.trim().split(/\s+/);

  const wordContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  };

  // ── Theme-specific word animation ────────────────────────────────────────
  const wordVariantMap: Record<string, Variants> = {
    elegant: {
      hidden: { opacity: 0, y: 28, scale: 0.7 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 14, stiffness: 180 } },
    },
    neon: {
      hidden: { opacity: 0, x: -20, textShadow: 'none' },
      visible: { opacity: 1, x: 0, textShadow: `0 0 12px ${splashTextColor}`, transition: { duration: 0.4 } },
    },
    minimal: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.6 } },
    },
    wave: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 16 } },
    },
    particles: {
      hidden: { opacity: 0, scale: 0.4, rotate: -10 },
      visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 12 } },
    },
  };

  const wordVariants = wordVariantMap[splashTheme] || wordVariantMap.elegant;

  // ── Logo entrance ────────────────────────────────────────────────────────
  const logoVariantMap: Record<string, object> = {
    elegant: { initial: { scale: 0.6, opacity: 0, y: 30 }, animate: { scale: 1, opacity: 1, y: 0 }, transition: { duration: 0.9, ease: 'easeOut' } },
    neon: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.6 } },
    minimal: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
    wave: { initial: { scale: 0.7, opacity: 0, rotate: -6 }, animate: { scale: 1, opacity: 1, rotate: 0 }, transition: { type: 'spring', stiffness: 180, damping: 14 } },
    particles: { initial: { scale: 1.3, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.7, ease: 'easeOut' } },
  };
  const logoAnim = logoVariantMap[splashTheme] || logoVariantMap.elegant;

  // ── Subtext animation ────────────────────────────────────────────────────
  const subtextAnim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 0.7, y: 0 }, transition: { delay: 0.9, duration: 0.6 } };

  // ── Background content per theme ─────────────────────────────────────────
  const bgContent: Record<string, React.ReactNode> = {
    elegant: null,
    neon: (
      <>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${splashTextColor}18 0%, transparent 70%)` }} />
        <NeonRing color={splashTextColor} />
      </>
    ),
    minimal: null,
    wave: <WaveBackground color={splashTextColor} />,
    particles: <Particles color={splashTextColor} />,
  };

  return createPortal(
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: splashTheme === 'elegant' ? 0.96 : 1 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden w-screen h-screen"
          style={{ background: splashBgColor, margin: 0, padding: 0 }}
        >
          {/* Background decoration */}
          {bgContent[splashTheme]}

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-8 text-center">

            {/* Logo */}
            {splashShowLogo && (
              <motion.img
                src={logoSrc}
                alt="Loading..."
                className="object-contain mb-2"
                style={{ width: 160, height: 160, filter: splashTheme === 'neon' ? `drop-shadow(0 0 16px ${splashTextColor}aa)` : 'none' }}
                {...(logoAnim as any)}
              />
            )}

            {/* Text */}
            <motion.div
              className="flex flex-wrap gap-x-2 gap-y-1 justify-center"
              variants={wordContainerVariants}
              initial="hidden"
              animate="visible"
              dir="rtl"
            >
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  className="font-extrabold leading-tight"
                  style={{
                    color: splashTextColor,
                    fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                    letterSpacing: splashTheme === 'minimal' ? '-0.02em' : '0.01em',
                    textShadow: splashTheme === 'neon' ? `0 0 16px ${splashTextColor}88` : 'none',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>

            {/* Subtext */}
            {splashSubtext?.trim() && (
              <motion.p
                className="text-sm font-medium"
                style={{ color: splashTextColor }}
                {...(subtextAnim as any)}
              >
                {splashSubtext}
              </motion.p>
            )}

            {/* Loading dots */}
            <motion.div
              className="flex gap-1.5 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: splashTextColor, opacity: 0.5 }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
