import { Link2, Github, Twitter, Linkedin } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="bg-foreground text-background py-14">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-6 h-6" />
              <span className="text-xl font-bold">Sutra</span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed">
              The modern URL shortener with powerful analytics for teams and individuals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-background/60 text-sm">
              <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
              <li><a href="#analytics" className="hover:text-background transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-background transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-background/60 text-sm">
              <li><a href="#" className="hover:text-background transition-colors">About</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-background/60 hover:text-background transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-background/60 hover:text-background transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-background/60 hover:text-background transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 mt-10 pt-6 text-center text-background/40 text-sm">
          © {new Date().getFullYear()} Sutra. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
