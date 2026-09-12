import { Link2, BarChart3, Shield } from "lucide-react";

const features = [
  { icon: Link2, title: "Shorten fast", desc: "Turn long URLs into clean links with one form." },
  { icon: BarChart3, title: "See clicks", desc: "Track usage from a simple dashboard." },
  { icon: Shield, title: "Stay private", desc: "Use your account to keep links managed in one place." },
];

const FeatureCards = () => {
  return (
    <section id="features" className="pb-20 bg-background">
      <div className="container mx-auto max-w-4xl px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">Core features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-lg p-5"
            >
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-base font-semibold text-card-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
