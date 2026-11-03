/**
 * Gera um PREVIEW ESTÁTICO navegável do site (sem precisar do Next.js instalado).
 * Uso: node scripts/build-preview.mjs  → saída em ./preview
 *
 * Como funciona:
 *  1. Descobre as rotas em app/**\/page.tsx (incluindo [slug] via generateStaticParams).
 *  2. Compila com esbuild, trocando next/link, next/image e next/navigation por shims.
 *  3. Renderiza cada rota no servidor (react-dom/server) e hidrata no navegador.
 * Em produção use `npm run build` (Next.js). Este script serve apenas para revisão visual.
 */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'preview');
const TMP = path.join(ROOT, '.preview-tmp');
const NODE_PATHS = (process.env.NODE_PATH || '').split(':').filter(Boolean);

// ---- 1. Rotas
function findPages(dir, segs = []) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...findPages(path.join(dir, e.name), [...segs, e.name]));
    else if (e.name === 'page.tsx') out.push({ file: path.join(dir, e.name), segs });
  }
  return out;
}
const pages = findPages(path.join(ROOT, 'app')).map((p, i) => ({
  ...p,
  id: `P${i}`,
  pattern: '/' + p.segs.join('/'),
}));

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
const rel = (f) => './' + path.relative(TMP, f).replace(/\\/g, '/').replace(/\.tsx$/, '');
const registry =
  pages.map((p) => `import * as ${p.id} from '${rel(p.file)}';`).join('\n') +
  `\nexport const routes = [${pages.map((p) => `{ pattern: ${JSON.stringify(p.pattern)}, mod: ${p.id} }`).join(', ')}];\n`;
fs.writeFileSync(path.join(TMP, 'routes.ts'), registry);

fs.writeFileSync(
  path.join(TMP, 'server.tsx'),
  `import { renderToString } from 'react-dom/server';
import { routes } from './routes';
import { AppShell } from '${rel(path.join(ROOT, 'components/layout/AppShell.tsx'))}';
export async function expand() {
  const list: { pattern: string; params: Record<string, string>; path: string }[] = [];
  for (const r of routes) {
    const m: any = r.mod;
    if (r.pattern.includes('[')) {
      const ps = m.generateStaticParams ? await m.generateStaticParams() : [];
      for (const p of ps) list.push({ pattern: r.pattern, params: p, path: r.pattern.replace(/\\[(\\w+)\\]/g, (_: string, k: string) => p[k]) });
    } else list.push({ pattern: r.pattern, params: {}, path: r.pattern });
  }
  return list;
}
export async function render(pattern: string, params: Record<string, string>) {
  const r: any = routes.find((x) => x.pattern === pattern);
  const m = r.mod;
  const args = { params: Promise.resolve(params), searchParams: Promise.resolve({}) };
  const el = await m.default(args);
  const meta = m.generateMetadata ? await m.generateMetadata(args) : m.metadata ?? {};
  return { html: renderToString(<AppShell>{el}</AppShell>), meta };
}
`,
);

fs.writeFileSync(
  path.join(TMP, 'client.tsx'),
  `import { hydrateRoot } from 'react-dom/client';
import { routes } from './routes';
import { AppShell } from '${rel(path.join(ROOT, 'components/layout/AppShell.tsx'))}';
(async () => {
  const w: any = window;
  const r: any = routes.find((x) => x.pattern === w.__HBSP_ROUTE__);
  const args = { params: Promise.resolve(w.__HBSP_PARAMS__ || {}), searchParams: Promise.resolve({}) };
  const el = await r.mod.default(args);
  hydrateRoot(document.getElementById('__app')!, <AppShell>{el}</AppShell>, {
    onRecoverableError: (e: unknown) => console.warn('[hydrate]', e),
  });
})();
`,
);

// ---- 2. Build
const shim = (f) => path.join(ROOT, 'scripts/preview', f);
const alias = {
  'next/link': shim('next-link.tsx'),
  'next/image': shim('next-image.tsx'),
  'next/navigation': shim('next-navigation.ts'),
  '@': ROOT,
};
const define = {
  'process.env.NODE_ENV': '"production"',
  'process.env.NEXT_PUBLIC_SITE_URL': '""',
  'process.env.NEXT_PUBLIC_API_URL': '""',
  'process.env.NEXT_PUBLIC_SHOW_VALIDATION_FLAGS': '"true"',
};
const common = { bundle: true, jsx: 'automatic', alias, define, nodePaths: NODE_PATHS, logLevel: 'warning', loader: { '.css': 'empty' } };

await build({ ...common, entryPoints: [path.join(TMP, 'server.tsx')], outfile: path.join(TMP, 'server.mjs'), platform: 'node', format: 'esm', packages: 'external' });
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, '_assets'), { recursive: true });
await build({ ...common, entryPoints: [path.join(TMP, 'client.tsx')], outfile: path.join(OUT, '_assets/app.js'), platform: 'browser', format: 'iife', minify: true, target: 'es2020' });

// ---- 3. Render
const req = createRequire(path.join(TMP, 'x.js'));
for (const p of NODE_PATHS) process.env.NODE_PATH = p; // eslint-disable-line
const srv = await import(pathToFileURL(path.join(TMP, 'server.mjs')).href);
const list = await srv.expand();

// CSS e assets públicos
// Fontes embutidas (data URI) para o preview funcionar até aberto direto do disco (file://)
let css = fs.readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8').replace(/url\('\/fonts\/([^']+)'\) format\('woff'\)/g, (_, f) => `url(data:font/woff;base64,${fs.readFileSync(path.join(ROOT, 'public/fonts', f)).toString('base64')}) format('woff')`);
css = css.replace(/url\('\/videos\//g, "url('../videos/");
fs.writeFileSync(path.join(OUT, '_assets/globals.css'), css);
fs.cpSync(path.join(ROOT, 'public'), OUT, { recursive: true });

const TEMPLATE = (title) => `%s · Hospital São Paulo de Cacoal`.replace('%s', title);
let count = 0;
for (const r of list) {
  const depth = r.path === '/' ? 0 : r.path.split('/').filter(Boolean).length;
  const base = '../'.repeat(depth);
  globalThis.__HBSP_BASE__ = base;
  globalThis.__HBSP_PATH__ = r.path;
  const { html, meta } = await srv.render(r.pattern, r.params);
  const t = meta.title;
  const title = typeof t === 'string' ? TEMPLATE(t) : t?.absolute || t?.default || 'Hospital São Paulo de Cacoal';
  const desc = meta.description || '';
  const doc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${desc.replace(/"/g, '&quot;')}" />
<meta name="theme-color" content="#294197" />
<link rel="icon" href="${base}brand/favicon-64.png" type="image/png" />
<link rel="stylesheet" href="${base}_assets/globals.css" />
<script>window.__HBSP_BASE__=${JSON.stringify(base)};window.__HBSP_PATH__=${JSON.stringify(r.path)};window.__HBSP_ROUTE__=${JSON.stringify(r.pattern)};window.__HBSP_PARAMS__=${JSON.stringify(r.params)};</script>
</head>
<body>
<div id="__app">${html}</div>
<script defer src="${base}_assets/app.js"></script>
</body>
</html>`;
  const dir = path.join(OUT, r.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), doc);
  count++;
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`Preview gerado: ${count} páginas em ${path.relative(process.cwd(), OUT)}/`);
