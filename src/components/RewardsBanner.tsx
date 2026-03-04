import { Gift, ArrowRight } from "lucide-react";

const RewardsBanner = () => (
  <div className="mt-6 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-accent/5 p-4 shadow-[var(--shadow-card)]">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Gift size={22} />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-sm font-bold text-card-foreground">Earn Rewards on Every Trade</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          Complete <span className="font-semibold text-primary">3 trades</span> and unlock a bonus discount on your next transaction. The more you trade, the more you save!
        </p>
      </div>
      <a
        href="https://wa.me/233555098098?text=Hi%20SwiftChain%20X!%20I%27d%20like%20to%20know%20more%20about%20the%20rewards%20program."
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
      >
        <ArrowRight size={16} />
      </a>
    </div>
  </div>
);

export default RewardsBanner;
