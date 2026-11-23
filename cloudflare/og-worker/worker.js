// watchable-og — Cloudflare Worker in front of watchable.99dfy.com
//
// WhatsApp / Facebook / iMessage / Slack never run JavaScript, so every shared
// Watchable link used to show the same Lovable picture from index.html.
// This worker rewrites the <head> of each video page so the share preview shows:
//   • a picture taken from THAT page's video (YouTube / Tella / Google Drive / Vimeo)
//   • the page's headline + sub-headline
// and serves that picture at a stable URL: /og/<slug>.jpg  (or /og/mv/<slug>.jpg)
//
// Everything else passes straight through to the Lovable site untouched.
// Lovable's own hosting is on Cloudflare too and swallows proxied traffic before a
// route worker runs, so the DNS record points at a placeholder IP and this worker
// serves everything from the lovable.app copy of the same build.
//
// Bindings (set at upload): SUPABASE_URL, SUPABASE_ANON_KEY, FALLBACK_ORIGIN

const RESERVED = new Set([
  "", "app", "embed", "login", "register", "forgot-password", "reset-password",
  "campaigns", "account", "admin", "page-builder", "page-editor", "studio", "leads",
  "landing-leads", "test-email", "privacy", "privacy-policy", "terms-of-use",
  "multivideo-pagebuilder", "static-pagebuilder", "api", "auth", "404", "assets",
  "og", "s", "mv", "favicon.ico", "favicon.png", "robots.txt", "placeholder.svg",
  "embed-player.html",
]);

const DEFAULT_IMAGE = "https://lovable.dev/opengraph-image-p98pqg.png";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    // ---- the preview picture ------------------------------------------------
    if (parts[0] === "og") {
      const multi = parts[1] === "mv";
      const slug = decodeURIComponent((multi ? parts[2] : parts[1]) || "").replace(/\.jpg$/i, "");
      return ogImage(env, ctx, slug, multi, url.searchParams.get("v"));
    }

    // ---- which page is this? ------------------------------------------------
    let slug = null, multi = false;
    if (parts.length === 1 && !RESERVED.has(parts[0]) && !parts[0].includes(".")) slug = parts[0];
    else if (parts.length === 2 && parts[0] === "mv") { slug = parts[1]; multi = true; }

    const res = await passThrough(request, env);
    if (!slug || request.method !== "GET") return res;
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.includes("text/html")) return res;

    let page = null;
    try { page = await loadPage(env, decodeURIComponent(slug), multi); } catch (_) { /* keep default */ }
    if (!page) return res;

    const v = encodeURIComponent((page.updated_at || "").replace(/\D/g, "").slice(0, 14));
    const image = `${url.origin}/og/${multi ? "mv/" : ""}${encodeURIComponent(page.slug)}.jpg?v=${v}`;
    const title = clean(page.headline) || clean(page.title) || "Watch this video";
    const desc = clean(page.sub_headline) || "Tap to watch the video.";
    const pageUrl = `${url.origin}${url.pathname}`;
    const metaP = imageMeta(env, page, multi, v).catch(() => null);
    const meta = await Promise.race([metaP, new Promise((r) => setTimeout(() => r(null), 4000))]);
    if (!meta) ctx.waitUntil(metaP);

    const set = {
      "og:title": title, "og:description": desc, "og:image": image,
      "og:image:secure_url": image, "og:image:type": (meta && meta.type) || "image/jpeg",
      ...(meta && meta.w ? { "og:image:width": String(meta.w), "og:image:height": String(meta.h) } : {}),
      "og:image:alt": title, "og:type": "video.other", "og:url": pageUrl,
      "og:site_name": "Watchable",
      "twitter:card": "summary_large_image", "twitter:title": title,
      "twitter:description": desc, "twitter:image": image,
      "description": desc,
    };
    const seen = new Set();
    const rewritten = new HTMLRewriter()
      .on("title", { element(el) { el.setInnerContent(title); } })
      .on("meta", {
        element(el) {
          const key = el.getAttribute("property") || el.getAttribute("name");
          if (key === "twitter:site") { el.remove(); return; }
          if (key && key in set) { el.setAttribute("content", set[key]); seen.add(key); }
        },
      })
      .on("head", {
        element(el) {
          el.onEndTag((end) => {
            let extra = "";
            for (const [k, val] of Object.entries(set)) {
              if (seen.has(k)) continue;
              const attr = k.startsWith("og:") ? "property" : "name";
              extra += `<meta ${attr}="${k}" content="${attr_(val)}" />`;
            }
            end.before(extra, { html: true });
          });
        },
      })
      .transform(res);

    const out = new Response(rewritten.body, rewritten);
    out.headers.set("cache-control", "no-cache, must-revalidate, max-age=0");
    return out;
  },
};

