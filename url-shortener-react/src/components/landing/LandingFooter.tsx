import { Link2, Github } from "lucide-react";
import BackendStatus from "../BackendStatus";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border py-10">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <div className="flex items-center gap-2 mb-3 text-foreground">
              <Link2 className="w-6 h-6 rotate-[-45deg]" />
              <span className="text-xl font-bold tracking-tight">Sutra</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Minimal link management for everyday sharing.
            </p>
          </div>

          <div className="flex flex-col">
             <BackendStatus />
          </div>
          
          <div className="flex flex-col md:items-end">
            <a href="https://github.com/AbhayKale332" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-5 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Sutra Linklytics.</span>
            <span>Developed by Abhay Kale</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
