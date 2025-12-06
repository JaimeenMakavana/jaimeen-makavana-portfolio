"use client";

import { motion } from "framer-motion";

interface ComplexityMeterProps {
  score: number;
  animate?: boolean;
}

export const ComplexityMeter = ({
  score,
  animate = true,
}: ComplexityMeterProps) => {
  return (
    <div className="flex flex-col gap-1 w-full max-w-[120px]">
      <div className="flex justify-between text-[10px] uppercase font-mono tracking-widest text-neutral-400">
        <span>Complexity</span>
        <span>{score}%</span>
      </div>
      <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{
            duration: 1.5,
            ease: "circOut",
            delay: animate ? 0.2 : 0,
          }}
          className="h-full bg-[#e4e987]"
        />
      </div>
    </div>
  );
};

