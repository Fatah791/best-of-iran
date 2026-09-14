/**
 * Debug endpoint: POST /api/register-test
 * Tests WP connectivity from Pages runtime.
 */

const WP_LEAD_URL = 'http://143.20.60.33/wp-json/boi/v1/lead';

export const onRequestPost = async (context) => {
  const url = new URL(context.request.url);
  const wpBase = context.env.WP_API_URL || 'http://143.20.60.33/wp-json';
  
  // Step 1: Try WP health
  let wpStatus = 'unknown';
  let wpBody = '';
  try {
    const r = await fetch(`${wpBase.replace(/\/$/, '')}/boi/v1/lead`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'debug', phone: '09120000000', title: 'debug - 09120000000', source: 'test', submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(15000),
    });
    wpStatus = r.status;
    wpBody = await r.text();
  } catch (e) {
    wpStatus = 'error';
    wpBody = String(e);
  }

  return new Response(JSON.stringify({
    ok: true,
    wp_url: wpBase,
    wp_status: wpStatus,
    wp_body: wpBody.slice(0, 300),
    env_keys: Object.keys(context.env),
  }), {
    headers: { 'content-type': 'application/json' },
  });
};
