import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, TrendingUp, Star, Trash2, CheckCircle, XCircle, Clock, Search, Shield, Pencil, Save, X, ArrowUpDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.jpeg";

interface AdminProfile {
  id: string;
  user_id: string;
  display_name: string;
  phone: string | null;
  total_trades: number;
  rewards_balance: number;
  created_at: string;
}

interface AdminTrade {
  id: string;
  user_id: string;
  trade_type: string;
  action: string;
  item: string;
  amount: number | null;
  reward_earned: number;
  status: string;
  created_at: string;
}

interface AdminReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  trade_type: string;
  created_at: string;
}

interface CryptoRate {
  id: string;
  crypto_name: string;
  crypto_symbol: string;
  buy_rate: number;
  sell_rate: number;
  currency: string;
  updated_at: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"trades" | "users" | "reviews" | "rates">("trades");
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [trades, setTrades] = useState<AdminTrade[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ total_trades: number; rewards_balance: number }>({ total_trades: 0, rewards_balance: 0 });
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [rateEditValues, setRateEditValues] = useState<{ buy_rate: number; sell_rate: number }>({ buy_rate: 0, sell_rate: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) checkAdmin();
  }, [user, authLoading]);

  const checkAdmin = async () => {
    const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
    if (!data) { setIsAdmin(false); return; }
    setIsAdmin(true);
    fetchAll();
  };

  const fetchAll = async () => {
    setLoadingData(true);
    const [profilesRes, tradesRes, reviewsRes, ratesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("trades").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("crypto_rates").select("*").order("crypto_name"),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data as AdminProfile[]);
    if (tradesRes.data) setTrades(tradesRes.data as AdminTrade[]);
    if (reviewsRes.data) setReviews(reviewsRes.data as AdminReview[]);
    if (ratesRes.data) setRates(ratesRes.data as CryptoRate[]);
    setLoadingData(false);
  };

  const updateTradeStatus = async (tradeId: string, status: string) => {
    const { error } = await supabase.from("trades").update({ status }).eq("id", tradeId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Trade updated", description: `Status set to ${status}` });
      setTrades((prev) => prev.map((t) => (t.id === tradeId ? { ...t, status } : t)));
    }
  };

  const deleteReview = async (reviewId: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review deleted" });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const startEditUser = (p: AdminProfile) => {
    setEditingUser(p.id);
    setEditValues({ total_trades: p.total_trades, rewards_balance: p.rewards_balance });
  };

  const saveUserEdit = async (profileId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ total_trades: editValues.total_trades, rewards_balance: editValues.rewards_balance })
      .eq("id", profileId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User updated" });
      setProfiles((prev) => prev.map((p) => p.id === profileId ? { ...p, ...editValues } : p));
      setEditingUser(null);
    }
  };

  const startEditRate = (r: CryptoRate) => {
    setEditingRate(r.id);
    setRateEditValues({ buy_rate: r.buy_rate, sell_rate: r.sell_rate });
  };

  const saveRateEdit = async (rateId: string) => {
    const { error } = await supabase
      .from("crypto_rates")
      .update({ buy_rate: rateEditValues.buy_rate, sell_rate: rateEditValues.sell_rate, updated_at: new Date().toISOString() })
      .eq("id", rateId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rate updated" });
      setRates((prev) => prev.map((r) => r.id === rateId ? { ...r, ...rateEditValues, updated_at: new Date().toISOString() } : r));
      setEditingRate(null);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <Shield size={48} className="text-destructive" />
        <h1 className="font-display text-xl font-bold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground text-center">You don't have admin privileges.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const filteredTrades = trades.filter(
    (t) =>
      t.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProfiles = profiles.filter(
    (p) =>
      p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone && p.phone.includes(searchTerm))
  );

  const filteredReviews = reviews.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { key: "trades" as const, label: "Trades", icon: TrendingUp, count: trades.length },
    { key: "users" as const, label: "Users", icon: Users, count: profiles.length },
    { key: "reviews" as const, label: "Reviews", icon: Star, count: reviews.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="SwiftChain X" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display text-sm font-bold text-foreground">Admin Panel</span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft size={14} /> Back to Site
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] text-center">
            <p className="text-2xl font-bold text-primary">{profiles.length}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] text-center">
            <p className="text-2xl font-bold text-primary">{trades.length}</p>
            <p className="text-xs text-muted-foreground">Total Trades</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] text-center">
            <p className="text-2xl font-bold text-primary">{reviews.length}</p>
            <p className="text-xs text-muted-foreground">Reviews</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchTerm(""); }}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-button)]"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              <tab.icon size={14} />
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {loadingData ? (
          <p className="text-center text-muted-foreground py-8">Loading data...</p>
        ) : (
          <>
            {/* Trades Tab */}
            {activeTab === "trades" && (
              <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-3 font-semibold text-card-foreground">Item</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Type</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Action</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Amount</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Status</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Date</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrades.map((trade) => (
                        <tr key={trade.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-3 text-card-foreground font-medium">{trade.item}</td>
                          <td className="p-3 text-muted-foreground">{trade.trade_type}</td>
                          <td className="p-3 text-muted-foreground capitalize">{trade.action}</td>
                          <td className="p-3 text-card-foreground">{trade.amount ? `$${trade.amount}` : "—"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              trade.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              trade.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}>
                              {trade.status}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">{new Date(trade.created_at).toLocaleDateString()}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <button onClick={() => updateTradeStatus(trade.id, "completed")} title="Complete" className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600">
                                <CheckCircle size={14} />
                              </button>
                              <button onClick={() => updateTradeStatus(trade.id, "pending")} title="Pending" className="p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600">
                                <Clock size={14} />
                              </button>
                              <button onClick={() => updateTradeStatus(trade.id, "cancelled")} title="Cancel" className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600">
                                <XCircle size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredTrades.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No trades found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-3 font-semibold text-card-foreground">Name</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Phone</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Trades</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Rewards</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Joined</th>
                        <th className="text-left p-3 font-semibold text-card-foreground">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="p-3 text-card-foreground font-medium">{p.display_name}</td>
                          <td className="p-3 text-muted-foreground">{p.phone || "—"}</td>
                          <td className="p-3 text-card-foreground">
                            {editingUser === p.id ? (
                              <Input
                                type="number"
                                value={editValues.total_trades}
                                onChange={(e) => setEditValues((v) => ({ ...v, total_trades: parseInt(e.target.value) || 0 }))}
                                className="w-20 h-7 text-xs"
                              />
                            ) : (
                              p.total_trades
                            )}
                          </td>
                          <td className="p-3">
                            {editingUser === p.id ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={editValues.rewards_balance}
                                onChange={(e) => setEditValues((v) => ({ ...v, rewards_balance: parseFloat(e.target.value) || 0 }))}
                                className="w-24 h-7 text-xs"
                              />
                            ) : (
                              <span className="text-primary font-medium">${p.rewards_balance}</span>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="p-3">
                            {editingUser === p.id ? (
                              <div className="flex gap-1">
                                <button onClick={() => saveUserEdit(p.id)} title="Save" className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600">
                                  <Save size={14} />
                                </button>
                                <button onClick={() => setEditingUser(null)} title="Cancel" className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => startEditUser(p)} title="Edit" className="p-1 rounded hover:bg-primary/10 text-primary">
                                <Pencil size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredProfiles.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-3">
                {filteredReviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-card-foreground">{r.name}</span>
                        <span className="text-xs text-muted-foreground">· {r.trade_type}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} className={i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.comment}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => deleteReview(r.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {filteredReviews.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No reviews found</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
