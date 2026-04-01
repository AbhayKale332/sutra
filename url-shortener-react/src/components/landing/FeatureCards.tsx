import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link2, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  { icon: Link2, title: "Simple URL Shortening", desc: "Create short, memorable links in seconds. No signup required for basic usage." },
  { icon: BarChart3, title: "Powerful Analytics", desc: "Track clicks, geographic data, referrers, and devices in real-time dashboards." },
  { icon: Shield, title: "Enhanced Security", desc: "All links are scanned for malware. Password-protect sensitive short URLs." },
  { icon: Zap, title: "Fast and Reliable", desc: "Global CDN ensures your links redirect in milliseconds, every single time." },
];

const FeatureCards = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4"
        >
          Everything You Need
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-muted-foreground text-center mb-14 max-w-2xl mx-auto"
        >
          Powerful features designed to help you manage, track, and optimize every link.
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
