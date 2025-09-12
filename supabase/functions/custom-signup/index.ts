import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CustomSignupRequest {
  email: string;
  password: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, name }: CustomSignupRequest = await req.json();

    // Create user with admin privileges (bypasses email confirmation)
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // We'll handle confirmation manually
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate confirmation token
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
    });

    if (linkError) {
      console.error("Error generating confirmation link:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate confirmation link" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email via our custom Mandrill function
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-signup-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        email,
        confirmationLink: linkData.properties.action_link,
        name,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Error sending confirmation email:", emailResult);
      // User was created but email failed - still return success but with warning
      return new Response(
        JSON.stringify({ 
          success: true, 
          warning: "Account created but confirmation email failed to send. Please contact support.",
          user: { id: user.user?.id, email: user.user?.email }
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Custom signup completed successfully:", {
      user: user.user?.email,
      emailSent: emailResult.success
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Account created successfully. Please check your email to confirm your account.",
      user: { id: user.user?.id, email: user.user?.email }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in custom-signup function:", error);
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