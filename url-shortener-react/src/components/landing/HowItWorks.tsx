import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link2, BarChart3, Share2 } from "lucide-react";

const steps = [
  { icon: Link2, title: "Paste Your URL", desc: "Drop in any long URL and we'll shorten it instantly." },
  { icon: BarChart3, title: "Track Performance", desc: "Monitor clicks, locations, and engagement in real time." },
  { icon: Share2, title: "Share Everywhere", desc: "Use your short link on social media, emails, and more." },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 bg-muted/50" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-foreground text-center mb-14"
        >
          How It Works
        </motion.h2>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-0">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-brand-purple to-brand-blue opacity-30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i === 0 ? -50 : i === 2 ? 50 : 0, y: i === 1 ? 30 : 0 }}
              animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.2 }}
              className="flex flex-col items-center text-center flex-1 relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="w-8 h-8 rounded-full bg-background border-2 border-brand-purple flex items-center justify-center text-sm font-bold text-brand-purple mb-3">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm max-w-[220px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
