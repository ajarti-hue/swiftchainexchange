import { Gift, ArrowRight, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const RewardsBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mt-6 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-accent/5 p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Gift size={22} />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-sm font-bold text-card-foreground">Earn Rewards on Every Trade</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            {user
              ? "Check your account to see your rewards balance and trade progress!"
              : <>Create an account to track your trades & earn bonus rewards. Complete <span className="font-semibold text-primary">3 trades</span> to unlock a discount!</>
            }
          </p>
        </div>
        <button
          onClick={() => navigate(user ? "/account" : "/auth")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
        >
          {user ? <User size={16} /> : <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
};

export default RewardsBanner;
