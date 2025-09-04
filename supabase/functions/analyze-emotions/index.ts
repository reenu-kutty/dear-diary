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

interface EmotionalAnalysis {
  date: string;
  emotional_score: number;
  dominant_emotions: string[];
  summary: string;
}

interface CachedAnalysis {
  date: string;
  emotional_score: number;
  dominant_emotions: string[];
  summary: string;
  entry_count: number;
  last_entry_at: string;
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

    // First, get existing cached analyses for the date range
    const { data: cachedAnalyses, error: cacheError } = await supabase
      .from('emotional_analysis_cache')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.split('T')[0])
      .lte('date', endDate.split('T')[0]);

    if (cacheError) {
      console.error('Error fetching cached analyses:', cacheError);
    }

    // Fetch journal entries for the date range
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
        JSON.stringify({ analyses: cachedAnalyses || [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Group entries by date
    const entriesByDate: { [key: string]: JournalEntry[] } = {};
    entries.forEach((entry: JournalEntry) => {
      const date = entry.created_at.split('T')[0]; // Get YYYY-MM-DD format
      if (!entriesByDate[date]) {
        entriesByDate[date] = [];
      }
      entriesByDate[date].push(entry);
    });

    // Check which dates need analysis (new entries or no cache)
    const datesToAnalyze: string[] = [];
    const cachedByDate = new Map<string, CachedAnalysis>();
    
    if (cachedAnalyses) {
      cachedAnalyses.forEach((cache: CachedAnalysis) => {
        cachedByDate.set(cache.date, cache);
      });
    }

    for (const [date, dateEntries] of Object.entries(entriesByDate)) {
      const cached = cachedByDate.get(date);
      const latestEntryTime = Math.max(...dateEntries.map(e => new Date(e.created_at).getTime()));
      
      // Always analyze if no cache exists, or if entry count/timing doesn't match
      if (!cached || 
          cached.entry_count !== dateEntries.length ||
          new Date(cached.last_entry_at).getTime() < latestEntryTime) {
        datesToAnalyze.push(date);
      }
    }

    // If no cached data exists at all, analyze all dates with entries
    if (!cachedAnalyses || cachedAnalyses.length === 0) {
      datesToAnalyze.length = 0; // Clear the array
      datesToAnalyze.push(...Object.keys(entriesByDate));
    }

    // Initialize OpenAI client only if we need to analyze
    let openai: OpenAI | null = null;
    if (datesToAnalyze.length > 0) {
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
      openai = new OpenAI({ apiKey: openaiApiKey });
    }

    // Analyze emotions for dates that need it
    const newAnalyses: EmotionalAnalysis[] = [];

    for (const date of datesToAnalyze) {
      const dateEntries = entriesByDate[date];
      const combinedContent = dateEntries
        .map(entry => `${entry.title || 'Untitled'}: ${entry.content}`)
        .join('\n\n');

      const prompt = `Analyze the emotional content of the following journal entries from ${date}. 

Journal entries:
${combinedContent}

Please provide:
1. An emotional score from 1-10 (1 = very negative/sad, 10 = very positive/happy)
2. The top 2-3 dominant emotions present
3. A brief summary of the emotional state

Respond in JSON format:
{
  "emotional_score": number,
  "dominant_emotions": ["emotion1", "emotion2"],
  "summary": "brief emotional summary"
}`;

      try {
        const completion = await openai!.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an empathetic emotional analysis assistant. Analyze journal entries with care and provide helpful insights about emotional patterns."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.3,
        });

        const response = completion.choices[0]?.message?.content?.trim();
        if (response) {
          try {
            const analysis = JSON.parse(response);
            const emotionalAnalysis: EmotionalAnalysis = {
              date,
              emotional_score: Math.max(1, Math.min(10, analysis.emotional_score)),
              dominant_emotions: analysis.dominant_emotions || [],
              summary: analysis.summary || '',
            };
            
            newAnalyses.push(emotionalAnalysis);

            // Cache the analysis
            const latestEntryTime = Math.max(...dateEntries.map(e => new Date(e.created_at).getTime()));
            await supabase
              .from('emotional_analysis_cache')
              .upsert({
                user_id: user.id,
                date,
                emotional_score: emotionalAnalysis.emotional_score,
                dominant_emotions: emotionalAnalysis.dominant_emotions,
                summary: emotionalAnalysis.summary,
                entry_count: dateEntries.length,
                last_entry_at: new Date(latestEntryTime).toISOString(),
              });
          } catch (parseError) {
            console.error(`Error parsing AI response for ${date}:`, parseError);
            throw parseError; // Re-throw to trigger the outer catch block
          }
        }
      } catch (error) {
        console.error(`Error analyzing emotions for ${date}:`, error);
        // Skip this date if analysis fails - don't cache failed attempts
        // This allows for retry on next request
      }
    }

    // Combine cached and new analyses
    const allAnalyses: EmotionalAnalysis[] = [];
    
    // Add cached analyses that don't need updates
    if (cachedAnalyses) {
      cachedAnalyses.forEach((cached: CachedAnalysis) => {
        if (!datesToAnalyze.includes(cached.date)) {
          allAnalyses.push({
            date: cached.date,
            emotional_score: cached.emotional_score,
            dominant_emotions: cached.dominant_emotions,
            summary: cached.summary,
          });
        }
      });
    }
    
    // Add new analyses
    allAnalyses.push(...newAnalyses);

    return new Response(
      JSON.stringify({ analyses: allAnalyses }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in analyze-emotions function:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});