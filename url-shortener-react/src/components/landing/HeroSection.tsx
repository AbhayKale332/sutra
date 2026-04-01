import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const TriangleGraphic = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="triGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="triGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <motion.polygon
      points="200,40 360,320 40,320"
      fill="url(#triGrad1)"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
    />
    <motion.polygon
      points="200,100 320,300 80,300"
      fill="url(#triGrad2)"
      initial={{ scale: 0.6, opacity: 0, rotate: 10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 1, delay: 0.6 }}
    />
    <motion.polygon
      points="160,180 240,180 200,100"
      fill="white"
      fillOpacity="0.15"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1 }}
    />
    <motion.circle cx="200" cy="200" r="120" stroke="url(#triGrad1)" strokeWidth="1" fill="none" strokeDasharray="8 8"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
    />
  </svg>
);

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section id="hero" className="pt-28 pb-20 md:pt-36 md:pb-28 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Shorten, Share &{" "}
              <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                Analyze
              </span>{" "}
              Your Links
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Sutra Simplifies URL Shortening For Efficient Sharing.
              Get powerful analytics and insights for every link you create.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                <Button className="bg-gradient-to-r from-brand-purple to-brand-blue text-primary-foreground font-semibold px-8 py-6 rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 text-lg">
                  Manage Links
                </Button>
              </Link>
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                <Button variant="outline" className="border-2 border-brand-purple text-brand-purple font-semibold px-8 py-6 rounded-lg hover:bg-accent transition-all duration-300 hover:-translate-y-0.5 text-lg">
                  Create Short Link
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-72 h-72 md:w-96 md:h-96">
              <TriangleGraphic />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
