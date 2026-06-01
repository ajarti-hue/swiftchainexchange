import { supabase } from "@/integrations/supabase/client";

export interface NewOrderInput {
  trade_type: "Gift Card" | "Crypto";
  action: string; // Buy / Sell
  item: string; // e.g. "Amazon" or "Bitcoin (BTC)"
  amount: string | number;
}

/**
 * Creates a new trade/order row for the signed-in user and returns its ID.
 * The chat page is keyed off this ID.
 */
export async function createOrder(input: NewOrderInput): Promise<string> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("You must be signed in to start an order.");
  const user = userData.user;

  // Verification gate — accept EITHER Supabase's own email_confirmed_at OR our profile flag.
  // If Supabase confirms the email but the profile flag is stale, auto-sync it.
  const supaConfirmed = Boolean((user as any).email_confirmed_at || (user as any).confirmed_at);
  const { data: prof } = await supabase
    .from("profiles")
    .select("email_verified")
    .eq("user_id", user.id)
    .maybeSingle();

  const verified = supaConfirmed || Boolean(prof?.email_verified);
  if (!verified) {
    throw new Error("🔒 Please verify your email before making a trade. Click 'Verify Now' in the banner at the top of the page.");
  }
  if (supaConfirmed && !prof?.email_verified) {
    // best-effort sync, don't block the order
    await supabase.from("profiles").update({ email_verified: true }).eq("user_id", user.id);
  }

  const amountNum = typeof input.amount === "string" ? parseFloat(input.amount) : input.amount;

  // DB constraint requires lowercase 'buy' | 'sell'
  const normalizedAction = String(input.action).trim().toLowerCase();
  const action = normalizedAction === "buy" || normalizedAction === "sell" ? normalizedAction : "buy";

  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: user.id,
      trade_type: input.trade_type,
      action,
      item: input.item,
      amount: isNaN(amountNum as number) ? null : amountNum,
      status: "pending",
      customer_email: user.email ?? null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message || "Could not create order");
  return data.id;
}
