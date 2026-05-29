// Public endpoint for Claude (or any tool) to create/update static pages.
// Auth: caller must include header `x-api-token: <STATIC_PAGE_API_TOKEN>`.
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

  const expected = Deno.env.get("STATIC_PAGE_API_TOKEN");
  if (!expected) return json({ error: "Server not configured" }, 500);

  const provided = req.headers.get("x-api-token");
  if (!provided || provided !== expected) {
    return json({ error: "Unauthorized. Send header x-api-token with your API token." }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // GET = list all pages (slug + title + is_published)
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("static_pages")
      .select("slug,title,is_published,updated_at")
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

  const { slug, html_content, title, cta_url, cta_text, cta_enabled, is_published, user_id } = body ?? {};

  if (!slug || typeof slug !== "string") {
    return json({ error: "Missing required field: slug" }, 400);
  }

  // Does this slug already exist?
  const { data: existing } = await supabase
    .from("static_pages")
    .select("id,user_id")
    .eq("slug", slug)
    .maybeSingle();

  const updateFields: Record<string, unknown> = {};
  if (html_content !== undefined) updateFields.html_content = html_content;
  if (title !== undefined) updateFields.title = title;
  if (cta_url !== undefined) updateFields.cta_url = cta_url;
  if (cta_text !== undefined) updateFields.cta_text = cta_text;
  if (cta_enabled !== undefined) updateFields.cta_enabled = cta_enabled;
  if (is_published !== undefined) updateFields.is_published = is_published;

  if (existing) {
    // UPDATE existing page
    const { data, error } = await supabase
      .from("static_pages")
      .update(updateFields)
      .eq("id", existing.id)
      .select("id,slug,title,is_published,updated_at")
      .single();
    if (error) return json({ error: error.message }, 500);
    return json({ action: "updated", page: data });
  }

  // CREATE new page — need a user_id. Use provided, else borrow from any existing static_page (single-owner app).
  let ownerId = user_id as string | undefined;
  if (!ownerId) {
    const { data: anyPage } = await supabase
      .from("static_pages")
      .select("user_id")
      .limit(1)
      .maybeSingle();
    ownerId = anyPage?.user_id;
  }
  if (!ownerId) {
    return json({ error: "No user_id provided and no existing pages to infer owner from. Include user_id in the request body." }, 400);
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
