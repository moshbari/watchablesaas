/**
 * Transactional email for Watchable, sent through Resend.
 *
 * Mandrill was suspended (every send came back "queued: sending-suspended", so no
 * reset or signup email ever left). Resend sends from 99dfy.com, a domain already
 * verified on the account; replies go to a human inbox, not noreply.
 *
 * Needs the RESEND_API_KEY secret on the Supabase project.
 */
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

export const EMAIL_FROM = "Watchable <noreply@99dfy.com>";
// The one 99dfy.com address that receives mail (Cloudflare Email Routing).
export const SUPPORT_EMAIL = "mosh@99dfy.com";
export const SITE_URL = Deno.env.get("SITE_URL") ?? "https://watchable.99dfy.com";

interface Email {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative: HTML-only mail reads as bulk to spam filters. */
  text: string;
}

/** Sends one email. Returns Resend's message id; throws with Resend's reason on failure. */
export const sendEmail = async ({ to, subject, html, text }: Email): Promise<string> => {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set on this Supabase project");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to: [to], reply_to: SUPPORT_EMAIL, subject, html, text }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.id) {
    throw new Error(`Resend error ${response.status}: ${JSON.stringify(result)}`);
  }
  return result.id as string;
};
