import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Fetching AI prompt configuration...');
    
    // Fetch the AI prompt from the database
    const { data: promptConfig, error: promptError } = await supabase
      .from('ai_prompt_config')
      .select('prompt_text')
      .eq('prompt_type', 'headline_generation')
      .single();

    if (promptError) {
      console.error('Error fetching prompt config:', promptError);
      throw new Error('Failed to fetch AI prompt configuration');
    }

    const systemPrompt = promptConfig.prompt_text;
    const userPrompt = context 
      ? `Generate a headline and sub-headline based on this context: ${context}`
      : 'Generate a compelling headline and sub-headline for a video sales letter.';

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Generated text:', generatedText);

    // Parse the JSON response
    let parsedResult;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = JSON.parse(generatedText);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedText);
      throw new Error('AI returned invalid format');
    }

    return new Response(
      JSON.stringify({ 
        headline: parsedResult.headline,
        subHeadline: parsedResult.subHeadline 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-headline function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});