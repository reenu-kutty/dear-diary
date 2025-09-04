# Dear Diary Documentation

## Overview
*Dear Diary* is a modern web application designed to provide a seamless journaling experience enhanced by AI-driven emotional insights and crisis detection. The chosen tech stack prioritizes developer productivity, scalability, and user safety!

---

## Frontend

### **React 18**
- Modern React with hooks and functional components
- Provides a declarative UI approach and a large ecosystem
- Chosen because I had lots of prior experience, and Bolt's familiarity with React
  
### **TypeScript**
- Strong typing system ensures fewer runtime errors
- Made the codebase easier to maintain
- What my team used at Amazon, had a lot of prior experience

### **Vite**
- Super fast build tool and development server
- Chosen over Webpack for its simplicity and performance

### **Tailwind CSS**
- CSS framework that reduces context-switching between HTML and CSS files
- Encourages a responsive, mobile-first design approach
- Really helped easily make my own visual changes between Bolt's iterations

### **Lucide React**
- Lightweight, customizable icon library built for React
- Provides a wide range of cute icons
- Easy to integrate with Tailwind classes for consistent styling

---

## Backend & Database

### **Supabase**
A full Backend-as-a-Service (BaaS) solution chosen for its seamless integration and developer-friendly tooling.

- **PostgreSQL Database**  
  Provides relational consistency and advanced features like JSON support.  
  Supports Row Level Security (RLS) for fine-grained access control.  

- **Real-time Subscriptions**  
  Enables instant updates to journal entries and emotional analysis results.  

- **Authentication**  
  Handles user sign-up, login, and session management securely.  

- **Edge Functions**  
  Lightweight serverless functions running close to the user for low-latency AI processing.

#### Database Tables
- **`journal_entries`**: Stores user journal entries and prompts.  
- **`emotional_analysis_cache`**: Stores cached AI-generated emotional analysis results for faster retrieval.

---

## AI & Analysis

### **OpenAI GPT-4o-mini**
- Powers AI-driven features with fast inference and contextual awareness
- Chosen partially due to this [study](https://arxiv.org/pdf/2507.02990) that observes the free version of GPT-4o not failing safety protocol when handling suicidal messages
- Used in **4 Places**:
  - **Crisis detection**: Identifies self-harm risks.  
  - **Emotional analysis**: Assigns scores and sentiment values to entries.  
  - **Daily prompts**: Generates personalized writing prompts.  
  - **Theme analysis**: Detects monthly emotional and behavioral patterns.

### **Supabase Edge Functions**
Custom serverless functions to handle AI workflows securely and efficiently:

- **`crisis-detection`**: Flags journal entries with potential crisis indicators.  
- **`analyze-emotions`**: Runs sentiment and emotional scoring analysis.  
- **`analyze-themes`**: Identifies recurring monthly themes.  
- **`prompts`**: Generates personalized daily prompts.  
- **`send-crisis-email`**: Sends emergency contact notifications when necessary.  

---

## Development

### **Bolt (OpenAI Framework)**
- Full-stack framework built on **React** and **TypeScript**.  
- Provides an **integrated developer experience**: frontend + backend routes + AI workflows in one project.  
- Simplifies prototyping and deployment of AI-driven applications.  
- Chosen to reduce boilerplate and accelerate iteration speed.
- I had no prior experience with Bolt, and was informed by this [substack article](https://addyo.substack.com/p/ai-driven-prototyping-v0-bolt-and)
- Bolt seemed to give more support to backend development and I liked its Supabase integration features
---

## Why This Stack?

- **Developer Experience**: TypeScript, Vite, and Tailwind accelerate development while ensuring maintainability.  
- **Performance**: Supabase Edge Functions and GPT-4o-mini provide **low-latency AI features**.  
- **Scalability**: PostgreSQL with RLS supports secure, multi-user growth.  
- **User Safety**: Crisis detection and notification functions are central to the project’s mission.

  
---

## Future Enhancements
- Add email verification/Google login integration
- Buy an email domain so that crisis emails aren't sent from a personal Gmail account
- Switch from Google's email sending service after aquiring a domain to Resend, since Google limits the amount of emails you can send per day (wouldn't scale)
- Upgrade the AI model used to a paid model (GPT-5) that can process data faster, and provide better analysis
- Make UI improvements, such as a light mode theme, a more succinct color scheme, better branding

