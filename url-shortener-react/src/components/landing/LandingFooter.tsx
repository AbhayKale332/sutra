import { Link2, Github, Twitter, Linkedin } from "lucide-react";
import BackendStatus from "../BackendStatus";

const LandingFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-100 py-14 dark:bg-slate-950 dark:border-t dark:border-slate-800 dark:text-slate-400">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <Link2 className="w-6 h-6 rotate-[-45deg]" />
              <span className="text-xl font-bold tracking-tight">Sutra</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The modern URL shortener with powerful analytics for teams and individuals.
            </p>
          </div>

          <div className="flex flex-col md:items-center">
             <BackendStatus />
          </div>
          
          <div className="flex flex-col md:items-end">
            <h4 className="font-semibold mb-4 text-white uppercase text-xs tracking-widest">Connect</h4>
            <div className="flex gap-6">
              <a href="https://x.com/Abhay__Kale" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://github.com/AbhayKale332" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/in/abhay-kale-407357263/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Sutra Linklytics. Developed by Abhay Kale
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
