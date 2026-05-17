// SwiftBot — AI assistant for SwiftChain X order chats.
// Greets the customer, collects details, computes amounts from daily rates,
// shares payment methods on request, and notifies admin once info is gathered.

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "ajartisanvista@gmail.com";
const ADMIN_WHATSAPP = "233555098098"; // +233 55 509 8098

interface ChatMsg {
  sender_role: "user" | "admin" | "bot";
  body: string | null;
  attachment_url: string | null;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { trade_id, kind } = await req.json();
    if (!trade_id) return json({ error: "trade_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load trade + recent context
    const { data: order } = await supabase.from("trades").select("*").eq("id", trade_id).maybeSingle();
    if (!order) return json({ error: "trade not found" }, 404);
    if (order.status === "completed") return json({ skipped: true });

    const { data: msgsRaw } = await supabase
      .from("chat_messages").select("sender_role, body, attachment_url, created_at")
      .eq("trade_id", trade_id).order("created_at").limit(40);
    const msgs = (msgsRaw || []) as ChatMsg[];

    const { data: rates } = await supabase.from("crypto_rates")
      .select("crypto_name, crypto_symbol, buy_rate, sell_rate, currency");
    const { data: methods } = await supabase.from("payment_methods")
      .select("label, type, details, instructions").eq("active", true).order("sort_order");

    // Don't reply if the last message is already from the bot or admin (only respond to customer turns / first greeting)
    const lastNonBot = [...msgs].reverse().find(m => m.sender_role !== "bot");
    if (kind !== "greet" && (!lastNonBot || lastNonBot.sender_role !== "user")) {
      return json({ skipped: true, reason: "no user turn" });
    }

    const ratesBlock = (rates || []).map((r: any) =>
      `- ${r.crypto_name} (${r.crypto_symbol}): we BUY from customer at ${r.buy_rate} ${r.currency}/USD, we SELL to customer at ${r.sell_rate} ${r.currency}/USD`
    ).join("\n") || "No live rates configured yet — politely tell the customer the admin will confirm rate manually.";

    const methodsBlock = (methods || []).map((m: any, i: number) =>
      `${i + 1}. ${m.label} (${m.type}) → ${m.details}${m.instructions ? ` — ${m.instructions}` : ""}`
    ).join("\n") || "No payment methods configured.";

    const systemPrompt = `You are "SwiftBot", the friendly AI assistant for SwiftChain X, Ghana's trusted crypto & gift-card trading desk.

ORDER YOU ARE HANDLING:
- Type: ${order.trade_type}
- Action: customer wants to ${order.action} ${order.item}
- Amount entered on form: ${order.amount ?? "not specified"} (USD value or card value)
- Customer email on file: ${order.customer_email ?? "unknown"}
- Order ID: ${order.id}

LIVE GHS RATES (today):
${ratesBlock}

ACTIVE PAYMENT METHODS:
${methodsBlock}

YOUR JOB — follow this order strictly:
1. Greet the customer warmly by referencing exactly what they want to trade.
2. Confirm the USD amount (for crypto) or card face value (for gift cards).
3. Calculate the GHS the customer will RECEIVE (if selling) or PAY (if buying) using the rate table above. Show the math briefly: e.g. "$100 × 12.5 GHS = 1,250 GHS".
4. Ask for the details we need:
   - Their full name
   - MTN/Vodafone/AirtelTigo Mobile Money number for payout (if selling crypto/gift card)
   - For gift cards: clear photos of the card front/back + receipt — tell them to use the 📎 attach button
   - For crypto buy: their wallet address
5. When the customer asks for payment details / "how do I pay" / "send me your momo", reply with the payment methods above formatted clearly, including the order ID as reference.
6. Once you have name + payout method + amount confirmed, finish your message with the EXACT token on its own line:
   [[NOTIFY_ADMIN]]
   That token triggers an email + WhatsApp alert to the admin. Use it ONLY once per order.
7. Keep messages short (2–5 sentences), warm, professional, with light emojis (💰📲✅). Never make up rates. If something is unclear, ask. If admin already joined the chat, just assist briefly and step aside.

You are NOT allowed to mark the order completed — only the admin can do that. Never share the admin's private email or phone unless the customer explicitly asks for human support.`;

    // Build chat history for the model
    const history = msgs.map((m) => ({
      role: m.sender_role === "user" ? "user" : "assistant",
      content: m.body || (m.attachment_url ? `[Customer sent an attachment: ${m.attachment_url}]` : ""),
    })).filter(m => m.content);

    if (kind === "greet" && history.length === 0) {
      history.push({ role: "user", content: "(customer just opened the chat — greet them)" });
    }

    // Call Lovable AI Gateway
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...history],
      }),
    });

    if (!aiRes.ok) {
      const errTxt = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errTxt);
      if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_failed", detail: errTxt }, 500);
    }

    const aiJson = await aiRes.json();
    let reply: string = aiJson.choices?.[0]?.message?.content?.trim() || "Hello! 👋 I'll be right with you.";

    const shouldNotify = reply.includes("[[NOTIFY_ADMIN]]");
    reply = reply.replace(/\[\[NOTIFY_ADMIN\]\]/g, "").trim();

    // Use the trade owner's id as the sender_id (RLS bypassed via service role, but FK-safe)
    await supabase.from("chat_messages").insert({
      trade_id,
      sender_id: order.user_id,
      sender_role: "bot",
      body: reply,
      read_by_admin: false,
      read_by_user: true,
    });

    // Admin notification
    if (shouldNotify && !order.admin_notified) {
      await supabase.from("trades").update({ admin_notified: true }).eq("id", trade_id);

      const summary = `${order.action?.toUpperCase()} ${order.item} · ${order.amount ?? "?"} · ${order.trade_type}\nCustomer: ${order.customer_email ?? "n/a"}\nOrder: ${order.id}`;
      const waText = encodeURIComponent(`New SwiftChain X order needs your attention:\n${summary}\n\nOpen chat: ${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "")}`);
      const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${waText}`;

      // In-chat banner so admin sees it the moment they open the panel
      await supabase.from("chat_messages").insert({
        trade_id,
        sender_id: order.user_id,
        sender_role: "bot",
        body: `🔔 *Admin notified*\nA summary has been sent to ${ADMIN_EMAIL} and a WhatsApp alert is queued. An agent will join shortly.`,
        read_by_user: true,
      });

      // Email via Resend (optional — only fires if RESEND_API_KEY is set)
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
            body: JSON.stringify({
              from: "SwiftChain X <orders@resend.dev>",
              to: [ADMIN_EMAIL],
              subject: `🟢 New order — ${order.action} ${order.item}`,
              html: `<h2>New SwiftChain X order</h2>
                <p><b>Type:</b> ${order.trade_type}</p>
                <p><b>Action:</b> ${order.action}</p>
                <p><b>Item:</b> ${order.item}</p>
                <p><b>Amount:</b> ${order.amount ?? "n/a"}</p>
                <p><b>Customer:</b> ${order.customer_email ?? "n/a"}</p>
                <p><b>Order ID:</b> ${order.id}</p>
                <p><a href="${waLink}">📲 WhatsApp the customer / open shortcut</a></p>`,
            }),
          });
        } catch (e) { console.error("resend failed", e); }
      } else {
        console.log("RESEND_API_KEY not set — skipping email. WhatsApp link:", waLink);
      }
    }

    return json({ ok: true, notified: shouldNotify });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
