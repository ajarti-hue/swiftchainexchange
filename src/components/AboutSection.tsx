import { Shield, Clock, Headphones, Lock, Zap, Award } from "lucide-react";

const features = [
  {
    icon: <Shield size={28} />,
    title: "Secure & Insured",
    description: "All transactions are insured and personally verified for your safety.",
  },
  {
    icon: <Zap size={28} />,
    title: "Instant Processing",
    description: "Swift transactions completed in minutes, not hours. 24/7 availability.",
  },
  {
    icon: <Lock size={28} />,
    title: "Data Protection",
    description: "Your personal data is encrypted and never shared with third parties.",
  },
  {
    icon: <Clock size={28} />,
    title: "24/7 Service",
    description: "Trade anytime, anywhere. Our platform never sleeps.",
  },
  {
    icon: <Headphones size={28} />,
    title: "Dedicated Support",
    description: "Get help from our team via WhatsApp, phone, or live chat anytime.",
  },
  {
    icon: <Award size={28} />,
    title: "Best Rates in Ghana",
    description: "We offer the most competitive rates for all digital currencies.",
  },
];

const AboutSection = () => (
  <section className="py-12">
    <div className="text-center mb-10">
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">Why We Are Special</h2>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        Trusted by thousands of customers across Ghana for fast, secure and reliable digital currency exchange.
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="rounded-xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-button)] transition-all duration-300 group"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {feature.icon}
          </div>
          <h3 className="font-display text-base font-bold text-card-foreground mb-2">{feature.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default AboutSection;
