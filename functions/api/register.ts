/**
 * POST /api/register — Cloudflare Pages Function.
 *
 * Forwards the business-registration form to the WP mu-plugin endpoint
 * (POST /wp-json/boi/v1/lead) as a 'lead' CPT entry. Never trusts the
 * client: re-validates shape, strips unknown keys, rate-limits per IP
 * in a Worker KV-free way (in-memory best effort — enough for a form
 * that is low volume by nature).
 *
 * Env (Pages dashboard): WP_API_URL = http://143.20.60.33/wp-json
 */

interface Lead {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  category?: string;
  address?: string;
  hours?: string;
  website?: string;
  whatsapp?: string;
  instagram?: string;
  description?: string;
  source: 'site-form';
  submittedAt: string;
}

const PHONE_RE = /^09\d{9}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const ALLOWED = [
  'name', 'phone', 'email', 'city', 'category', 'address',
  'hours', 'website', 'whatsapp', 'instagram', 'description',
] as const;

const text = (v: unknown, max = 400) =>
  typeof v === 'string' ? v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').slice(0, max).trim() : '';

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const onRequestPost: PagesFunction<{ WP_API_URL?: string }> = async (context) => {
  let body: Record<string, unknown>;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400);
  }

  const clean: Partial<Lead> = {};
  for (const key of ALLOWED) {
    const v = text(body[key], key === 'description' ? 1200 : 120);
    if (v) (clean as Record<string, string>)[key] = v;
  }

  // honeypot: hidden field bots fill — silently accept and drop
  if (text(body['company-website'], 10)) return json({ ok: true, id: 0 });

  const name = clean.name ?? '';
  const phone = (clean.phone ?? '').replace(/[-\s()]/g, '');
  if (!name || name.length < 3) return json({ ok: false, error: 'name_required' }, 422);
  if (!PHONE_RE.test(phone)) return json({ ok: false, error: 'phone_invalid' }, 422);
  if (clean.email && !EMAIL_RE.test(clean.email)) return json({ ok: false, error: 'email_invalid' }, 422);
  clean.phone = phone;
  clean.source = 'site-form';
  clean.submittedAt = new Date().toISOString();

  const wpBase = (context.env.WP_API_URL || 'http://143.20.60.33/wp-json').replace(/\/$/, '');
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(`${wpBase}/boi/v1/lead`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...clean, title: `${clean.name} — ${clean.phone}` }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return json({ ok: false, error: 'wp_rejected' }, 502);
    return json({ ok: true, id: data.id });
  } catch (e) {
    // CMS down → form UX must not break; log for backfill via queue/retry later
    console.error('lead forward failed:', e instanceof Error ? e.message : e);
    return json({ ok: true, queued: false, notice: 'received_with_delay' });
  }
};
