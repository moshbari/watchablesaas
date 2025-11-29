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
    const userPrompt = `Generate 3 compelling headline and sub-headline variations based on this context: ${context}`;

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
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Full AI response:', generatedText);

    // Parse the JSON response - try multiple approaches
    let parsedResult;
    try {
      // First, try to find JSON in markdown code blocks
      const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        parsedResult = JSON.parse(codeBlockMatch[1]);
        console.log('Parsed from code block');
      } else {
        // Try to extract any JSON object containing "options"
        const jsonMatch = generatedText.match(/\{[\s\S]*"options"[\s\S]*\[[\s\S]*\][\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
          console.log('Parsed from inline JSON with options array');
        } else {
          // Last resort: try parsing the whole string
          parsedResult = JSON.parse(generatedText.trim());
          console.log('Parsed whole response');
        }
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedText);
      console.error('Parse error:', parseError.message);
      throw new Error('AI returned invalid format. Response: ' + generatedText.substring(0, 300));
    }

    console.log('Final parsed result:', parsedResult);

    // Ensure we have an options array
    if (!parsedResult.options || !Array.isArray(parsedResult.options)) {
      throw new Error('AI did not return an options array');
    }

    return new Response(
      JSON.stringify({ 
        options: parsedResult.options.map((opt: any) => ({
          headline: opt.headline || opt.Headline,
          subHeadline: opt.subHeadline || opt.SubHeadline || opt.sub_headline,
          rating: opt.rating || opt.Rating || 5,
          reason: opt.reason || opt.Reason || 'Compelling copy'
        }))
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