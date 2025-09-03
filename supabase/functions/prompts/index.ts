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

    // Fetch last 5 journal entries for the user
    const { data: entries, error: entriesError } = await supabase
      .from('journal_entries')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (entriesError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch journal entries" }),
        {
          status: 500,
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

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Prepare context from recent entries
    const entriesContext = entries && entries.length > 0 
      ? entries.map((entry: JournalEntry) => 
          `Title: ${entry.title || 'Untitled'}\nContent: ${entry.content.substring(0, 500)}${entry.content.length > 500 ? '...' : ''}`
        ).join('\n\n---\n\n')
      : 'No previous entries found.';

    // Generate empathetic follow-up question
    const prompt = `Based on the following recent journal entries from a user, generate ONE empathetic and thoughtful follow-up question that would encourage deeper reflection and continued journaling. The question should be:

1. Empathetic and supportive in tone
2. Open-ended to encourage reflection
3. Related to themes or emotions present in their recent entries
4. Suitable for personal journaling
5. Not too personal or invasive
6. Encouraging growth and self-discovery

Recent journal entries:
${entriesContext}

Generate only the question, nothing else. Make it warm, thoughtful, and encouraging.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a compassionate journaling companion who helps people reflect on their thoughts and experiences through thoughtful questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const question = completion.choices[0]?.message?.content?.trim() || 
      "What emotions are you experiencing right now, and what might be behind them?";

    return new Response(
      JSON.stringify({ question }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in prompts function:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});