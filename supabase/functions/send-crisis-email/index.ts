import { createClient } from 'npm:@supabase/supabase-js@2.57.0';
import nodemailer from 'npm:nodemailer@6.9.7';
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailRequest {
  userEmail: string;
  emergencyContactEmail: string;
  entryTitle: string;
  entryContent: string;
  detectedIndicators: string[];
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
    const { emergencyContactEmail, entryTitle, entryContent, detectedIndicators }: EmailRequest = await req.json();

    if (!emergencyContactEmail) {
      return new Response(
        JSON.stringify({ error: "No emergency contact email provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Gmail credentials
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');
    
    if (!gmailUser || !gmailAppPassword) {
      console.error('Gmail credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email service not configured",
          message: "Crisis detection is active but email notifications are not available. Please configure GMAIL_USER and GMAIL_APP_PASSWORD." 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Prepare email content
    const emailSubject = "Urgent: Crisis Alert for Your Emergency Contact";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Crisis Alert</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>This is an urgent message regarding someone who has listed you as their emergency contact.</strong>
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Our crisis detection system has identified concerning content in a journal entry that suggests thoughts of suicide or self-harm. The person who wrote this entry (${user.email}) has designated you as their emergency contact.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Detected Indicators:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${detectedIndicators.map(indicator => `<li style="margin-bottom: 5px;">${indicator}</li>`).join('')}
            </ul>
          </div>
          
          <h3 style="color: #333; margin-top: 30px;">Immediate Actions You Can Take:</h3>
          <ul style="line-height: 1.8; margin-bottom: 25px;">
            <li><strong>Reach out immediately</strong> - Contact them by phone, text, or in person</li>
            <li><strong>Listen without judgment</strong> - Let them know you care and are there for them</li>
            <li><strong>Encourage professional help</strong> - Suggest they speak with a counselor or therapist</li>
            <li><strong>Stay with them</strong> - If possible, don't leave them alone</li>
          </ul>
          
          <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #60a5fa; margin-top: 0;">Crisis Resources</h3>
            <p style="margin: 10px 0;"><strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</p>
            <p style="margin: 10px 0;"><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
            <p style="margin: 10px 0;"><strong>Emergency:</strong> Call 911 if in immediate danger</p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            This alert was generated automatically by Dear Diary's crisis detection system. If you believe this is an error or have questions, please contact deardiary.crisis@gmail.com. Your friend trusted you enough to list you as their emergency contact - your support could make all the difference.
          </p>
        </div>
      </div>
    `;

    // Send email using Nodemailer
    const mailOptions = {
      from: 'Dear Diary Crisis Alert <deardiary.crisis@gmail.com>',
      to: emergencyContactEmail,
      subject: emailSubject,
      html: emailHtml,
    };

    try {
      const emailResult = await transporter.sendMail(mailOptions);
      console.log('Crisis email sent successfully:', emailResult.messageId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Crisis alert email sent successfully",
          messageId: emailResult.messageId 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (emailError) {
      console.error('Gmail sending error:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

  } catch (error) {
    console.error('Error in send-crisis-email function:', error);
    return new Response(
      JSON.stringify({ error: "Failed to send crisis alert email" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});