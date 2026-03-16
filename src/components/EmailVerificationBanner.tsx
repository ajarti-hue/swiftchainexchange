import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Show banner only if user exists but email is not confirmed
  if (!user || dismissed) return null;

  const isVerified = user.email_confirmed_at || user.confirmed_at;
  if (isVerified) return null;

  return (
    <div className="relative bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle size={20} className="text-destructive shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-destructive">Email Not Verified</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your account is not fully secured. Please verify your email address to protect your account and access all features.
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          <ShieldCheck size={12} /> Verify Now
        </button>
      </div>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export default EmailVerificationBanner;
