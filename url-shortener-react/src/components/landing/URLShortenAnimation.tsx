import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import { useRef } from "react";

const stages = [
  "https://www.example.com/articles/2024/marketing/strategies/social-media-growth-tips-and-tricks?ref=newsletter&utm_source=email&utm_medium=cpc&utm_campaign=spring_sale",
  "https://www.example.com/articles/2024/marketing/strategies/social-media-growth-tips?ref=newsletter",
  "https://www.example.com/articles/2024/marketing/strategies",
  "https://www.example.com/articles/2024/marketing",
  "https://example.com/marketing",
  "https://sutra.co/xK9mQ",
  "sutra.co/xK9mQ",
];

const URLShortenAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawIndex = useTransform(scrollYProgress, [0.1, 0.9], [0, stages.length - 1]);
  const smoothIndex = useSpring(rawIndex, { stiffness: 80, damping: 20 });

  return (
    <div ref={ref} className="py-32 overflow-hidden bg-muted/30">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wider">
          Watch the magic happen
        </p>
        <div className="relative h-20 flex items-center justify-center">
          {stages.map((stage, i) => (
            <StageText key={i} text={stage} index={i} smoothIndex={smoothIndex} total={stages.length} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StageText = ({
  text,
  index,
  smoothIndex,
  total,
}: {
  text: string;
  index: number;
  smoothIndex: ReturnType<typeof useSpring>;
  total: number;
}) => {
  const isShort = index >= total - 2;
  const opacity = useTransform(smoothIndex, (v: number) => {
    const dist = Math.abs(v - index);
    return Math.max(0, 1 - dist * 2.5);
  });
  const scale = useTransform(smoothIndex, (v: number) => {
    const dist = Math.abs(v - index);
    return 1 - Math.min(dist * 0.08, 0.15);
  });
  const y = useTransform(smoothIndex, (v: number) => (v - index) * -12);

  return (
    <motion.span
      style={{ opacity, scale, y, position: "absolute" }}
      className={`font-mono text-sm md:text-lg break-all max-w-[90vw] px-4 py-3 rounded-xl pointer-events-none ${
        isShort
          ? "bg-brand-purple/10 text-brand-purple font-bold text-lg md:text-2xl"
          : "bg-muted text-foreground"
      }`}
    >
      {text}
    </motion.span>
  );
};

export default URLShortenAnimation;
