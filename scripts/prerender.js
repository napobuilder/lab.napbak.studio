import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const ssrDir = path.resolve(rootDir, 'dist-ssr');

async function prerender() {
  console.log('[SSG] Starting static pre-rendering...');

  const templatePath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`[SSG Error] Client index.html template not found at: ${templatePath}`);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Import compiled SSR entry
  const ssrEntryPath = path.resolve(ssrDir, 'entry-server.js');
  if (!fs.existsSync(ssrEntryPath)) {
    throw new Error(`[SSG Error] SSR entry not found at: ${ssrEntryPath}`);
  }
  const { render } = await import(pathToFileURL(ssrEntryPath).href);

  const routes = [
    {
      path: '/',
      outFile: path.resolve(distDir, 'index.html'),
      title: 'CTRL by Napbak | Free Online LUFS Meter, A/B Master Comparator & Acoustic Piano VST3',
      description: 'Free online audio mastering suite by Napbak Studio: Measure LUFS & True Peak (EBU R128), compare masters with real-time Dual Reference A/B crossfading & loudness differential, simulate streaming platforms (Spotify, Apple Music), and play or download the free Napbak Concert Grand Piano VST3/AU instrument.',
      canonical: 'https://ctrl.napbak.studio/'
    },
    {
      path: '/piano',
      outFile: path.resolve(distDir, 'piano', 'index.html'),
      title: 'Napbak Concert Grand | Free Online Acoustic Grand Piano & VST3 Plugin',
      description: 'Play the acoustic grand piano online with DSP engine, QWERTY/MIDI recording, and download the free VST3, AU & DirectWave plugin for FL Studio, Ableton, and Logic.',
      canonical: 'https://ctrl.napbak.studio/piano'
    },
    {
      path: '/vip',
      outFile: path.resolve(distDir, 'vip', 'index.html'),
      title: 'CTRL VIP Creator Pass | Secret Lifetime Deal ($39)',
      description: 'Secret creator access: LUFS meter, A/B comparator with live crossfader, and Acoustic Piano VST3 for only $39 lifetime.',
      canonical: 'https://ctrl.napbak.studio/vip'
    }
  ];

  for (const route of routes) {
    console.log(`[SSG] Rendering route: ${route.path} -> ${path.relative(rootDir, route.outFile)}`);
    const { appHtml } = render(route.path);

    let html = template;

    // Replace root content completely and cleanly
    const rootIndex = html.indexOf('<div id="root">');
    if (rootIndex === -1) {
      throw new Error('[SSG Error] Could not find <div id="root"> in template');
    }
    const noscriptIndex = html.indexOf('<noscript>', rootIndex);
    if (noscriptIndex === -1) {
      throw new Error('[SSG Error] Could not find <noscript> after <div id="root"> in template');
    }
    const beforeNoscript = html.slice(0, noscriptIndex);
    const lastDivIndex = beforeNoscript.lastIndexOf('</div>');
    if (lastDivIndex <= rootIndex) {
      throw new Error('[SSG Error] Could not locate closing </div> of <div id="root">');
    }

    html = html.slice(0, rootIndex) + `<div id="root">${appHtml}</div>` + html.slice(lastDivIndex + 6);


    // Update Head Meta if route has specific metadata
    if (route.path !== '/') {
      // Title
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`);
      // Meta description
      html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"/i,
        `<meta name="description" content="${route.description}"`
      );
      // Canonical
      html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"/i,
        `<link rel="canonical" href="${route.canonical}"`
      );
      // OG URL
      html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"/i,
        `<meta property="og:url" content="${route.canonical}"`
      );
      // OG Title
      html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"/i,
        `<meta property="og:title" content="${route.title}"`
      );
      // OG Description
      html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"/i,
        `<meta property="og:description" content="${route.description}"`
      );
      // Twitter URL
      html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"/i,
        `<meta name="twitter:url" content="${route.canonical}"`
      );
      // Twitter Title
      html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"/i,
        `<meta name="twitter:title" content="${route.title}"`
      );
      // Twitter Description
      html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"/i,
        `<meta name="twitter:description" content="${route.description}"`
      );
    }

    // Ensure output directory exists
    const outDir = path.dirname(route.outFile);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(route.outFile, html, 'utf-8');
    console.log(`[SSG] Successfully wrote: ${path.relative(rootDir, route.outFile)} (${(Buffer.byteLength(html) / 1024).toFixed(2)} kB)`);

    // Also write clean URL root file (e.g. dist/piano.html) for universal static host support
    if (route.path !== '/') {
      const cleanHtmlFile = path.resolve(distDir, `${route.path.slice(1)}.html`);
      fs.writeFileSync(cleanHtmlFile, html, 'utf-8');
      console.log(`[SSG] Successfully wrote: ${path.relative(rootDir, cleanHtmlFile)} (${(Buffer.byteLength(html) / 1024).toFixed(2)} kB)`);
    }
  }


  // Clean up temporary SSR bundle
  if (fs.existsSync(ssrDir)) {
    fs.rmSync(ssrDir, { recursive: true, force: true });
    console.log('[SSG] Cleaned up temporary SSR build directory.');
  }

  console.log('[SSG] Pre-rendering complete! Static HTML generated for all public routes.');
}

prerender().catch((err) => {
  console.error('[SSG Fatal Error]:', err);
  process.exit(1);
});
