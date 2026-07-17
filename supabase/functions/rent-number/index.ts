import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const FIVESIM = 'https://5sim.net/v1';
const API_KEY = Deno.env.get('FIVESIM_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

// Curated services with GHS prices. Admin can extend later.
const CATALOG: Record<string, { name: string; price_ghs: number }> = {
  telegram:  { name: 'Telegram',   price_ghs: 15 },
  whatsapp:  { name: 'WhatsApp',   price_ghs: 20 },
  google:    { name: 'Google / Gmail', price_ghs: 12 },
  facebook:  { name: 'Facebook',   price_ghs: 15 },
  instagram: { name: 'Instagram',  price_ghs: 15 },
  twitter:   { name: 'Twitter / X',price_ghs: 15 },
  tiktok:    { name: 'TikTok',     price_ghs: 15 },
  signal:    { name: 'Signal',     price_ghs: 15 },
  discord:   { name: 'Discord',    price_ghs: 12 },
  uber:      { name: 'Uber',       price_ghs: 20 },
  bolt:      { name: 'Bolt',       price_ghs: 20 },
  airbnb:    { name: 'Airbnb',     price_ghs: 20 },
  amazon:    { name: 'Amazon',     price_ghs: 20 },
  microsoft: { name: 'Microsoft',  price_ghs: 12 },
  apple:     { name: 'Apple',      price_ghs: 15 },
  openai:    { name: 'OpenAI / ChatGPT', price_ghs: 15 },
  linkedin:  { name: 'LinkedIn',   price_ghs: 15 },
  binance:   { name: 'Binance',    price_ghs: 20 },
  paypal:    { name: 'PayPal',     price_ghs: 25 },
  other:     { name: 'Other service', price_ghs: 25 },
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

    // ── list catalog / countries ─────────────────────────────────
    if (action === 'catalog') {
      return json({
        services: Object.entries(CATALOG).map(([k, v]) => ({ id: k, ...v })),
        countries: Object.entries(COUNTRIES).map(([k, v]) => ({ id: k, name: v })),
      });
    }

    // ── create rental (pending payment) ──────────────────────────
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

    // ── admin: confirm payment & provision from 5sim ─────────────
    if (action === 'provision') {
      if (!isAdmin) return json({ error: 'Admin only' }, 403);
      const rentalId = String(body.rental_id || '');
      const { data: rental } = await admin.from('number_rentals').select('*').eq('id', rentalId).single();
      if (!rental) return json({ error: 'Rental not found' }, 404);
      if (rental.provider_order_id) return json({ error: 'Already provisioned', rental }, 400);

      const country = rental.country || 'any';
      const buy = await fivesim(`/user/buy/activation/${country}/any/${rental.service}`);
      // 5sim response: { id, phone, product, price, status, expires, sms:[] }
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

    // ── poll for SMS ─────────────────────────────────────────────
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

    // ── cancel ────────────────────────────────────────────────────
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
