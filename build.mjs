// node build.mjs → for each name in guests.txt writes i/<slug>/index.html + og.jpg (WhatsApp preview), plus the shared og.jpg.
// Needs macOS (Google Chrome + sips). Re-run after editing guests.txt or index.html, then commit and push.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://frannotsleep.github.io/wedding-invitation/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname);

export const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function card(name, out) {
  const png = join(tmpdir(), 'og-card.png');
  const url = pathToFileURL(join(root, 'og-card.html')).href + (name ? '?name=' + encodeURIComponent(name) : '');
  execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630',
    '--virtual-time-budget=8000', '--allow-file-access-from-files', `--screenshot=${png}`, url], { stdio: 'ignore' });
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '86', png, '--out', out], { stdio: 'ignore' });
}

function page(name, s) {
  const n = esc(name), url = `${SITE}i/${s}/`;
  const og = `<meta name="description" content="${n}, te invitamos a celebrar nuestra boda. Sábado 12 de diciembre de 2026.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Francisco &amp; Crismari">
<meta property="og:title" content="${n}, tienes una invitación">
<meta property="og:description" content="Francisco &amp; Crismari · Sábado 12 de diciembre de 2026">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${url}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Invitación dedicada a ${n}">
<meta property="og:locale" content="es_DO">
<meta name="twitter:card" content="summary_large_image">`;
  const src = readFileSync(join(root, 'index.html'), 'utf8');
  const html = src
    .replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../../">')
    .replace(/<title>.*?<\/title>/, `<title>Invitación para ${n} · Francisco &amp; Crismari</title>`)
    .replace(/<!--og-->[\s\S]*?<!--\/og-->/, og)
    .replace('>Invitado especial<', `>${n}<`);
  if (html === src || html.includes('>Invitado especial<')) throw new Error('index.html markers changed; update build.mjs');
  return html;
}

if (process.argv[1] === import.meta.filename) {
  const guests = readFileSync(join(root, 'guests.txt'), 'utf8').split('\n').map(l => l.trim().replace(/\s+/g, ' ')).filter(l => l && !l.startsWith('#'));
  const slugs = guests.map(slug);
  const dup = slugs.find((s, i) => slugs.indexOf(s) !== i);
  if (dup) throw new Error(`two guests share the link /i/${dup}/ — make the names distinct`);

  rmSync(join(root, 'i'), { recursive: true, force: true }); // ponytail: full rebuild each run, fine for a guest list
  card('', join(root, 'og.jpg'));
  guests.forEach((g, k) => {
    const dir = join(root, 'i', slugs[k]);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), page(g, slugs[k]));
    card(g, join(dir, 'og.jpg'));
    console.log(`${SITE}i/${slugs[k]}/`);
  });
  writeFileSync(join(root, 'links.txt'), guests.map((g, k) => `${g}: ${SITE}i/${slugs[k]}/`).join('\n') + '\n');
}
