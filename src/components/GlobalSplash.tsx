import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useStore } from "@/store/useStore";
import brand from "@/config/brand.json";

export const GlobalSplash = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const fullText = brand.slogan || "مع الحشومي انت ديماً في الامان";

  const loading = useStore((state) => state.loading);

  // Fallback timer to ensure splash doesn't hang indefinitely waiting for animation callbacks
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000); // 2 seconds gives enough time to comfortably see the popup text
    return () => clearTimeout(timer);
  }, []);

  // Listen for Index mount completion
  useEffect(() => {
    const handleReady = () => setIsAppReady(true);
    window.addEventListener('app-ready', handleReady);

    // Safety fallback just in case we are on another route and Index never mounts
    const fallbackTimer = setTimeout(() => {
      setIsAppReady(true);
    }, 4000);

    return () => {
      window.removeEventListener('app-ready', handleReady);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const words = fullText.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2, // Small delay after logo pops
      }
    }
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.5 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  // Handle splash dismissal
  useEffect(() => {
    // We only turn off splash when ALL THREE conditions are met:
    // 1. Data loaded, 2. Root Component mounted, 3. Minimum display time passed
    if (!loading && isAppReady && minTimeElapsed) {
      setTimeout(() => setShowSplash(false), 200);
    }
  }, [loading, isAppReady, minTimeElapsed]);

  // If already hidden, don't render portal
  if (!showSplash) return null;

  return createPortal(
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center m-0 p-0 overflow-hidden w-screen h-screen"
        >
          <motion.div
            initial={{ y: 50, scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              scale: { duration: 0.8, ease: "easeOut" },
              opacity: { duration: 0.8 }
            }}
            exit={{
              scale: 0.6,
              opacity: 0,
              transition: { duration: 0.9, ease: "easeIn" }
            }}
            className="relative flex flex-col items-center justify-center w-full h-full"
          >
            {/* Subtle glow effect behind the logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-transparent rounded-full scale-[2]" pointer-events-none="true" />
            <img
              src="/logo2.png"
              alt="Loading Compu Safe..."
              className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)] mb-6"
            />

            {/* Elegant Staggered Popup Text */}
            <div className="relative z-10 h-10 mt-2 flex items-center justify-center" dir="rtl">
              <motion.div
                className="flex gap-1.5 flex-wrap justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {words.map((word, index) => (
                  <motion.div
                    key={index}
                    variants={wordVariants}
                    className="text-xl md:text-3xl font-extrabold text-brand-700 tracking-wide drop-shadow-sm"
                  >
                    {word}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
