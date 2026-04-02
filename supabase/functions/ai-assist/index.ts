import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, content, jobDescription, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "improve_cv":
        systemPrompt = "You are an expert career coach and CV writer. Improve the provided CV content to be more professional, impactful, and ATS-friendly. Use strong action verbs, quantify achievements, and ensure clear formatting. Return the improved content in the same JSON structure.";
        userPrompt = `Improve this CV content:\n${JSON.stringify(content)}`;
        break;

      case "generate_cover_letter":
        systemPrompt = "You are an expert cover letter writer. Generate a compelling, personalized cover letter based on the provided information. Make it professional, engaging, and tailored to the specific role and company.";
        userPrompt = `Generate a cover letter for:\nCompany: ${content.company}\nPosition: ${content.position}\nHiring Manager: ${content.hiringManager}\n\nCandidate background: ${content.background || "Not provided"}`;
        break;

      case "rewrite_tone":
        systemPrompt = `You are a professional writer. Rewrite the following text in a ${tone || "professional"} tone while maintaining the key information and message.`;
        userPrompt = `Rewrite this text:\n${content.text}`;
        break;

      case "match_job":
        systemPrompt = "You are an ATS optimization expert. Analyze the CV content against the job description. Return a JSON object with: matchScore (0-100), matchedKeywords (array), missingKeywords (array), suggestions (array of improvement strings).";
        userPrompt = `CV Content:\n${JSON.stringify(content)}\n\nJob Description:\n${jobDescription}`;
        break;

      case "generate_book_content":
        systemPrompt = "You are a professional writer and editor. Generate engaging book content based on the provided chapter information. Write in a clear, compelling style appropriate for the book's topic.";
        userPrompt = `Write content for this chapter:\nBook Title: ${content.bookTitle}\nChapter: ${content.chapterTitle}\nContext: ${content.context || "No additional context"}`;
        break;

      case "translate":
        systemPrompt = `You are a professional translator. Translate the text from ${content.sourceLang} to ${content.targetLang} using a ${tone || "professional"} tone. Maintain the original meaning and cultural appropriateness.`;
        userPrompt = `Translate this text:\n${content.text}`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
