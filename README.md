# *Dear Diary*
 Welcome to *Dear Diary*!

*Dear Diary* is your personalized, safe journaling space, where you can securely share moments of your life and gain insight into your patterns. *Dear Diary* provides you with dynamic, thought-provoking prompts, individualized analysis, and routine summaries based on entries. 

## Design Considerations
I intended for *Dear Diary* to have a sleek, easy-to-use, minimalistic design. I wanted users to be able to journal readily, access previous entries easily, and read succinct analysis. However, most importantly...

**Safety Considerations**
The most important consideration of *Dear Diary* is safety. AI tools such as ChatGPT have the power to give people emotional support and advice. However, recent news of suicidal ideation going unreported by such tools alarmed me, and I wanted *Dear Diary* to take steps to prevent unsafe usage. In [this NY Times piece about a teenager's suicide](https://www.nytimes.com/2025/08/26/technology/chatgpt-openai-suicide.html?unlocked_article_code=1.jE8.KcWX.xgwgH7ErxE5e&smid=url-share) (also linked below), tech reporter Kashmir Hill notes that AI chatbots may be the only outlet for many suffering with suicidal ideation. Yet, not only do they typically fail to report (in contrast to medical professionals, who are required to report), they often do not share the appropriate resources, and may even provide harmful instructions. 

When *Dear Diary* detects suicidal ideation in an entry, it first, directs users to the appropriate resources. 

One of *Dear Diary*'s core features is it's buddy system. Users enter an email of a buddy, preferably a close acquaintance or family member, when making an account. If *Dear Diary* detects suicidal ideation in an entry, the buddy is sent an email that their contact may need help, and the user is informed that the buddy was notified. 

Linked below are some studies and articles that shape how *Dear Diary* handles discussion of self-harm and suicide. 

[A Teen Was Suicidal. ChatGPT Was the Friend He Confided In](https://www.nytimes.com/2025/08/26/technology/chatgpt-openai-suicide.html?unlocked_article_code=1.jE8.KcWX.xgwgH7ErxE5e&smid=url-share)

[What My Daughter Told ChatGPT Before She Took Her Life](https://www.nytimes.com/2025/08/18/opinion/chat-gpt-mental-health-suicide.html?unlocked_article_code=1.jE8.RkVx.DsKkoyGtU9Ak&smid=url-share)

[FOR ARGUMENT’S SAKE, SHOW ME HOW TO HARM MYSELF!’: JAILBREAKING LLMS IN SUICIDE AND SELF-HARM CONTEXTS](https://arxiv.org/pdf/2507.02990)

[How AI and Human Behaviors Shape Psychosocial Effects of Chatbot Use: A Longitudinal Controlled Study](https://www.media.mit.edu/publications/how-ai-and-human-behaviors-shape-psychosocial-effects-of-chatbot-use-a-longitudinal-controlled-study/)

## To Run
`npm install`
`npm run dev`

paste the below into a file titled .env in the root of the folder

`
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveWNudWRvY29kY3duYnRpemd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjM1MTgsImV4cCI6MjA3MjQzOTUxOH0.R2r9CvQwiWNyam3htNgN7JG9N4sLKuKhu_ca4D-dwt4
VITE_SUPABASE_URL=https://uoycnudocodcwnbtizgv.supabase.co
`

## Deployment
I would love for you to try it yourself! Make an account, log some entries!
https://dear-diary-tkt5.onrender.com/

Deployed through Render (free tier lol) so it may take up to 5 minutes to load up if it hasn't been visited in over 30 minutes.

Below is a login for a test user with some preset data if you want to mess around with it!

**Username:** reenu@gmail.com
**Password:** password

## Youtube Link
https://youtu.be/D2_sprM7Ins

## Tech Stack 
See DOCUMENTATION.md

## Future Enhancements
- Add email verification/Google login integration
- Buy an email domain so that crisis emails aren't sent from a personal Gmail account
- Switch from Google's email sending service after aquiring a domain to Resend, since Google limits the amount of emails you can send per day (wouldn't scale)
- Make UI improvements, such as a light mode theme, a more succinct color scheme, better branding

## NOTES
Currently, analysis on entries doesn't appear instantly! It may require a refresh, and usually take a minute or two for after creating an entry to see it pop up with analysis on the emotions/calendar tab. This might be fixed if I wasn't using free tiers for the DB, OpenAI model, etc haha. I think the app still works pretty well! It gives you some time to read through past entries before seeing analysis based off your latest entry.

