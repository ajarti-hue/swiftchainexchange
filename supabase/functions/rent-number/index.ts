import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const FIVESIM = 'https://5sim.net/v1';
const API_KEY = Deno.env.get('FIVESIM_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

type Cat =
  | 'Messaging'
  | 'Social'
  | 'Dating'
  | 'Shopping'
  | 'Ride & Delivery'
  | 'Finance & Crypto'
  | 'Streaming & Gaming'
  | 'Productivity'
  | 'Other';

// Curated services with GHS prices and categories.
const CATALOG: Record<string, { name: string; price_ghs: number; category: Cat; emoji: string }> = {
  // Messaging
  telegram:  { name: 'Telegram',       price_ghs: 15, category: 'Messaging', emoji: '✈️' },
  whatsapp:  { name: 'WhatsApp',       price_ghs: 20, category: 'Messaging', emoji: '💬' },
  signal:    { name: 'Signal',         price_ghs: 15, category: 'Messaging', emoji: '🔒' },
  viber:     { name: 'Viber',          price_ghs: 15, category: 'Messaging', emoji: '📞' },
  wechat:    { name: 'WeChat',         price_ghs: 18, category: 'Messaging', emoji: '💚' },
  line:      { name: 'LINE',           price_ghs: 15, category: 'Messaging', emoji: '🟢' },
  kakaotalk: { name: 'KakaoTalk',      price_ghs: 15, category: 'Messaging', emoji: '💛' },
  discord:   { name: 'Discord',        price_ghs: 12, category: 'Messaging', emoji: '🎮' },

  // Social
  facebook:  { name: 'Facebook',       price_ghs: 15, category: 'Social', emoji: '📘' },
  instagram: { name: 'Instagram',      price_ghs: 15, category: 'Social', emoji: '📷' },
  twitter:   { name: 'Twitter / X',    price_ghs: 15, category: 'Social', emoji: '🐦' },
  tiktok:    { name: 'TikTok',         price_ghs: 15, category: 'Social', emoji: '🎵' },
  snapchat:  { name: 'Snapchat',       price_ghs: 15, category: 'Social', emoji: '👻' },
  linkedin:  { name: 'LinkedIn',       price_ghs: 15, category: 'Social', emoji: '💼' },
  reddit:    { name: 'Reddit',         price_ghs: 12, category: 'Social', emoji: '👽' },
  pinterest: { name: 'Pinterest',      price_ghs: 12, category: 'Social', emoji: '📌' },
  youtube:   { name: 'YouTube',        price_ghs: 12, category: 'Social', emoji: '▶️' },

  // Dating
  tinder:    { name: 'Tinder',         price_ghs: 20, category: 'Dating', emoji: '🔥' },
  bumble:    { name: 'Bumble',         price_ghs: 20, category: 'Dating', emoji: '🐝' },
  hinge:     { name: 'Hinge',          price_ghs: 20, category: 'Dating', emoji: '💘' },
  badoo:     { name: 'Badoo',          price_ghs: 18, category: 'Dating', emoji: '💜' },
  grindr:    { name: 'Grindr',         price_ghs: 20, category: 'Dating', emoji: '🌈' },
  okcupid:   { name: 'OkCupid',        price_ghs: 18, category: 'Dating', emoji: '💗' },

  // Shopping
  amazon:    { name: 'Amazon',         price_ghs: 20, category: 'Shopping', emoji: '📦' },
  ebay:      { name: 'eBay',           price_ghs: 18, category: 'Shopping', emoji: '🛒' },
  aliexpress:{ name: 'AliExpress',     price_ghs: 15, category: 'Shopping', emoji: '🛍️' },
  shein:     { name: 'SHEIN',          price_ghs: 15, category: 'Shopping', emoji: '👗' },
  temu:      { name: 'Temu',           price_ghs: 15, category: 'Shopping', emoji: '🎁' },
  walmart:   { name: 'Walmart',        price_ghs: 18, category: 'Shopping', emoji: '🏪' },
  etsy:      { name: 'Etsy',           price_ghs: 18, category: 'Shopping', emoji: '🧵' },

  // Ride & Delivery
  uber:      { name: 'Uber',           price_ghs: 20, category: 'Ride & Delivery', emoji: '🚗' },
  bolt:      { name: 'Bolt',           price_ghs: 20, category: 'Ride & Delivery', emoji: '⚡' },
  lyft:      { name: 'Lyft',           price_ghs: 20, category: 'Ride & Delivery', emoji: '🚕' },
  ubereats:  { name: 'Uber Eats',      price_ghs: 18, category: 'Ride & Delivery', emoji: '🍔' },
  doordash:  { name: 'DoorDash',       price_ghs: 18, category: 'Ride & Delivery', emoji: '🛵' },
  grubhub:   { name: 'Grubhub',        price_ghs: 18, category: 'Ride & Delivery', emoji: '🍟' },
  airbnb:    { name: 'Airbnb',         price_ghs: 20, category: 'Ride & Delivery', emoji: '🏠' },

  // Finance & Crypto
  paypal:    { name: 'PayPal',         price_ghs: 25, category: 'Finance & Crypto', emoji: '💳' },
  cashapp:   { name: 'Cash App',       price_ghs: 25, category: 'Finance & Crypto', emoji: '💵' },
  venmo:     { name: 'Venmo',          price_ghs: 25, category: 'Finance & Crypto', emoji: '💸' },
  revolut:   { name: 'Revolut',        price_ghs: 25, category: 'Finance & Crypto', emoji: '🏦' },
  wise:      { name: 'Wise',           price_ghs: 22, category: 'Finance & Crypto', emoji: '🌍' },
  binance:   { name: 'Binance',        price_ghs: 20, category: 'Finance & Crypto', emoji: '🪙' },
  coinbase:  { name: 'Coinbase',       price_ghs: 22, category: 'Finance & Crypto', emoji: '🔷' },
  kucoin:    { name: 'KuCoin',         price_ghs: 20, category: 'Finance & Crypto', emoji: '🟢' },
  bybit:     { name: 'Bybit',          price_ghs: 20, category: 'Finance & Crypto', emoji: '⚫' },

  // Streaming & Gaming
  netflix:   { name: 'Netflix',        price_ghs: 20, category: 'Streaming & Gaming', emoji: '🎬' },
  spotify:   { name: 'Spotify',        price_ghs: 15, category: 'Streaming & Gaming', emoji: '🎧' },
  twitch:    { name: 'Twitch',         price_ghs: 15, category: 'Streaming & Gaming', emoji: '🎮' },
  steam:     { name: 'Steam',          price_ghs: 18, category: 'Streaming & Gaming', emoji: '🎯' },
  epicgames: { name: 'Epic Games',     price_ghs: 18, category: 'Streaming & Gaming', emoji: '🏆' },
  roblox:    { name: 'Roblox',         price_ghs: 15, category: 'Streaming & Gaming', emoji: '🟥' },

  // Productivity
  google:    { name: 'Google / Gmail', price_ghs: 12, category: 'Productivity', emoji: '🔍' },
  microsoft: { name: 'Microsoft',      price_ghs: 12, category: 'Productivity', emoji: '🪟' },
  apple:     { name: 'Apple ID',       price_ghs: 15, category: 'Productivity', emoji: '🍎' },
  openai:    { name: 'OpenAI / ChatGPT', price_ghs: 15, category: 'Productivity', emoji: '🤖' },
  yahoo:     { name: 'Yahoo',          price_ghs: 12, category: 'Productivity', emoji: '📧' },
  dropbox:   { name: 'Dropbox',        price_ghs: 12, category: 'Productivity', emoji: '📁' },
  zoom:      { name: 'Zoom',           price_ghs: 12, category: 'Productivity', emoji: '🎥' },
  notion:    { name: 'Notion',         price_ghs: 12, category: 'Productivity', emoji: '📝' },

  // Other
  other:     { name: 'Other service',  price_ghs: 25, category: 'Other', emoji: '➕' },
};

const COUNTRIES: Record<string, string> = {
  any: 'Any country', russia: 'Russia', england: 'United Kingdom', usa: 'USA',
  ukraine: 'Ukraine', kazakhstan: 'Kazakhstan', philippines: 'Philippines',
  indonesia: 'Indonesia', india: 'India', vietnam: 'Vietnam', nigeria: 'Nigeria',
  ghana: 'Ghana', southafrica: 'South Africa',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function fivesim(path: string) {
  if (!API_KEY) throw new Error('FIVESIM_API_KEY is not configured');
  const r = await fetch(`${FIVESIM}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}`, Accept: 'application/json' },
  });
  const text = await r.text();
  if (!r.ok) {
    console.error(`5sim ${path} failed [${r.status}]: ${text}`);
    throw new Error(`5sim error ${r.status}: ${text}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: userRes } = await userClient.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: 'Not authenticated' }, 401);

    const { data: adminFlag } = await admin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isAdmin = !!adminFlag;

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');

    if (action === 'catalog') {
      return json({
        services: Object.entries(CATALOG).map(([k, v]) => ({ id: k, ...v })),
        countries: Object.entries(COUNTRIES).map(([k, v]) => ({ id: k, name: v })),
      });
    }

    if (action === 'create') {
      const service = String(body.service || '');
      const country = String(body.country || 'any');
      const cat = CATALOG[service];
      if (!cat) return json({ error: 'Unknown service' }, 400);
      const cname = COUNTRIES[country] ?? 'Any country';

      const ref = 'NR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data, error } = await admin.from('number_rentals').insert({
        user_id: user.id,
        service, service_name: cat.name,
        country, country_name: cname,
        price_ghs: cat.price_ghs,
        momo_reference: ref,
        status: 'pending_payment',
      }).select('*').single();
      if (error) return json({ error: error.message }, 500);
      return json({ rental: data });
    }

    if (action === 'provision') {
      if (!isAdmin) return json({ error: 'Admin only' }, 403);
      const rentalId = String(body.rental_id || '');
      const { data: rental } = await admin.from('number_rentals').select('*').eq('id', rentalId).single();
      if (!rental) return json({ error: 'Rental not found' }, 404);
      if (rental.provider_order_id) return json({ error: 'Already provisioned', rental }, 400);

      const country = rental.country || 'any';
      const buy = await fivesim(`/user/buy/activation/${country}/any/${rental.service}`);
      const expiresAt = buy.expires ? new Date(buy.expires).toISOString() : null;

      const { data: updated, error: uErr } = await admin.from('number_rentals').update({
        provider_order_id: String(buy.id),
        phone_number: buy.phone,
        provider_expires_at: expiresAt,
        status: 'waiting_sms',
      }).eq('id', rentalId).select('*').single();
      if (uErr) return json({ error: uErr.message }, 500);
      return json({ rental: updated, provider: buy });
    }

    if (action === 'check') {
      const rentalId = String(body.rental_id || '');
      const { data: rental } = await admin.from('number_rentals').select('*').eq('id', rentalId).single();
      if (!rental) return json({ error: 'Rental not found' }, 404);
      if (rental.user_id !== user.id && !isAdmin) return json({ error: 'Forbidden' }, 403);
      if (!rental.provider_order_id) return json({ rental });

      const info = await fivesim(`/user/check/${rental.provider_order_id}`);
      const sms = Array.isArray(info.sms) && info.sms.length ? info.sms[info.sms.length - 1] : null;
      const patch: Record<string, unknown> = {};

      if (sms && !rental.sms_code) {
        patch.sms_sender = sms.sender ?? null;
        patch.sms_code = sms.code ?? null;
        patch.sms_text = sms.text ?? null;
        patch.sms_received_at = sms.date ? new Date(sms.date).toISOString() : new Date().toISOString();
        patch.status = 'sms_received';
      } else if (info.status === 'TIMEOUT' || info.status === 'CANCELED' || info.status === 'BANNED') {
        patch.status = 'expired';
      }
      if (Object.keys(patch).length) {
        const { data: upd } = await admin.from('number_rentals').update(patch).eq('id', rentalId).select('*').single();
        return json({ rental: upd, provider: info });
      }
      return json({ rental, provider: info });
    }

    if (action === 'cancel') {
      const rentalId = String(body.rental_id || '');
      const { data: rental } = await admin.from('number_rentals').select('*').eq('id', rentalId).single();
      if (!rental) return json({ error: 'Rental not found' }, 404);
      if (rental.user_id !== user.id && !isAdmin) return json({ error: 'Forbidden' }, 403);

      if (rental.provider_order_id && rental.status !== 'sms_received') {
        try { await fivesim(`/user/cancel/${rental.provider_order_id}`); } catch (e) { console.warn('cancel err', e); }
      }
      const { data: upd } = await admin.from('number_rentals').update({
        status: 'cancelled',
        cancel_reason: String(body.reason || 'user_cancelled'),
      }).eq('id', rentalId).select('*').single();
      return json({ rental: upd });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('rent-number error', e);
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
