import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-r from-brand-purple to-brand-blue rounded-2xl px-8 py-16 md:py-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4">
              Start Shortening Today
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto text-lg">
              Join thousands of users who trust Sutra for their link management needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0.4)", "0 0 0 12px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0)"] }}
              transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
              className="bg-primary-foreground text-brand-purple font-bold px-10 py-4 rounded-lg text-lg hover:bg-primary-foreground/90 transition-colors"
            >
              Sign Up Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
