import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingTransitionProps {
  isLoading: boolean;
}

export function LoadingTransition({ isLoading }: LoadingTransitionProps) {
  const [loadingText, setLoadingText] = useState("Initializing");
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isLoading) return;

    const textInterval = setInterval(() => {
      setLoadingText((prev) => {
        const texts = [
          "Initializing",
          "Loading modules",
          "Establishing connection",
          "Syncing data",
          "Processing"
        ];
        const currentIndex = texts.indexOf(prev);
        return texts[(currentIndex + 1) % texts.length];
      });
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(textInterval);
      clearInterval(dotsInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
    >
      <div className="text-[rgb(40,254,20)] font-mono space-y-4">
        <div className="flex items-center space-x-2">
          <span className="animate-pulse">&gt;</span>
          <span>{loadingText}</span>
          <span>{dots}</span>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-0.5 bg-[rgb(40,254,20)]"
        />
      </div>
    </motion.div>
  );
}