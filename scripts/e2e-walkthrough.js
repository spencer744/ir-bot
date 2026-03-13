/**
 * E2E API walkthrough - exercises backend endpoints for the full investor flow.
 * Run: node scripts/e2e-walkthrough.js
 * Requires: server on :3001
 */
const http = require('http');
const BASE = 'http://127.0.0.1:3001';
const DEAL_SLUG = 'parkview-commons';

function request(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
    }, (r) => {
      let body = '';
      r.on('data', c => body += c);
      r.on('end', () => resolve({ status: r.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(15000);
    if (opts.body) req.write(typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

async function main() {
  const bugs = [];
  console.log('=== E2E Walkthrough ===\n');

  // 1. Root / - should redirect or show deal list?
  try {
    const r = await request(BASE + '/api/deal/' + DEAL_SLUG);
    const data = JSON.parse(r.body);
    if (r.status !== 200) bugs.push({ step: 'GET deal', error: `Status ${r.status}`, body: r.body });
    else if (!data.deal) bugs.push({ step: 'GET deal', error: 'No deal in response' });
    else {
      console.log('✓ Deal loaded:', data.deal.name);
      if (!data.deal.hero_image_url) bugs.push({ step: 'Deal hero_image_url', error: 'Empty hero_image_url - Gate may show blank background' });
    }
  } catch (e) {
    bugs.push({ step: 'GET deal', error: e.message });
  }

  // 2. Register (Gate)
  let token;
  try {
    const r = await request(BASE + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'E2E',
        last_name: 'Tester',
        email: 'e2e-' + Date.now() + '@test.com',
        phone: '555-123-4567',
        deal_slug: DEAL_SLUG,
      }),
    });
    const data = JSON.parse(r.body);
    if (r.status !== 200) bugs.push({ step: 'Auth register', error: `Status ${r.status}`, body: r.body });
    else {
      token = data.token;
      console.log('✓ Gate registration OK');
    }
  } catch (e) {
    bugs.push({ step: 'Auth register', error: e.message });
  }

  if (!token) {
    console.log('Cannot continue without token. Bugs so far:', bugs.length);
    console.log(JSON.stringify(bugs, null, 2));
    return;
  }

  // 3. Verify session
  try {
    const r = await request(BASE + '/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({}),
    });
    const data = JSON.parse(r.body);
    if (r.status !== 200) bugs.push({ step: 'Auth verify', error: `Status ${r.status}`, body: r.body });
    else console.log('✓ Auth verify OK');
  } catch (e) {
    bugs.push({ step: 'Auth verify', error: e.message });
  }

  // 4. Deal sensitivity
  try {
    const r = await request(BASE + '/api/deal/' + DEAL_SLUG + '/sensitivity');
    const data = JSON.parse(r.body);
    if (r.status !== 200) bugs.push({ step: 'Sensitivity', error: `Status ${r.status}` });
    else if (!data.scenarios) bugs.push({ step: 'Sensitivity', error: 'Missing scenarios' });
    else console.log('✓ Sensitivity OK');
  } catch (e) {
    bugs.push({ step: 'Sensitivity', error: e.message });
  }

  // 5. Deal media
  try {
    const r = await request(BASE + '/api/deal/' + DEAL_SLUG + '/media');
    const data = JSON.parse(r.body);
    if (r.status !== 200) bugs.push({ step: 'Media', error: `Status ${r.status}` });
    else if (!data.media || !Array.isArray(data.media)) bugs.push({ step: 'Media', error: 'Missing or invalid media array' });
    else console.log('✓ Media OK, count:', data.media.length);
  } catch (e) {
    bugs.push({ step: 'Media', error: e.message });
  }

  // 6. Market data
  try {
    const r = await request(BASE + '/api/deal/' + DEAL_SLUG + '/market');
    const data = JSON.parse(r.body);
    if (r.status !== 200) bugs.push({ step: 'Market', error: `Status ${r.status}` });
    else console.log('✓ Market OK, has data:', !!data.market_data);
  } catch (e) {
    bugs.push({ step: 'Market', error: e.message });
  }

  // 7. Business plan
  try {
    const r = await request(BASE + '/api/deal/' + DEAL_SLUG + '/business-plan');
    const data = JSON.parse(r.body);
    if (r.status !== 200) bugs.push({ step: 'Business plan', error: `Status ${r.status}` });
    else console.log('✓ Business plan OK, has data:', !!data.business_plan_data);
  } catch (e) {
    bugs.push({ step: 'Business plan', error: e.message });
  }

  // 8. Team routes
  try {
    const r = await request(BASE + '/api/team/track-record', { headers: { 'Authorization': 'Bearer ' + token } });
    const data = JSON.parse(r.body);
    if (r.status !== 200) bugs.push({ step: 'Team track-record', error: `Status ${r.status}`, body: r.body?.slice(0, 200) });
    else console.log('✓ Team track-record OK');
  } catch (e) {
    bugs.push({ step: 'Team track-record', error: e.message });
  }

  // 9. Chat (streaming - just check it starts)
  try {
    const r = await request(BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ message: 'Hello', deal_slug: DEAL_SLUG }),
    });
    if (r.status !== 200) bugs.push({ step: 'Chat', error: `Status ${r.status}`, body: r.body?.slice(0, 200) });
    else console.log('✓ Chat OK');
  } catch (e) {
    bugs.push({ step: 'Chat', error: e.message });
  }

  // 10. PPM request / interest indication - need to find the route
  try {
    const r = await request(BASE + '/api/deal/' + DEAL_SLUG + '/ppm-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({}),
    });
    if (r.status === 404) bugs.push({ step: 'PPM request', error: 'Route may not exist or different path' });
    else if (r.status >= 400 && r.status !== 404) bugs.push({ step: 'PPM request', error: `Status ${r.status}`, body: r.body?.slice(0, 200) });
    else console.log('✓ PPM request OK');
  } catch (e) {
    bugs.push({ step: 'PPM request', error: e.message });
  }

  console.log('\n=== Bug List ===');
  console.log(JSON.stringify(bugs, null, 2));
}

main().catch(e => console.error('Fatal:', e));
