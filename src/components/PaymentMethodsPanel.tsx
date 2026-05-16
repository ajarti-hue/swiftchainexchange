import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Send, Loader2, X } from "lucide-react";

interface PaymentMethod {
  id: string;
  label: string;
  type: string;
  details: string;
  instructions: string | null;
  active: boolean;
  sort_order: number;
}

interface Props {
  tradeId: string;
  senderId: string;
  isAdmin: boolean;
}

const PaymentMethodsPanel = ({ tradeId, senderId, isAdmin }: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMethods = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("payment_methods")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't load payment methods", description: error.message, variant: "destructive" });
      return;
    }
    setMethods((data || []) as PaymentMethod[]);
    setSelected(new Set((data || []).map((m: PaymentMethod) => m.id)));
  };

  useEffect(() => {
    if (open) fetchMethods();
  }, [open]);

  const requestDetails = async () => {
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      trade_id: tradeId,
      sender_id: senderId,
      sender_role: "user",
      body: "💳 Please share the available payment methods for this order.",
    });
    setSending(false);
    if (error) toast({ title: "Could not request", description: error.message, variant: "destructive" });
    else toast({ title: "Request sent", description: "Admin will share payment details shortly." });
  };

  const sendSelected = async () => {
    const chosen = methods.filter((m) => selected.has(m.id));
    if (chosen.length === 0) {
      toast({ title: "Select at least one method", variant: "destructive" });
      return;
    }
    const body =
      "💳 *Payment Options*\n\n" +
      chosen
        .map(
          (m, i) =>
            `${i + 1}. *${m.label}* (${m.type})\n   ${m.details}` +
            (m.instructions ? `\n   _${m.instructions}_` : "")
        )
        .join("\n\n") +
      "\n\nReply here once payment is sent so we can confirm and complete your order.";

    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      trade_id: tradeId,
      sender_id: senderId,
      sender_role: "admin",
      body,
    });
    setSending(false);
    if (error) {
      toast({ title: "Could not send", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment details sent" });
      setOpen(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Customer view: simple one-click request
  if (!isAdmin) {
    return (
      <button
        type="button"
        onClick={requestDetails}
        disabled={sending}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-50"
        title="Request payment details"
      >
        {sending ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
        Request payment details
      </button>
    );
  }

  // Admin view: open picker
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
        title="Send payment details to customer"
      >
        <Wallet size={14} />
        Send payment details
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-primary" />
                <h3 className="font-display font-bold text-foreground">Send Payment Details</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>}
              {!loading && methods.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active payment methods. Add some in the Admin → Payments tab.
                </p>
              )}
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    selected.has(m.id) ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{m.label}</p>
                      <span className="text-[10px] uppercase tracking-wide rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{m.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 break-all">{m.details}</p>
                    {m.instructions && <p className="text-[11px] text-muted-foreground/80 italic mt-1">{m.instructions}</p>}
                  </div>
                </label>
              ))}
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={sendSelected}
                disabled={sending || methods.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] disabled:opacity-50"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send to chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentMethodsPanel;
