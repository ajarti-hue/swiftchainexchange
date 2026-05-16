import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Paperclip, CheckCheck, Check, CheckCircle2, MessageCircle, Loader2 } from "lucide-react";
import PaymentMethodsPanel from "@/components/PaymentMethodsPanel";
import logo from "@/assets/logo.jpeg";

interface ChatMessage {
  id: string;
  trade_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  body: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  read_by_user: boolean;
  read_by_admin: boolean;
  created_at: string;
}

interface TradeOrder {
  id: string;
  user_id: string;
  trade_type: string;
  action: string;
  item: string;
  amount: number | null;
  status: string;
  customer_email: string | null;
  completed_at: string | null;
  created_at: string;
}

const OrderChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<TradeOrder | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !id) return;
    let cancelled = false;
    (async () => {
      const { data: roleData } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (cancelled) return;
      const admin = !!roleData;
      setIsAdmin(admin);

      const { data: orderData, error: orderErr } = await supabase
        .from("trades").select("*").eq("id", id).maybeSingle();
      if (orderErr || !orderData) {
        toast({ title: "Order not found", variant: "destructive" });
        navigate("/account");
        return;
      }
      setOrder(orderData as TradeOrder);

      const { data: msgs } = await supabase
        .from("chat_messages").select("*").eq("trade_id", id).order("created_at");
      setMessages((msgs || []) as ChatMessage[]);
      setLoading(false);

      // Mark messages from the other side as read
      const unreadFilter = admin
        ? { read_by_admin: true } as const
        : { read_by_user: true } as const;
      const otherRole = admin ? "user" : "admin";
      await supabase.from("chat_messages")
        .update(unreadFilter)
        .eq("trade_id", id)
        .eq("sender_role", otherRole);
    })();
    return () => { cancelled = true; };
  }, [user, id, navigate, toast]);

  // Realtime subscription
  useEffect(() => {
    if (!id || !user) return;
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `trade_id=eq.${id}` },
        async (payload) => {
          const m = payload.new as ChatMessage;
          setMessages((prev) => prev.some(p => p.id === m.id) ? prev : [...prev, m]);
          // Notification + auto mark-as-read for our side
          if (m.sender_id !== user.id) {
            try { new Notification("New message on your SwiftChain X order", { body: m.body || "Attachment received" }); } catch {}
            const patch = isAdmin ? { read_by_admin: true } : { read_by_user: true };
            await supabase.from("chat_messages").update(patch).eq("id", m.id);
          }
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages", filter: `trade_id=eq.${id}` },
        (payload) => {
          const m = payload.new as ChatMessage;
          setMessages((prev) => prev.map(p => p.id === m.id ? m : p));
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "trades", filter: `id=eq.${id}` },
        (payload) => setOrder((prev) => prev ? { ...prev, ...(payload.new as TradeOrder) } : prev))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, user, isAdmin]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Request notification permission once
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const sendMessage = async (body: string, attachment?: { url: string; name: string }) => {
    if (!user || !id || !order) return;
    if (!body.trim() && !attachment) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      trade_id: id,
      sender_id: user.id,
      sender_role: isAdmin ? "admin" : "user",
      body: body.trim() || null,
      attachment_url: attachment?.url ?? null,
      attachment_name: attachment?.name ?? null,
    });
    setSending(false);
    if (error) {
      toast({ title: "Could not send", description: error.message, variant: "destructive" });
    } else {
      setText("");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !id) return;
    setUploading(true);
    const path = `${user.id}/${id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("chat-attachments").upload(path, file);
    if (upErr) {
      setUploading(false);
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    await sendMessage("", { url: data.publicUrl, name: file.name });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const markComplete = async () => {
    if (!order) return;
    const { error } = await supabase.from("trades")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", order.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Order completed" });
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const isCompleted = order.status === "completed";

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
            <CheckCircle2 size={56} className="text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Order Completed</h1>
          <p className="text-muted-foreground mb-1">
            {order.action} {order.item} {order.amount ? `· $${order.amount}` : ""}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Closed {order.completed_at ? new Date(order.completed_at).toLocaleString() : ""}
          </p>
          <p className="text-sm text-foreground mb-8">
            Thank you for trading with SwiftChain X. We hope to see you again soon!
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/")} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)]">
              Back to Home
            </button>
            <button onClick={() => navigate("/account")} className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-card-foreground">
              My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={() => navigate(isAdmin ? "/admin" : "/account")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80">
            <img src={logo} alt="SwiftChain X" className="h-8 w-8 rounded-lg object-cover" />
            <div className="text-left">
              <p className="font-display text-sm font-bold text-foreground leading-tight">Order Chat</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {order.action} {order.item} {order.amount ? `· $${order.amount}` : ""}
              </p>
            </div>
          </button>
          {isAdmin ? (
            <button onClick={markComplete} className="rounded-md bg-green-600 hover:bg-green-700 px-3 py-1.5 text-[11px] font-semibold text-white">
              Mark Complete
            </button>
          ) : (
            <span className="rounded-full bg-yellow-500/15 px-2.5 py-1 text-[10px] font-medium text-yellow-700 dark:text-yellow-400">
              {order.status}
            </span>
          )}
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-4 space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
            <MessageCircle size={14} className="inline mr-1" />
            Order opened {new Date(order.created_at).toLocaleString()}. Chat with our team to complete this trade safely.
          </div>
          {messages.map((m) => {
            const mine = m.sender_id === user!.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-card-foreground border border-border rounded-bl-sm"
                }`}>
                  {!mine && (
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-0.5">
                      {m.sender_role === "admin" ? "SwiftChain Team" : "Customer"}
                    </p>
                  )}
                  {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                  {m.attachment_url && (
                    /\.(png|jpe?g|gif|webp)$/i.test(m.attachment_url) ? (
                      <a href={m.attachment_url} target="_blank" rel="noreferrer">
                        <img src={m.attachment_url} alt={m.attachment_name || "attachment"} className="mt-1 max-h-60 rounded-lg object-cover" />
                      </a>
                    ) : (
                      <a href={m.attachment_url} target="_blank" rel="noreferrer" className={`mt-1 inline-flex items-center gap-1 text-xs underline ${mine ? "text-primary-foreground" : "text-primary"}`}>
                        <Paperclip size={12} /> {m.attachment_name || "Attachment"}
                      </a>
                    )
                  )}
                  <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {mine && (
                      (isAdmin ? m.read_by_user : m.read_by_admin)
                        ? <CheckCheck size={12} />
                        : <Check size={12} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </main>

      {/* Composer */}
      <footer className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-3 pt-2 flex justify-center">
          <PaymentMethodsPanel tradeId={order.id} senderId={user!.id} isAdmin={isAdmin} />
        </div>
        <div className="mx-auto max-w-3xl px-3 py-3 flex items-end gap-2">
          <input ref={fileRef} type="file" hidden onChange={onFile} accept="image/*,.pdf,.doc,.docx" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label="Attach file"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={18} />}
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(text);
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 max-h-32"
          />
          <button
            type="button"
            onClick={() => sendMessage(text)}
            disabled={sending || (!text.trim())}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-button)] disabled:opacity-40"
            aria-label="Send"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default OrderChat;
