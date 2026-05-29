// Public endpoint for users to create/update their static pages from external tools
// (Claude, ChatGPT, Cursor, curl, n8n, Zapier, etc.).
// Auth: header `x-api-token: <user's personal API token>` from the api_tokens table.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-token",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const provided = req.headers.get("x-api-token");
  if (!provided) {
    return json({ error: "Missing x-api-token header." }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Resolve token -> user_id
  const { data: tokenRow, error: tokenErr } = await supabase
    .from("api_tokens")
    .select("user_id")
    .eq("token", provided)
    .maybeSingle();

  if (tokenErr || !tokenRow) {
    return json({ error: "Invalid API token." }, 401);
  }
  const ownerId = tokenRow.user_id as string;

  // Best-effort touch last_used_at
  supabase.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("token", provided).then(() => {});

  // GET = list this user's pages
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("static_pages")
      .select("slug,title,is_published,updated_at")
      .eq("user_id", ownerId)
      .order("updated_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    return json({ pages: data });
  }

  if (req.method !== "POST") return json({ error: "Use POST or GET" }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { slug, html_content, title, cta_url, cta_text, cta_enabled, is_published } = body ?? {};

  if (!slug || typeof slug !== "string") {
    return json({ error: "Missing required field: slug" }, 400);
  }

  // Only look at pages owned by this user
  const { data: existing } = await supabase
    .from("static_pages")
    .select("id")
    .eq("slug", slug)
    .eq("user_id", ownerId)
    .maybeSingle();

  const updateFields: Record<string, unknown> = {};
  if (html_content !== undefined) updateFields.html_content = html_content;
  if (title !== undefined) updateFields.title = title;
  if (cta_url !== undefined) updateFields.cta_url = cta_url;
  if (cta_text !== undefined) updateFields.cta_text = cta_text;
  if (cta_enabled !== undefined) updateFields.cta_enabled = cta_enabled;
  if (is_published !== undefined) updateFields.is_published = is_published;

  if (existing) {
    const { data, error } = await supabase
      .from("static_pages")
      .update(updateFields)
      .eq("id", existing.id)
      .select("id,slug,title,is_published,updated_at")
      .single();
    if (error) return json({ error: error.message }, 500);
    return json({ action: "updated", page: data });
  }

  // Check slug isn't already owned by someone else
  const { data: conflict } = await supabase
    .from("static_pages")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (conflict) {
    return json({ error: `Slug "${slug}" is already taken by another user.` }, 409);
  }

  const insertRow: Record<string, unknown> = {
    slug,
    user_id: ownerId,
    html_content: html_content ?? "",
    title: title ?? "Untitled",
    is_published: is_published ?? true,
    ...updateFields,
  };

  const { data, error } = await supabase
    .from("static_pages")
    .insert(insertRow)
    .select("id,slug,title,is_published,updated_at")
    .single();
  if (error) return json({ error: error.message }, 500);
  return json({ action: "created", page: data });
});
