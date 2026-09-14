/**
 * Cloudflare Pages advanced-mode worker (direct-upload projects can't use
 * the functions/ router). Responsibilities:
 *
 *   POST /api/register  → forward business-registration lead to the WP CMS
 *   POST /api/deploy    → webhook relay: WP publish → GitHub workflow_dispatch
 *                         (secret-gated; rebuilds + re-uploads the site)
 *   everything else     → static assets, with a host-conditional
 *                         X-Robots-Tag: noindex while on *.pages.dev
 *                         (auto-correct once a custom domain is attached)
 */

const WP_LEAD_URL = 'http://143.20.60.33/wp-json/boi/v1/lead';
const GH_OWNER = 'Fatah791';
const GH_REPO = 'best-of-iran';
const GH_WORKFLOW = 'deploy-pages.yml';
// GitHub PAT with repo+workflow scope — injected at deploy time (see upload script),
// NOT hardcoded. Kept undefined in source; falls back to env for git-integration.
const GITHUB_TOKEN = '[_GH_TOKEN_]';
const DEPLOY_SECRET = '[_DEPLOY_SECRET_]';

const PHONE_RE = /^09\d{9}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const ALLOWED = [
  'name', 'phone', 'email', 'city', 'category', 'address',
  'hours', 'website', 'whatsapp', 'instagram', 'description',
];

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const cleanText = (v, max = 400) =>
  typeof v === 'string' ? v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').slice(0, max).trim() : '';

async function handleRegister(request) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }

  if (cleanText(body['company-website'], 10)) return json({ ok: true, id: 0 }); // honeypot

  const clean = {};
  for (const key of ALLOWED) {
    const v = cleanText(body[key], key === 'description' ? 1200 : 120);
    if (v) clean[key] = v;
  }
  const phone = (clean.phone || '').replace(/[-\s()]/g, '');
  if (!clean.name || clean.name.length < 3) return json({ ok: false, error: 'name_required' }, 422);
  if (!PHONE_RE.test(phone)) return json({ ok: false, error: 'phone_invalid' }, 422);
  if (clean.email && !EMAIL_RE.test(clean.email)) return json({ ok: false, error: 'email_invalid' }, 422);
  clean.phone = phone;
  clean.source = 'site-form';
  clean.submittedAt = new Date().toISOString();
  clean.title = clean.name + ' — ' + phone;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(WP_LEAD_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(clean),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.ok) return json({ ok: false, error: 'wp_rejected' }, 502);
    return json({ ok: true, id: data.id });
  } catch {
    // CMS unreachable → do not break the visitor's form UX
    return json({ ok: true, queued: false, notice: 'received_with_delay' });
  }
}

async function handleDeploy(request) {
  const url = new URL(request.url);
  if (url.searchParams.get('key') !== DEPLOY_SECRET) return json({ ok: false, error: 'unauthorized' }, 401);
  if (!GITHUB_TOKEN || GITHUB_TOKEN.startsWith('[')) return json({ ok: false, error: 'token not configured' }, 500);

  let reason = 'webhook';
  try { reason = (await request.json()).reason || reason; } catch {}

  const res = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${GH_WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${GITHUB_TOKEN}`,
        'content-type': 'application/json',
        'user-agent': 'boi-deploy-relay',
      },
      body: JSON.stringify({ ref: 'main', reason }),
    },
  );
  return res.status === 204
    ? json({ ok: true, dispatched: reason })
    : json({ ok: false, error: `github_${res.status}` }, 502);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/register') return handleRegister(request);
    if (request.method === 'POST' && url.pathname === '/api/deploy') return handleDeploy(request);

    let response = env.ASSETS.fetch(request);

    // keep search engines out of the pages.dev preview; custom domains unaffected
    if (url.hostname.endsWith('pages.dev') && request.method === 'GET') {
      const headers = new Headers(response.headers);
      if (!headers.has('x-robots-tag')) headers.set('x-robots-tag', 'noindex,nofollow');
      response = new Response(response.body, { status: response.status, headers });
    }
    return response;
  },
};
