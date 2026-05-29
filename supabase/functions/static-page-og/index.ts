// Generates a 1200x630 PNG OG card for a static page (title + branding).
// Public endpoint, no auth. Cached aggressively.
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let wasmReady: Promise<void> | null = null;
function ensureWasm() {
  if (!wasmReady) {
    wasmReady = initWasm(
      fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm").then(r => r.arrayBuffer()) as any
    );
  }
  return wasmReady;
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? line + " " + w : w;
    if (candidate.length > maxChars) {
      if (line) lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    } else {
      line = candidate;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    if (last.length > maxChars - 1) last = last.slice(0, maxChars - 2) + "…";
    lines[maxLines - 1] = last;
  }
  return lines;
}

function buildSvg(title: string, brand: string) {
  const lines = wrap(title || "Untitled", 26, 3);
  const lineHeight = 90;
  const startY = 315 - ((lines.length - 1) * lineHeight) / 2;
  const tspans = lines.map((l, i) => `<tspan x="80" y="${startY + i * lineHeight}">${esc(l)}</tspan>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="100%" stop-color="#0064c2"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="12" height="630" fill="#ffd400"/>
  <text x="80" y="120" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600" fill="#ffd400" letter-spacing="4">${esc(brand.toUpperCase())}</text>
  <text font-family="Inter, Arial, sans-serif" font-size="76" font-weight="800" fill="#ffffff">${tspans}</text>
  <text x="80" y="560" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="500" fill="#a8c4e8">Powered by Watchable</text>
</svg>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || url.pathname.split("/").filter(Boolean).pop();
    if (!slug) return new Response("missing slug", { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: page } = await supabase
      .from("static_pages")
      .select("title")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    const title = page?.title || "Static Page";
    const brand = "Watchable";

    await ensureWasm();
    const svg = buildSvg(title, brand);
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
    const png = resvg.render().asPng();

    return new Response(png, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (e) {
    console.error("og error", e);
    return new Response(`error: ${(e as Error).message}`, { status: 500, headers: corsHeaders });
  }
});
