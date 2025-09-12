import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuspendResponse {
  suspended_count: number;
  success: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting trial suspension check...');
    
    // Call the database function to suspend expired trials
    const { data, error } = await supabase.rpc('suspend_expired_trials');
    
    if (error) {
      console.error('Error suspending trials:', error);
      throw error;
    }

    const suspendedCount = data || 0;
    console.log(`Suspended ${suspendedCount} expired trials`);

    const response: SuspendResponse = {
      suspended_count: suspendedCount,
      success: true
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in suspend-expired-trials function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suspended_count: 0,
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