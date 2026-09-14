/**
 * POST /api/deploy — webhook relay.
 *
 * The WP mu-plugin fires this (with ?key=SECRET) on every publish/update of a
 * business or article. We forward it to the GitHub Actions workflow_dispatch,
 * which rebuilds the site from WP content and re-deploys to Cloudflare Pages.
 *
 * Secrets are Pages project environment variables (set via API), never in code:
 *   GH_WORKFLOW_TOKEN — GitHub PAT (contents:read + workflow:write on the repo)
 *   DEPLOY_SECRET     — shared secret the WP server must send as ?key=
 */

const GH_OWNER = 'Fatah791';
const GH_REPO = 'best-of-iran';
const GH_WORKFLOW = 'deploy-pages.yml';

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const onRequestPost: PagesFunction<{ GH_WORKFLOW_TOKEN?: string; DEPLOY_SECRET?: string }> = async (
  context,
) => {
  const url = new URL(context.request.url);
  const secret = context.env.DEPLOY_SECRET || '';
  if (!secret || url.searchParams.get('key') !== secret) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }

  const token = context.env.GH_WORKFLOW_TOKEN;
  if (!token) return json({ ok: false, error: 'token_not_configured' }, 500);

  let reason = 'webhook';
  try {
    const body = (await context.request.json()) as { reason?: string };
    if (body?.reason) reason = body.reason;
  } catch {
    /* no body is fine */
  }

  const res = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${GH_WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': 'boi-deploy-relay',
      },
      body: JSON.stringify({ ref: 'main', inputs: { reason } }),
    },
  );

  return res.status === 204
    ? json({ ok: true, dispatched: reason })
    : json({ ok: false, error: `github_${res.status}` }, 502);
};
