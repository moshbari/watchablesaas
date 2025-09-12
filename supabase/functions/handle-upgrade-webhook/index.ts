import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpgradeRequest {
  user_id: string;
  payment_status: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, payment_status }: UpgradeRequest = await req.json();
    
    console.log(`Processing upgrade webhook for user ${user_id} with status ${payment_status}`);

    if (payment_status === 'completed' || payment_status === 'succeeded') {
      // Update user to UNLIMITED role
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'UNLIMITED' })
        .eq('id', user_id);

      if (error) {
        console.error('Error upgrading user:', error);
        throw error;
      }

      console.log(`Successfully upgraded user ${user_id} to UNLIMITED`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'User upgraded successfully' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Payment not completed' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  } catch (error: any) {
    console.error('Error in handle-upgrade-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);