import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Copy, RefreshCw } from "lucide-react";

interface Rental {
  id: string;
  user_id: string;
  service_name: string;
  country_name: string;
  price_ghs: number;
  phone_number: string | null;
  provider_order_id: string | null;
  provider_expires_at: string | null;
  status: string;
  sms_sender: string | null;
  sms_code: string | null;
  sms_text: string | null;
  momo_reference: string | null;
  cancel_reason: string | null;
  created_at: string;
}

const statusColor = (s: string) => {
  if (s === "sms_received") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (s === "waiting_sms") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "pending_payment") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (s === "cancelled" || s === "expired") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return "bg-muted text-muted-foreground";
};

const RentalsAdmin = () => {
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("number_rentals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRentals((data as Rental[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const ch = supabase
      .channel("admin_rentals")
      .on("postgres_changes", { event: "*", schema: "public", table: "number_rentals" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const provision = async (id: string) => {
    setBusyId(id);
    const { data, error } = await supabase.functions.invoke("rent-number", {
      body: { action: "provision", rental_id: id },
    });
    setBusyId(null);
    if (error) return toast({ title: "Provision failed", description: error.message, variant: "destructive" });
    if (data?.error) return toast({ title: "Provision failed", description: data.error, variant: "destructive" });
    toast({ title: "Number assigned", description: data?.rental?.phone_number ?? "" });
    load();
  };

  const cancel = async (id: string) => {
    if (!confirm("Cancel this rental?")) return;
    setBusyId(id);
    await supabase.functions.invoke("rent-number", { body: { action: "cancel", rental_id: id } });
    setBusyId(null);
    load();
  };

  const check = async (id: string) => {
    setBusyId(id);
    await supabase.functions.invoke("rent-number", { body: { action: "check", rental_id: id } });
    setBusyId(null);
    load();
  };

  const copy = async (t: string) => { await navigator.clipboard.writeText(t); toast({ title: "Copied" }); };

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading rentals…</p>;

  return (
    <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-semibold">Service</th>
              <th className="text-left p-3 font-semibold">Country</th>
              <th className="text-left p-3 font-semibold">Price</th>
              <th className="text-left p-3 font-semibold">Ref</th>
              <th className="text-left p-3 font-semibold">Number / SMS</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 align-top">
                <td className="p-3 font-medium">{r.service_name}</td>
                <td className="p-3 text-muted-foreground">{r.country_name}</td>
                <td className="p-3">GHS {Number(r.price_ghs).toFixed(2)}</td>
                <td className="p-3 font-mono">
                  {r.momo_reference ? (
                    <button onClick={() => copy(r.momo_reference!)} className="text-primary flex items-center gap-1">
                      {r.momo_reference} <Copy size={11}/>
                    </button>
                  ) : "—"}
                </td>
                <td className="p-3 text-muted-foreground">
                  {r.phone_number ? (
                    <button onClick={() => copy(r.phone_number!)} className="text-foreground font-mono flex items-center gap-1">
                      {r.phone_number} <Copy size={11}/>
                    </button>
                  ) : "—"}
                  {r.sms_code && <div className="text-green-600 dark:text-green-400 font-bold font-mono mt-1">Code: {r.sms_code}</div>}
                </td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(r.status)}`}>{r.status.replace(/_/g, " ")}</span></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {r.status === "pending_payment" && (
                      <button
                        disabled={busyId === r.id}
                        onClick={() => provision(r.id)}
                        title="Confirm payment & assign number"
                        className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 text-[11px] font-semibold px-2"
                      >
                        {busyId === r.id ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle2 size={12}/>} Confirm
                      </button>
                    )}
                    {r.status === "waiting_sms" && (
                      <button disabled={busyId === r.id} onClick={() => check(r.id)} title="Check for SMS now" className="p-1.5 rounded hover:bg-muted text-foreground">
                        {busyId === r.id ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>}
                      </button>
                    )}
                    {["pending_payment", "waiting_sms", "payment_confirmed"].includes(r.status) && (
                      <button disabled={busyId === r.id} onClick={() => cancel(r.id)} title="Cancel" className="p-1.5 rounded hover:bg-destructive/10 text-destructive">
                        <XCircle size={12}/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rentals.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No rentals yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalsAdmin;
