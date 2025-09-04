import { createClient } from 'npm:@supabase/supabase-js@2.57.0';
import OpenAI from 'npm:openai@5.18.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface MonthlyThemes {
  themes: string[];
  summary: string;
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

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
    const { startDate, endDate } = await req.json();

    // Fetch journal entries for the month
    const { data: entries, error: entriesError } = await supabase
      .from('journal_entries')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (entriesError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch journal entries" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ 
          themes: [],
          summary: "No entries found for this month."
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

    // Combine all entries for analysis
    const combinedContent = entries
      .map((entry: JournalEntry) => `${entry.title || 'Untitled'}: ${entry.content}`)
      .join('\n\n');

    const prompt = `Analyze the following journal entries from a month and identify the top 3 most prominent themes or topics that appear across the entries. Focus on recurring subjects, concerns, activities, relationships, or life areas that the person writes about most frequently.

Journal entries:
${combinedContent}

Please provide:
1. The top 3 most prominent themes (be specific and descriptive)
2. A brief summary of the overall month's focus

Respond in JSON format:
{
  "themes": ["theme1", "theme2", "theme3"],
  "summary": "brief summary of the month's main focus areas"
}

Make the themes specific and meaningful, not generic. For example, instead of "relationships" say "navigating workplace conflicts" or "strengthening family bonds".`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a thoughtful journal analysis assistant. Identify meaningful themes and patterns in journal entries to help users understand their life focus areas and recurring topics."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content?.trim();
      if (response) {
        try {
          const analysis = JSON.parse(response);
          const result: MonthlyThemes = {
            themes: Array.isArray(analysis.themes) ? analysis.themes.slice(0, 3) : [],
            summary: analysis.summary || 'No clear themes identified for this month.'
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
          return new Response(
            JSON.stringify({
              themes: [],
              summary: "Unable to analyze themes for this month."
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
      return new Response(
        JSON.stringify({
          themes: [],
          summary: "Unable to analyze themes for this month."
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
        themes: [],
        summary: "Unable to analyze themes for this month."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in analyze-themes function:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});