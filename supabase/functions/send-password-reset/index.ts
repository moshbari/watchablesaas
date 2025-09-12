import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const MANDRILL_API_KEY = Deno.env.get("MANDRILL_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink }: PasswordResetRequest = await req.json();

    // Mandrill API payload
    const mandrillPayload = {
      key: MANDRILL_API_KEY,
      message: {
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your password</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Watchable</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">Hi there!</p>
                
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                  We received a request to reset your password for your Watchable account. Click the button below to set a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                    Reset Password
                  </a>
                </div>
                
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #666;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #667eea; word-break: break-all;">
                  ${resetLink}
                </p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Security tip:</strong> If you didn't request this password reset, you can safely ignore this email. Your password won't be changed.
                </p>
              </div>
              
              <div style="text-align: center; color: #666; font-size: 14px;">
                <p style="margin: 0;">This link will expire in 24 hours for security reasons.</p>
                <p style="margin: 10px 0 0 0;">
                  Need help? Contact our support team at 
                  <a href="mailto:support@watchable.99dfy.com" style="color: #667eea; text-decoration: none;">support@watchable.99dfy.com</a>
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                <p style="margin: 0;">© 2025 Watchable. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
        subject: "Reset your Watchable password",
        from_email: "noreply@transactional.watchable.99dfy.com",
        from_name: "Watchable",
        to: [
          {
            email: email,
            type: "to"
          }
        ],
        headers: {
          "Reply-To": "support@watchable.99dfy.com"
        },
        important: false,
        track_opens: true,
        track_clicks: true,
        auto_text: true,
        auto_html: false,
        inline_css: false,
        url_strip_qs: false,
        preserve_recipients: false,
        view_content_link: null,
        tracking_domain: null,
        signing_domain: null,
        return_path_domain: null
      }
    };

    // Send email via Mandrill API
    const response = await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mandrillPayload)
    });

    const emailResponse = await response.json();
    
    if (!response.ok || emailResponse[0]?.status === "rejected") {
      throw new Error(`Mandrill API error: ${JSON.stringify(emailResponse)}`);
    }

    console.log("Password reset email sent successfully via Mandrill:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);