// ---------------------------------------------------------------------------

async function passThrough(request, env) {
  // The DNS record points at a placeholder, so this worker IS the site:
  // every request is served from the Lovable copy of the same build.
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, env.FALLBACK_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete("host");
  // hashed build files never change → keep them at Cloudflare's edge; pages stay fresh
  const cf = url.pathname.startsWith("/assets/")
    ? { cacheEverything: true, cacheTtl: 31536000 }
    : /\.(png|ico|svg|jpg|webp|txt)$/i.test(url.pathname)
      ? { cacheEverything: true, cacheTtl: 3600 }
      : undefined;
  const res = await fetch(target, {
    method: request.method, headers, redirect: "manual", cf,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
  });
  // keep visitors on watchable.99dfy.com if Lovable ever redirects
  const loc = res.headers.get("location");
  if (loc && loc.startsWith(env.FALLBACK_ORIGIN)) {
    const out = new Response(res.body, res);
    out.headers.set("location", loc.replace(env.FALLBACK_ORIGIN, url.origin));
    return out;
  }
  return res;
}

async function loadPage(env, slug, multi) {
  const table = multi ? "multivideo_pages" : "pages";
  const cols = multi
    ? "slug,title,headline,sub_headline,videos,updated_at"
    : "slug,title,headline,sub_headline,video_url,videos,updated_at";
  const q = `${env.SUPABASE_URL}/rest/v1/${table}?select=${cols}&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`;
  const r = await fetch(q, {
    headers: { apikey: env.SUPABASE_ANON_KEY, authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
    cf: { cacheTtl: 60, cacheEverything: true },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] || null;
}

function videoUrls(page) {
  const list = [];
  if (page.video_url) list.push(page.video_url);
  if (Array.isArray(page.videos)) for (const v of page.videos) if (v && v.video_url) list.push(v.video_url);
  return list;
}

// Pictures are built once per page version and kept in KV (global), so WhatsApp —
// which gives up after a few seconds — always gets them instantly.
function imageKey(slug, multi, v) {
  return `${multi ? "mv/" : ""}${slug}:${v || "0"}`;
}

async function buildImage(page) {
  for (const u of videoUrls(page)) {
    const img = await thumbnailFor(u);
    if (img) {
      const bytes = await img.arrayBuffer();
      return { bytes, type: img.headers.get("content-type") || "image/jpeg", ...imageSize(new Uint8Array(bytes)) };
    }
  }
  return null;
}

async function ensureImage(env, page, multi, v, force) {
  const key = imageKey(page.slug, multi, v);
  if (!force) {
    const have = await env.OG.get(key, { type: "stream" });
    if (have) { await have.cancel(); return; }
  }
  const img = await buildImage(page);
  if (img) await env.OG.put(key, img.bytes, { metadata: { type: img.type, w: img.w, h: img.h }, expirationTtl: 60 * 60 * 24 * 90 });
}

async function imageMeta(env, page, multi, v) {
  const key = imageKey(page.slug, multi, v);
  let hit = await env.OG.getWithMetadata(key, { type: "stream" });
  if (hit.value) { await hit.value.cancel(); }
  if (hit.metadata && hit.metadata.w) return hit.metadata;
  await ensureImage(env, page, multi, v, !!hit.value);
  hit = await env.OG.getWithMetadata(key, { type: "stream" });
  if (hit.value) await hit.value.cancel();
  return hit.metadata || null;
}

// width/height from JPEG or PNG bytes (Facebook needs them to show the picture on the FIRST share)
function imageSize(b) {
  if (b[0] === 0x89 && b[1] === 0x50) return { w: (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0, h: (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0 };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b[i + 2] << 8 | b[i + 3];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b[i + 5] << 8 | b[i + 6], w: b[i + 7] << 8 | b[i + 8] };
      i += 2 + len;
    }
  }
  return {};
}

function imageResponse(body, type) {
  return new Response(body, {
    headers: {
      "content-type": type || "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable",
      "access-control-allow-origin": "*",
    },
  });
}

async function ogImage(env, ctx, slug, multi, vParam) {
  if (!slug) return Response.redirect(DEFAULT_IMAGE, 302);
  const v = (vParam || "").replace(/\D/g, "").slice(0, 14);

  // fast path: already built
  if (v) {
    const hit = await env.OG.getWithMetadata(imageKey(slug, multi, v), { type: "stream" });
    if (hit.value) return imageResponse(hit.value, hit.metadata && hit.metadata.type);
  }

  let page = null;
  try { page = await loadPage(env, slug, multi); } catch (_) {}
  if (!page) return Response.redirect(DEFAULT_IMAGE, 302);
  const realV = (page.updated_at || "").replace(/\D/g, "").slice(0, 14);
  const key = imageKey(page.slug, multi, realV);

  const hit = await env.OG.getWithMetadata(key, { type: "stream" });
  if (hit.value) return imageResponse(hit.value, hit.metadata && hit.metadata.type);

  let img = null;
  try { img = await buildImage(page); } catch (_) {}
  if (!img) return Response.redirect(DEFAULT_IMAGE, 302);
  ctx.waitUntil(env.OG.put(key, img.bytes, { metadata: { type: img.type, w: img.w, h: img.h }, expirationTtl: 60 * 60 * 24 * 90 }));
  return imageResponse(img.bytes, img.type);
}

async function getImage(src) {
  if (!src) return null;
  const r = await fetch(src, { headers: { "user-agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)" } });
  const t = r.headers.get("content-type") || "";
  if (!r.ok || !t.startsWith("image/")) return null;
  return r;
}

async function thumbnailFor(videoUrl) {
  let u;
  try { u = new URL(videoUrl); } catch (_) { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, "");

  // YouTube — the big frame first, then the always-present one
  const yt = youtubeId(u, host);
  if (yt) {
    for (const name of ["maxresdefault.jpg", "sddefault.jpg", "hqdefault.jpg"]) {
      const r = await getImage(`https://i.ytimg.com/vi/${yt}/${name}`);
      // maxres sometimes returns a tiny 120x90 grey placeholder with 200
      if (r && Number(r.headers.get("content-length") || 99999) > 2000) return r;
    }
    return null;
  }

  // Google Drive
  if (host === "drive.google.com" || host === "docs.google.com") {
    const m = u.pathname.match(/\/d\/([^/]+)/) || [null, u.searchParams.get("id")];
    if (m[1]) return getImage(`https://drive.google.com/thumbnail?id=${m[1]}&sz=w1280`);
    return null;
  }

  // Vimeo
  if (host.endsWith("vimeo.com")) {
    const r = await fetch(`https://vimeo.com/api/oembed.json?width=1280&url=${encodeURIComponent(videoUrl)}`);
    if (r.ok) { const j = await r.json(); return getImage(j.thumbnail_url); }
    return null;
  }

  // Tella, Loom and anything else with its own share picture
  const r = await fetch(videoUrl, { headers: { "user-agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)" } });
  if (!r.ok || !(r.headers.get("content-type") || "").includes("text/html")) {
    return (r.headers.get("content-type") || "").startsWith("image/") ? r : null;
  }
  const html = await r.text();
  const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i);
  if (!m) return null;
  const src = m[1].replace(/&amp;/g, "&");
  return getImage(new URL(src, videoUrl).toString());
}

function youtubeId(u, host) {
  if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/(?:embed|shorts|live|v)\/([^/?]+)/);
    return m ? m[1] : null;
  }
  return null;
}

function clean(s) {
  return (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
}
function attr_(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
