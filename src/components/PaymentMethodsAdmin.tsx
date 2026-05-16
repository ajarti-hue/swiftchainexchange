import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, Pencil, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PaymentMethod {
  id: string;
  label: string;
  type: string;
  details: string;
  instructions: string | null;
  active: boolean;
  sort_order: number;
}

const blank = { label: "", type: "Mobile Money", details: "", instructions: "", active: true, sort_order: 0 };

const PaymentMethodsAdmin = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<PaymentMethod>>(blank);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("payment_methods").select("*").order("sort_order");
    setItems((data || []) as PaymentMethod[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (m: PaymentMethod) => {
    setEditingId(m.id);
    setDraft({ ...m });
    setCreating(false);
  };

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setDraft({ ...blank, sort_order: items.length + 1 });
  };

  const cancel = () => { setEditingId(null); setCreating(false); setDraft(blank); };

  const save = async () => {
    if (!draft.label || !draft.details || !draft.type) {
      toast({ title: "Label, type and details are required", variant: "destructive" });
      return;
    }
    if (creating) {
      const { error } = await (supabase as any).from("payment_methods").insert({
        label: draft.label, type: draft.type, details: draft.details,
        instructions: draft.instructions || null, active: draft.active ?? true, sort_order: draft.sort_order ?? 0,
      });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Payment method added" });
    } else if (editingId) {
      const { error } = await (supabase as any).from("payment_methods").update({
        label: draft.label, type: draft.type, details: draft.details,
        instructions: draft.instructions || null, active: draft.active, sort_order: draft.sort_order,
      }).eq("id", editingId);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Updated" });
    }
    cancel();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this payment method?")) return;
    const { error } = await (supabase as any).from("payment_methods").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    load();
  };

  const toggleActive = async (m: PaymentMethod) => {
    const { error } = await (supabase as any).from("payment_methods").update({ active: !m.active }).eq("id", m.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    load();
  };

  const EditForm = (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase">Label</label>
          <Input value={draft.label ?? ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="MTN Mobile Money" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase">Type</label>
          <select
            value={draft.type ?? "Mobile Money"}
            onChange={(e) => setDraft({ ...draft, type: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option>Mobile Money</option>
            <option>Bank</option>
            <option>Crypto Wallet</option>
            <option>Cash</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[11px] font-semibold text-muted-foreground uppercase">Details</label>
        <Input value={draft.details ?? ""} onChange={(e) => setDraft({ ...draft, details: e.target.value })} placeholder="+233 55 509 8098 or account number / wallet address" />
      </div>
      <div>
        <label className="text-[11px] font-semibold text-muted-foreground uppercase">Instructions (optional)</label>
        <Input value={draft.instructions ?? ""} onChange={(e) => setDraft({ ...draft, instructions: e.target.value })} placeholder="Include the order ID as reference" />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-foreground">
          <input type="checkbox" checked={draft.active ?? true} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="accent-primary" />
          Active
        </label>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Order</label>
          <Input type="number" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })} className="w-20 h-8" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={cancel}><X size={14} /> Cancel</Button>
        <Button size="sm" onClick={save}><Save size={14} /> Save</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Manage the payment methods customers see when they request payment details in order chats.
        </p>
        {!creating && !editingId && (
          <Button size="sm" onClick={startCreate}><Plus size={14} /> Add method</Button>
        )}
      </div>

      {(creating || editingId) && EditForm}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-semibold text-card-foreground">Label</th>
                <th className="text-left p-3 font-semibold text-card-foreground">Type</th>
                <th className="text-left p-3 font-semibold text-card-foreground">Details</th>
                <th className="text-left p-3 font-semibold text-card-foreground">Active</th>
                <th className="text-left p-3 font-semibold text-card-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium text-card-foreground">{m.label}</td>
                  <td className="p-3 text-muted-foreground">{m.type}</td>
                  <td className="p-3 text-muted-foreground break-all max-w-[260px]">{m.details}</td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(m)} className={`px-2 py-1 rounded-full text-[10px] font-semibold ${m.active ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {m.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-3 flex gap-1">
                    <button onClick={() => startEdit(m)} title="Edit" className="p-1 rounded hover:bg-primary/10 text-primary"><Pencil size={14} /></button>
                    <button onClick={() => remove(m.id)} title="Delete" className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No payment methods yet. Click "Add method" to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsAdmin;
