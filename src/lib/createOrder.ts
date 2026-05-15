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

  const amountNum = typeof input.amount === "string" ? parseFloat(input.amount) : input.amount;

  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: user.id,
      trade_type: input.trade_type,
      action: input.action,
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
