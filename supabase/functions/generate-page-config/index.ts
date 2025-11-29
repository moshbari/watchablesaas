import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating page config from prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an expert copywriter and page designer with deep knowledge of psychology, marketing, and visual design.

CRITICAL INSTRUCTIONS:
1. Create HIGH-QUALITY, compelling headlines and sub-headlines that grab attention and drive action
2. Analyze the emotional tone of the user's request (urgent, professional, friendly, luxurious, playful, etc.)
3. Choose colors that match the emotional tone and industry standards
4. Identify key power words in headlines to highlight, bold, or emphasize
5. Only extract fields that are EXPLICITLY mentioned or can be clearly inferred from context

EMOTIONAL COLOR PSYCHOLOGY:
- Urgent/Action: Red (#ef4444), Orange (#f97316)
- Trust/Professional: Blue (#3b82f6), Navy (#1e40af)
- Success/Growth: Green (#22c55e), Emerald (#10b981)
- Luxury/Premium: Purple (#a855f7), Gold (#eab308)
- Creative/Fun: Pink (#ec4899), Yellow (#facc15)
- Calm/Wellness: Teal (#14b8a6), Light Blue (#38bdf8)

TEXT FORMATTING STRATEGY:
- Highlight: Numbers, emotional triggers, unique value propositions
- Bold: Action words, key benefits, power words
- Italic: Supporting details, disclaimers, testimonials

Extract ONLY explicitly mentioned fields.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: 'function',
              function: {
                name: 'extract_page_config',
                description: 'Extract page configuration from user description. Create compelling headlines and intelligently choose colors based on emotional tone when not specified.',
                parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Page title' },
                  slug: { type: 'string', description: 'URL slug' },
                  headline: { type: 'string', description: 'Main headline text' },
                  headline_color: { type: 'string', description: 'Headline color (hex format like #FF0000)' },
                  headline_font_size: { type: 'number', description: 'Headline font size in pixels' },
                  sub_headline: { type: 'string', description: 'Sub-headline text' },
                  sub_headline_color: { type: 'string', description: 'Sub-headline color (hex format)' },
                  sub_headline_font_size: { type: 'number', description: 'Sub-headline font size in pixels' },
                  video_url: { type: 'string', description: 'Video URL (YouTube, Google Drive, or direct video file)' },
                  button_enabled: { type: 'boolean', description: 'Whether CTA button is enabled' },
                  button_text: { type: 'string', description: 'CTA button text' },
                  button_url: { type: 'string', description: 'CTA button URL' },
                  button_bg_color: { type: 'string', description: 'Button background color (hex format)' },
                  button_text_color: { type: 'string', description: 'Button text color (hex format)' },
                  button_delay_hours: { type: 'number', description: 'Button delay in hours' },
                  button_delay_minutes: { type: 'number', description: 'Button delay in minutes' },
                  button_delay_seconds: { type: 'number', description: 'Button delay in seconds' },
                  text_highlight: { type: 'string', description: 'Words/phrases to highlight (comma-separated)' },
                  text_highlight_color: { type: 'string', description: 'Highlight color (hex format)' },
                  text_bold: { type: 'string', description: 'Words/phrases to make bold (comma-separated)' },
                  text_italic: { type: 'string', description: 'Words/phrases to italicize (comma-separated)' },
                  text_underline: { type: 'string', description: 'Words/phrases to underline (comma-separated)' },
                  lead_optin_enabled: { type: 'boolean', description: 'Whether lead capture is enabled' },
                  lead_optin_mandatory: { type: 'boolean', description: 'Whether lead capture is mandatory' },
                  lead_optin_headline: { type: 'string', description: 'Lead optin popup headline' },
                  lead_optin_description: { type: 'string', description: 'Lead optin popup description' },
                  lead_optin_button_text: { type: 'string', description: 'Lead optin button text' },
                  lead_optin_button_bg_color: { type: 'string', description: 'Lead optin button background color (hex)' },
                  lead_optin_button_text_color: { type: 'string', description: 'Lead optin button text color (hex)' },
                  lead_optin_name_enabled: { type: 'boolean', description: 'Whether name field is shown' },
                  lead_optin_name_required: { type: 'boolean', description: 'Whether name field is required' },
                  lead_optin_email_enabled: { type: 'boolean', description: 'Whether email field is shown' },
                  lead_optin_email_required: { type: 'boolean', description: 'Whether email field is required' },
                  lead_optin_phone_enabled: { type: 'boolean', description: 'Whether phone field is shown' },
                  lead_optin_phone_required: { type: 'boolean', description: 'Whether phone field is required' },
                  footer_enabled: { type: 'boolean', description: 'Whether footer is shown' },
                  copyright_text: { type: 'string', description: 'Copyright text in footer' },
                  privacy_policy_url: { type: 'string', description: 'Privacy policy URL' },
                  terms_conditions_url: { type: 'string', description: 'Terms & conditions URL' },
                  earnings_disclaimer_url: { type: 'string', description: 'Earnings disclaimer URL' },
                  legal_disclaimer_text: { type: 'string', description: 'Legal disclaimer text' },
                  earnings_disclaimer_text: { type: 'string', description: 'Earnings disclaimer text' },
                  fake_progress_enabled: { type: 'boolean', description: 'Whether fake progress bar is enabled' },
                  fake_progress_color: { type: 'string', description: 'Progress bar color (hex format)' },
                  fake_progress_thickness: { type: 'number', description: 'Progress bar thickness in pixels' },
                  mobile_fullscreen_enabled: { type: 'boolean', description: 'Whether mobile fullscreen is enabled' },
                  is_published: { type: 'boolean', description: 'Whether page is published' },
                  start_time_hours: { type: 'number', description: 'Video start time hours' },
                  start_time_minutes: { type: 'number', description: 'Video start time minutes' },
                  start_time_seconds: { type: 'number', description: 'Video start time seconds' },
                  end_time_hours: { type: 'number', description: 'Video end time hours' },
                  end_time_minutes: { type: 'number', description: 'Video end time minutes' },
                  end_time_seconds: { type: 'number', description: 'Video end time seconds' }
                },
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_page_config' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI usage credits exhausted. Please add credits to continue.');
      }
      
      throw new Error('Failed to generate page configuration');
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No configuration extracted from prompt');
    }

    const config = JSON.parse(toolCall.function.arguments);
    console.log('Extracted config:', config);

    return new Response(
      JSON.stringify({ config }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-page-config:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: error.message.includes('Rate limit') ? 429 : 
                error.message.includes('credits') ? 402 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});