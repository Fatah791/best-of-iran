/** Set GH Actions secrets using real libsodium sealed-box. */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const path = 'C:/Users/tarahi/boi/_lsd/';
const Module = require('module');
const orig = Module._resolveFilename;
Module._resolveFilename = function (req, ...a) {
  if (req === 'libsodium') return path + 'libsodium.js';
  return orig.call(this, req, ...a);
};
const s = require(path + 'wrappers.js');
await s.ready;

const sec = JSON.parse(readFileSync('C:/Users/tarahi/boi/deploy-secrets.json', 'utf8'));
const ghToken = sec.GH_RELAY_TOKEN;
const CF_T = readFileSync('C:/Users/tarahi/boi/cf-token.txt', 'utf8').trim();
const REPO = 'Fatah791/best-of-iran';
const H = { authorization: `Bearer ${ghToken}`, accept: 'application/vnd.github+json', 'user-agent': 'boi' };

const pk = await (await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/public-key`, { headers: H })).json();
const seal = (plain) => {
  const msg = s.from_string(plain);
  const recipient = s.from_base64(pk.key, s.base64_variants.ORIGINAL);
  return s.to_base64(s.crypto_box_seal(msg, recipient), s.base64_variants.ORIGINAL);
};

for (const [name, value] of [['CF_PAGES_TOKEN', CF_T], ['WP_API_URL', 'http://143.20.60.33/wp-json']]) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/${name}`, {
    method: 'PUT',
    headers: { ...H, 'content-type': 'application/json' },
    body: JSON.stringify({ encrypted_value: seal(value), key_id: pk.key_id }),
  });
  console.log(name, '->', r.status, r.ok ? 'SET ✓' : (await r.text()).slice(0, 100));
}
