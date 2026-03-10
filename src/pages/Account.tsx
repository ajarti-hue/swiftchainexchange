import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gift, LogOut, Star, TrendingUp } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import Footer from "@/components/Footer";

interface Profile {
  display_name: string;
  total_trades: number;
  rewards_balance: number;
}

interface Trade {
  id: string;
  trade_type: string;
  action: string;
  item: string;
  amount: number;
  reward_earned: number;
  status: string;
  created_at: string;
}

const Account = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchProfile();
      fetchTrades();
    }
  }, [user, loading]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, total_trades, rewards_balance")
      .eq("user_id", user!.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchTrades = async () => {
    const { data } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setTrades(data as Trade[]);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const nextRewardAt = 3 - (profile.total_trades % 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Home
          </button>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut size={14} /> Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] text-center mb-6">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary mb-3">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-display text-xl font-bold text-card-foreground">{profile.display_name}</h1>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] text-center">
            <TrendingUp size={20} className="mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-card-foreground">{profile.total_trades}</p>
            <p className="text-xs text-muted-foreground">Total Trades</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-4 shadow-[var(--shadow-card)] text-center">
            <Gift size={20} className="mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">${profile.rewards_balance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Rewards Balance</p>
          </div>
        </div>

        {/* Rewards Progress */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] mb-6">
          <h2 className="font-display text-sm font-bold text-card-foreground mb-2">
            <Star size={14} className="inline mr-1 text-primary" />
            Next Reward
          </h2>
          <p className="text-xs text-muted-foreground mb-2">
            Complete <span className="font-semibold text-primary">{nextRewardAt} more trade{nextRewardAt !== 1 ? "s" : ""}</span> to earn a bonus discount!
          </p>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((3 - nextRewardAt) / 3) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{3 - nextRewardAt}/3 trades</p>
        </div>

        {/* Trade History */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-sm font-bold text-card-foreground mb-3">Trade History</h2>
          {trades.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">No trades yet. Start trading to see your history here!</p>
              <Button size="sm" className="mt-3" onClick={() => navigate("/")}>
                Start Trading
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {trades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{trade.item}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {trade.action.toUpperCase()} · {trade.trade_type} · {new Date(trade.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {trade.amount && <p className="text-sm font-medium text-card-foreground">${trade.amount}</p>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      trade.status === "completed" ? "bg-green-100 text-green-700" :
                      trade.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {trade.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
