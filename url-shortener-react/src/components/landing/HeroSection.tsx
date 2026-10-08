import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section id="hero" className="pt-28 pb-14 md:pt-32 md:pb-20 bg-background">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="rounded-xl border border-border bg-card p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-semibold text-foreground leading-tight">
            Short links that are easy to share and easy to track.
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
            Create a short URL in seconds, then check basic click analytics from your dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={isAuthenticated ? "/dashboard" : "/login"}>
              <Button className="px-6">Go to dashboard</Button>
            </Link>
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button variant="outline" className="px-6">
                Create an account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
