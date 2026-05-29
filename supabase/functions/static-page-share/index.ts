// Share-friendly URL for a static page.
// - Crawlers (Facebook/LinkedIn/Twitter/etc.) get a tiny HTML doc with proper OG meta tags.
// - Real browsers get a 302 redirect to the canonical /s/{slug} page.
// Public endpoint, no auth.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_UA = /(facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot|skypeuripreview|pinterest|redditbot|embedly|quora|outbrain|nuzzel|vkshare|w3c_validator|googlebot|bingbot|applebot|yandex|duckduckbot|baiduspider|preview|prerender)/i;

function esc(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const slug =
    url.searchParams.get("slug") ||
    url.pathname.replace(/^\/+(static-page-share\/?)?/, "").split("/").filter(Boolean).pop();

  if (!slug) return new Response("missing slug", { status: 400, headers: corsHeaders });

  const to =
    url.searchParams.get("to") ||
    `https://watchable.99dfy.com/s/${encodeURIComponent(slug)}`;

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
  const description = title;
  const imageUrl = `${url.origin}/functions/v1/static-page-og?slug=${encodeURIComponent(slug)}`;
  const ua = req.headers.get("user-agent") || "";
  const isBot = BOT_UA.test(ua);

  if (!isBot) {
    return Response.redirect(to, 302);
  }

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${esc(to)}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${esc(to)}"/>
<meta property="og:image" content="${esc(imageUrl)}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="${esc(imageUrl)}"/>
<meta http-equiv="refresh" content="0; url=${esc(to)}"/>
</head><body>
<p>Redirecting to <a href="${esc(to)}">${esc(title)}</a>…</p>
</body></html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
});
