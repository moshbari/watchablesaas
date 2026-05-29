import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, RefreshCw, Key } from "lucide-react";

const ENDPOINT = "https://kjabpmcsiluvtxmbbfbg.supabase.co/functions/v1/push-static-page";

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "wapi_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Api() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("api_tokens")
        .select("token")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data?.token) {
        setToken(data.token);
      } else {
        const newToken = generateToken();
        const { error } = await supabase
          .from("api_tokens")
          .insert({ user_id: session.user.id, token: newToken });
        if (!error) setToken(newToken);
      }
      setLoading(false);
    })();
  }, [session?.user?.id]);

  const rotate = async () => {
    if (!session?.user?.id) return;
    const newToken = generateToken();
    const { error } = await supabase
      .from("api_tokens")
      .update({ token: newToken })
      .eq("user_id", session.user.id);
    if (error) {
      toast({ title: "Failed to rotate token", description: error.message, variant: "destructive" });
      return;
    }
    setToken(newToken);
    toast({ title: "New token generated", description: "Your old token no longer works." });
  };

  const copy = (text: string, label = "Copied") => {
    navigator.clipboard.writeText(text);
    toast({ title: label });
  };

  const masked = useMemo(() => (token ? token.slice(0, 8) + "•".repeat(24) : ""), [token]);

  const claudeBlock = `You can push HTML pages to my website via this API.

ENDPOINT: ${ENDPOINT}
METHOD: POST
HEADERS:
  Content-Type: application/json
  x-api-token: ${token ?? "<YOUR_TOKEN>"}

BODY (JSON):
{
  "slug": "my-page-url",         // URL slug, lives at /s/<slug>
  "title": "My Page Title",
  "html_content": "<!doctype html>...</html>",
  "is_published": true            // optional, default true
}

Whenever I ask you to "publish" or "update" a page, call this endpoint with the
full HTML in html_content. If the slug exists it updates; otherwise it creates.
GET the same URL with the header to list all my pages.`;

  const curlExample = `curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -H "x-api-token: ${token ?? "<YOUR_TOKEN>"}" \\
  -d '{
    "slug": "hello-world",
    "title": "Hello World",
    "html_content": "<h1>Hello from the API</h1>"
  }'`;

  return (
    <>
      <Helmet>
        <title>API Access — Push Pages from Claude, ChatGPT & More</title>
        <meta name="description" content="Your personal API token to publish and update static pages from any AI builder or script." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Key className="h-7 w-7" /> API Access
          </h1>
          <p className="text-muted-foreground">
            Push and update static pages directly from Claude, ChatGPT, Cursor, n8n, Zapier, or
            your own scripts. No copy-paste needed.
          </p>
        </div>

        {/* TOKEN */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Your personal API token</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Treat this like a password. Anyone with it can publish pages to your account.
          </p>
          <div className="flex gap-2 mb-3">
            <Input
              readOnly
              value={loading ? "Loading..." : reveal ? token ?? "" : masked}
              className="font-mono"
            />
            <Button variant="outline" size="icon" onClick={() => setReveal((r) => !r)} title={reveal ? "Hide" : "Show"}>
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => token && copy(token, "Token copied")} title="Copy">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={rotate}>
            <RefreshCw className="h-4 w-4 mr-2" /> Generate new token
          </Button>
        </Card>

        {/* CLAUDE / AI BLOCK */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">For Claude, ChatGPT, Cursor & other AI tools</h2>
            <Button variant="outline" size="sm" onClick={() => copy(claudeBlock, "Instructions copied")}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Paste this block into your AI chat once. Then just say things like
            <em> "publish a landing page at slug <code>summer-sale</code> with this HTML…"</em>.
          </p>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">{claudeBlock}</pre>
        </Card>

        {/* ENDPOINT REFERENCE */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Endpoint reference</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">URL</div>
              <div className="flex gap-2 items-center">
                <code className="bg-muted px-2 py-1 rounded text-xs flex-1 break-all">{ENDPOINT}</code>
                <Button variant="ghost" size="icon" onClick={() => copy(ENDPOINT, "URL copied")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Methods</div>
              <div><code className="bg-muted px-1 rounded">POST</code> — create or update a page · <code className="bg-muted px-1 rounded">GET</code> — list your pages</div>
            </div>
            <div>
              <div className="text-muted-foreground">Required header</div>
              <code className="bg-muted px-2 py-1 rounded text-xs">x-api-token: &lt;your token&gt;</code>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">POST body fields</div>
              <ul className="list-disc ml-5 space-y-1">
                <li><code>slug</code> (required) — URL slug; page lives at <code>/s/&lt;slug&gt;</code></li>
                <li><code>title</code> — page title</li>
                <li><code>html_content</code> — full HTML of the page</li>
                <li><code>is_published</code> — true/false (default true)</li>
                <li><code>cta_url</code>, <code>cta_text</code>, <code>cta_enabled</code> — optional CTA bar</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* CURL EXAMPLE */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">curl example</h2>
            <Button variant="outline" size="sm" onClick={() => copy(curlExample, "Command copied")}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">{curlExample}</pre>
        </Card>
      </div>
    </>
  );
}
