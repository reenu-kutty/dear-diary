import { createClient } from 'npm:@supabase/supabase-js@2.57.0';
import OpenAI from 'npm:openai@5.18.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CrisisAnalysis {
  is_crisis: boolean;
  confidence: number;
  detected_indicators: string[];
  severity: 'low' | 'medium' | 'high';
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Client for user authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get request body
    const { title, content } = await req.json();

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          is_crisis: false,
          confidence: 0,
          detected_indicators: [],
          severity: 'low'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize OpenAI client
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Analyze content for crisis indicators
    const analysisPrompt = `Analyze the following journal entry for signs of suicidal ideation, self-harm, or mental health crisis. Be very careful and err on the side of caution.

Title: ${title || 'Untitled'}
Content: ${content}

Look for indicators such as:
- Direct mentions of suicide, self-harm, or wanting to die
- Expressions of hopelessness or feeling trapped
- Mentions of having no reason to live
- References to ending pain or suffering
- Goodbye messages or final preparations
- Feeling like a burden to others
- Extreme despair or emotional pain

Respond in JSON format:
{
  "is_crisis": boolean,
  "confidence": number (0-100),
  "detected_indicators": ["indicator1", "indicator2"],
  "severity": "low" | "medium" | "high"
}

Be sensitive but thorough. If there's any doubt about potential self-harm, mark as crisis.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a mental health crisis detection system. Your role is to identify potential signs of suicidal ideation or self-harm in journal entries. Be extremely careful and sensitive, erring on the side of caution to protect user safety."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.1, // Low temperature for consistent, careful analysis
      });

      const response = completion.choices[0]?.message?.content?.trim();
      if (response) {
        try {
          const analysis: CrisisAnalysis = JSON.parse(response);
          
          // Validate and sanitize the response
          const result: CrisisAnalysis = {
            is_crisis: Boolean(analysis.is_crisis),
            confidence: Math.max(0, Math.min(100, Number(analysis.confidence) || 0)),
            detected_indicators: Array.isArray(analysis.detected_indicators) ? analysis.detected_indicators : [],
            severity: ['low', 'medium', 'high'].includes(analysis.severity) ? analysis.severity : 'low'
          };

          return new Response(
            JSON.stringify(result),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          // Return safe default if parsing fails
          return new Response(
            JSON.stringify({
              is_crisis: false,
              confidence: 0,
              detected_indicators: [],
              severity: 'low'
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      // Return safe default if AI analysis fails
      return new Response(
        JSON.stringify({
          is_crisis: false,
          confidence: 0,
          detected_indicators: [],
          severity: 'low'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fallback response
    return new Response(
      JSON.stringify({
        is_crisis: false,
        confidence: 0,
        detected_indicators: [],
        severity: 'low'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in crisis-detection function:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});