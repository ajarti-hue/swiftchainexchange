// SwiftBot — AI assistant for SwiftChain X order chats.
// Asks ONE question at a time, gathers info sequentially, then flags the order
// as "awaiting_confirmation" so the admin can confirm in the dashboard.

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "ajartisanvista@gmail.com";
const ADMIN_WHATSAPP = "233555098098";

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
    if (!trade_id || typeof trade_id !== "string") return json({ error: "trade_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Caller authentication: require a valid Supabase JWT
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!jwt) return json({ error: "unauthorized" }, 401);
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);
    const callerId = userData.user.id;

    const { data: order } = await supabase.from("trades").select("*").eq("id", trade_id).maybeSingle();
    if (!order) return json({ error: "trade not found" }, 404);

    // Authorization: caller must own the trade OR be an admin
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (order.user_id !== callerId && !isAdmin) return json({ error: "forbidden" }, 403);

    if (order.status === "completed" || order.status === "cancelled") return json({ skipped: true });
    if (order.ai_paused) return json({ skipped: true, reason: "ai_paused" });

    const { data: msgsRaw } = await supabase
      .from("chat_messages").select("sender_role, body, attachment_url, created_at")
      .eq("trade_id", trade_id).order("created_at").limit(60);
    const msgs = (msgsRaw || []) as ChatMsg[];

    const { data: rates } = await supabase.from("crypto_rates")
      .select("crypto_name, crypto_symbol, buy_rate, sell_rate, currency");
    const { data: methods } = await supabase.from("payment_methods")
      .select("label, type, details, instructions").eq("active", true).order("sort_order");

    // Only respond when the last message is from the customer (or a greet trigger)
    const lastNonBot = [...msgs].reverse().find(m => m.sender_role !== "bot");
    if (kind !== "greet" && (!lastNonBot || lastNonBot.sender_role !== "user")) {
      return json({ skipped: true, reason: "no user turn" });
    }
    // If admin has joined this chat, bot steps aside (admin takeover)
    const adminEverSpoke = msgs.some(m => m.sender_role === "admin");
    if (adminEverSpoke && kind !== "greet") {
      return json({ skipped: true, reason: "admin in chat" });
    }

    const ratesBlock = (rates || []).map((r: any) =>
      `- ${r.crypto_name} (${r.crypto_symbol}): we BUY from customer at ${r.buy_rate} ${r.currency}/USD, we SELL to customer at ${r.sell_rate} ${r.currency}/USD`
    ).join("\n") || "No live rates configured yet — politely tell the customer the admin will confirm the rate manually.";

    const methodsBlock = (methods || []).map((m: any, i: number) =>
      `${i + 1}. ${m.label} (${m.type}) → ${m.details}${m.instructions ? ` — ${m.instructions}` : ""}`
    ).join("\n") || "No payment methods configured.";

    const isSell = String(order.action).toLowerCase() === "sell";

    const flowGuide = isSell
      ? `CUSTOMER IS SELLING ${order.item} TO US. Walk through these steps strictly in order, ONE question per message, waiting for the customer to answer before moving on:
  Step 1: Greet warmly + confirm what crypto/gift card they want to sell and the USD value.
  Step 2: Ask for their full name (skip if already given).
  Step 3: For gift cards → ask them to upload clear photos of the card front/back + receipt using the 📎 button. For crypto → ask their preferred network (e.g. TRC20/ERC20/BEP20) and wait.
  Step 4: Calculate GHS they will receive using the BUY rate above. Show the math briefly, e.g. "$100 × 12.5 = 1,250 GHS". Confirm the amount with them.
  Step 5: Ask for the Mobile Money number + network (MTN / Vodafone / AirtelTigo) where we should send the GHS.
  Step 6: When you have name + amount + payout MoMo number (and the card photos for gift cards, or wallet network for crypto), summarize everything and END your message with the EXACT token on its own line:
    [[NOTIFY_ADMIN]]`
      : `CUSTOMER IS BUYING ${order.item} FROM US. Walk through these steps strictly in order, ONE question per message, waiting for the customer to answer before moving on:
  Step 1: Greet warmly + confirm what they want to buy and the USD value.
  Step 2: Ask for their full name (skip if already given).
  Step 3: Calculate the GHS they need to PAY using the SELL rate above. Show the math briefly and confirm.
  Step 4: Share the payment details from the ACTIVE PAYMENT METHODS list above, formatted clearly. Tell them to use Order ID ${order.id.slice(0,8)} as the payment reference.
  Step 5: Wait until they confirm they have paid (or are ready to pay). ONLY THEN ask for their wallet address (crypto) or delivery email (gift card). Do not ask for the wallet address earlier.
  Step 6: Once you have name + payment confirmation + wallet/email, summarize everything and END your message with the EXACT token on its own line:
    [[NOTIFY_ADMIN]]`;

    const systemPrompt = `You are "SwiftBot", a calm, professional, human-like assistant for SwiftChain X (Ghana's trusted crypto & gift-card desk).

ORDER:
- Type: ${order.trade_type}
- Action: ${order.action}
- Item: ${order.item}
- Amount entered: ${order.amount ?? "not specified"} (USD)
- Customer email: ${order.customer_email ?? "unknown"}
- Order ID: ${order.id}

LIVE GHS RATES:
${ratesBlock}

ACTIVE PAYMENT METHODS:
${methodsBlock}

${flowGuide}

GOLDEN RULES — follow them strictly:
- Ask ONLY ONE question per message. Never list 4 questions at once. Wait for the answer.
- Keep messages SHORT (2–4 sentences max). Warm, polite, professional. Light emojis (💰📲✅🙏) — never excessive.
- NEVER invent rates. Use the table above. If a rate is missing, say the admin will confirm manually.
- NEVER ask for a wallet address at the start of a buy flow — only after payment is confirmed (Step 5).
- The [[NOTIFY_ADMIN]] token must appear EXACTLY ONCE per order, only after all required info is gathered. Once used, just keep the customer reassured until the admin joins.
- If the customer asks a question out of sequence (e.g. "what's your momo number?"), answer it briefly using the data above, then gently bring them back to the next step.
- You cannot mark the order completed — only the admin can.`;

    const history = msgs.map((m) => ({
      role: m.sender_role === "user" ? "user" : "assistant",
      content: m.body || (m.attachment_url ? `[Customer sent an attachment: ${m.attachment_url}]` : ""),
    })).filter(m => m.content);

    if (kind === "greet" && history.length === 0) {
      history.push({ role: "user", content: "(customer just opened the chat — greet them and ask the FIRST question only)" });
    }

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

    await supabase.from("chat_messages").insert({
      trade_id,
      sender_id: order.user_id,
      sender_role: "bot",
      body: reply,
      read_by_admin: false,
      read_by_user: true,
    });

    if (shouldNotify && !order.admin_notified) {
      // Move order into "awaiting_confirmation" — admin must explicitly confirm in dashboard
      await supabase.from("trades")
        .update({ admin_notified: true, status: "awaiting_confirmation" })
        .eq("id", trade_id);

      const summary = `${order.action?.toUpperCase()} ${order.item} · ${order.amount ?? "?"} · ${order.trade_type}\nCustomer: ${order.customer_email ?? "n/a"}\nOrder: ${order.id}`;
      const waText = encodeURIComponent(`New SwiftChain X order awaiting confirmation:\n${summary}`);
      const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${waText}`;

      await supabase.from("chat_messages").insert({
        trade_id,
        sender_id: order.user_id,
        sender_role: "bot",
        body: `⏳ *Awaiting Admin Confirmation*\nThanks! Your details have been sent to our team. A human agent will join shortly to confirm and finalize this order. (Notified ${ADMIN_EMAIL})`,
        read_by_user: true,
      });

      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
            body: JSON.stringify({
              from: "SwiftChain X <orders@resend.dev>",
              to: [ADMIN_EMAIL],
              subject: `🟢 Awaiting confirmation — ${order.action} ${order.item}`,
              html: `<h2>Order ready for confirmation</h2>
                <p><b>Type:</b> ${order.trade_type}</p>
                <p><b>Action:</b> ${order.action}</p>
                <p><b>Item:</b> ${order.item}</p>
                <p><b>Amount:</b> ${order.amount ?? "n/a"}</p>
                <p><b>Customer:</b> ${order.customer_email ?? "n/a"}</p>
                <p><b>Order ID:</b> ${order.id}</p>
                <p><a href="${waLink}">📲 WhatsApp shortcut</a></p>`,
            }),
          });
        } catch (e) { console.error("resend failed", e); }
      } else {
        console.log("RESEND_API_KEY not set — WhatsApp link:", waLink);
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
