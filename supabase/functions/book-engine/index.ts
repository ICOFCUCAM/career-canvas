import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(apiKey: string, systemPrompt: string, userPrompt: string, model = "google/gemini-3-flash-preview"): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMITED");
    if (response.status === 402) throw new Error("CREDITS_EXHAUSTED");
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAIWithTools(apiKey: string, systemPrompt: string, userPrompt: string, tools: any[]): Promise<any> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools,
      tool_choice: { type: "function", function: { name: tools[0].function.name } },
      stream: false,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMITED");
    if (response.status === 402) throw new Error("CREDITS_EXHAUSTED");
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }
  // Fallback: try to parse raw content as JSON
  const raw = data.choices?.[0]?.message?.content || "{}";
  try { return JSON.parse(raw); } catch { return { error: "Failed to parse" }; }
}

const strategyTool = {
  type: "function",
  function: {
    name: "create_book_strategy",
    description: "Create a book strategy with title, structure, and publishing info",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        targetAudience: { type: "string" },
        positioning: { type: "string" },
        tone: { type: "string" },
        chapterCount: { type: "number" },
        valueProposition: { type: "string" },
        description: { type: "string", description: "Book description for publishing" },
        keywords: { type: "array", items: { type: "string" } },
        categories: { type: "array", items: { type: "string" } },
        authorBio: { type: "string" },
        coverDirection: {
          type: "object",
          properties: {
            style: { type: "string" },
            colors: { type: "string" },
            typography: { type: "string" },
          },
        },
      },
      required: ["title", "subtitle", "targetAudience", "positioning", "tone", "chapterCount", "valueProposition", "description", "keywords", "categories"],
    },
  },
};

const outlineTool = {
  type: "function",
  function: {
    name: "create_outline",
    description: "Create a detailed chapter outline for the book",
    parameters: {
      type: "object",
      properties: {
        chapters: {
          type: "array",
          items: {
            type: "object",
            properties: {
              number: { type: "number" },
              title: { type: "string" },
              hook: { type: "string", description: "Compelling opening hook for this chapter" },
              sections: { type: "array", items: { type: "string" } },
              keyInsights: { type: "array", items: { type: "string" } },
            },
            required: ["number", "title", "hook", "sections", "keyInsights"],
          },
        },
        introduction: { type: "string", description: "Book introduction content" },
        conclusion: { type: "string", description: "Book conclusion content" },
      },
      required: ["chapters", "introduction", "conclusion"],
    },
  },
};

const repurposeTool = {
  type: "function",
  function: {
    name: "repurpose_content",
    description: "Generate repurposed content from book material",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["blog_post", "social_media", "newsletter", "course_outline", "video_script", "sales_page"] },
              title: { type: "string" },
              content: { type: "string" },
            },
            required: ["type", "title", "content"],
          },
        },
      },
      required: ["items"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    const antiRepetitionGuide = `
CRITICAL WRITING RULES:
- Never repeat the same idea, phrase, or concept across chapters
- Use varied sentence structures and lengths
- Each paragraph should be 2-4 sentences max for readability
- Start chapters with a strong, specific hook (NOT "In this chapter..." or "Let's explore...")
- End chapters with actionable takeaways or thought-provoking summaries
- Include real-world examples, case studies, or scenarios
- Write with energy and conviction, avoid generic filler
- Vary transitions between sections
- Each chapter must add unique value not covered elsewhere`;

    switch (action) {
      // ========== STRATEGY ==========
      case "create_strategy": {
        const { topic, audience, depth, tone } = params;
        const strategy = await callAIWithTools(
          LOVABLE_API_KEY,
          `You are a bestselling book strategist and publishing expert. Create a comprehensive book strategy. The book should be ${depth || "standard"} depth. Plan BEFORE writing. Think about value proposition, unique angle, and market positioning.`,
          `Create a book strategy for topic: "${topic}"\nTarget audience: ${audience || "general readers"}\nTone: ${tone || "professional"}\nDepth: ${depth || "standard"}`,
          [strategyTool]
        );

        return new Response(JSON.stringify({ result: strategy }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== OUTLINE ==========
      case "create_outline": {
        const { bookId, strategy } = params;
        const outline = await callAIWithTools(
          LOVABLE_API_KEY,
          `You are a master book architect. Create a detailed chapter-by-chapter outline. Each chapter must have a compelling hook, clear sections, and key insights. Ensure logical flow with no repetition between chapters. ${antiRepetitionGuide}`,
          `Book: "${strategy.title}" — ${strategy.subtitle}\nAudience: ${strategy.targetAudience}\nPositioning: ${strategy.positioning}\nTone: ${strategy.tone}\nNumber of chapters: ${strategy.chapterCount || 8}\n\nCreate a detailed outline ensuring each chapter covers unique material.`,
          [outlineTool]
        );

        // Save chapters to DB
        if (outline.chapters && bookId) {
          const chapterInserts = outline.chapters.map((ch: any) => ({
            book_id: bookId,
            user_id: user.id,
            chapter_number: ch.number,
            title: ch.title,
            hook: ch.hook,
            content: "",
            status: "draft",
          }));
          await supabase.from("chapters").insert(chapterInserts);

          // Update book with front/back matter
          await supabase.from("books").update({
            front_matter: { introduction: outline.introduction },
            back_matter: { conclusion: outline.conclusion },
            status: "draft",
          }).eq("id", bookId);
        }

        return new Response(JSON.stringify({ result: outline }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== GENERATE CHAPTER ==========
      case "generate_chapter": {
        const { bookId, chapterId, chapterTitle, chapterHook, chapterNumber, bookTitle, bookTone, depth, previousChaptersSummary, sections } = params;

        const depthGuide = depth === "short" ? "Write 800-1200 words." :
          depth === "detailed" ? "Write 2500-4000 words with deep analysis." :
          "Write 1500-2500 words.";

        const content = await callAI(
          LOVABLE_API_KEY,
          `You are a bestselling author known for engaging, insightful writing. ${antiRepetitionGuide}
          
STRUCTURE EACH CHAPTER:
1. Start with the provided hook — expand it into a gripping opening paragraph
2. Flow through clear, well-organized sections
3. Include real-world examples, case studies, or practical scenarios
4. Add actionable insights and practical takeaways
5. End with a memorable summary or call-to-action
6. Use short, punchy paragraphs (2-4 sentences)
7. ${depthGuide}
8. Tone: ${bookTone || "professional"}`,
          `Write Chapter ${chapterNumber}: "${chapterTitle}" for the book "${bookTitle}"
          
Opening hook: ${chapterHook || "Create a compelling hook"}
Sections to cover: ${sections?.join(", ") || "Use your judgment for the best section flow"}

${previousChaptersSummary ? `IMPORTANT - These topics have already been covered in previous chapters (DO NOT REPEAT): ${previousChaptersSummary}` : ""}

Write the full chapter content now. Do NOT include the chapter title as a heading — start directly with the hook/content.`
        );

        // Save to DB
        if (chapterId) {
          const wordCount = content.split(/\s+/).filter(Boolean).length;
          await supabase.from("chapters").update({
            content,
            word_count: wordCount,
            status: "complete",
          }).eq("id", chapterId);
        }

        return new Response(JSON.stringify({ result: content }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== IMPROVE CHAPTER ==========
      case "improve_chapter": {
        const { content, chapterId, bookTone, instructions } = params;
        const improved = await callAI(
          LOVABLE_API_KEY,
          `You are a professional editor who enhances book content. ${antiRepetitionGuide}
Improve the chapter while maintaining the author's voice and tone (${bookTone || "professional"}).
Focus on: stronger hooks, better flow, more vivid examples, clearer insights, punchier paragraphs.
${instructions ? `Additional instructions: ${instructions}` : ""}`,
          `Improve this chapter content:\n\n${content}`
        );

        if (chapterId) {
          const wordCount = improved.split(/\s+/).filter(Boolean).length;
          await supabase.from("chapters").update({
            content: improved,
            word_count: wordCount,
            status: "improved",
          }).eq("id", chapterId);
        }

        return new Response(JSON.stringify({ result: improved }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== QUICK GENERATE (Full Book) ==========
      case "quick_generate": {
        const { topic, audience, depth, tone } = params;

        // Step 1: Strategy
        const strategy = await callAIWithTools(
          LOVABLE_API_KEY,
          `You are a bestselling book strategist. Create a comprehensive book strategy for a ${depth || "standard"} depth book.`,
          `Create a book strategy for: "${topic}"\nAudience: ${audience || "general readers"}\nTone: ${tone || "professional"}`,
          [strategyTool]
        );

        // Create book in DB
        const { data: book, error: bookErr } = await supabase.from("books").insert({
          user_id: user.id,
          title: strategy.title || topic,
          subtitle: strategy.subtitle,
          target_audience: strategy.targetAudience,
          positioning: strategy.positioning,
          tone: strategy.tone || tone || "professional",
          depth: depth || "standard",
          status: "generating",
          description: strategy.description,
          keywords: strategy.keywords || [],
          categories: strategy.categories || [],
          author_bio: strategy.authorBio,
          cover_direction: strategy.coverDirection || {},
          strategy,
        }).select().single();

        if (bookErr || !book) throw new Error("Failed to create book record");

        // Step 2: Outline
        const outline = await callAIWithTools(
          LOVABLE_API_KEY,
          `You are a master book architect. Create a detailed outline. ${antiRepetitionGuide}`,
          `Book: "${strategy.title}" — ${strategy.subtitle}\nAudience: ${strategy.targetAudience}\nChapters: ${strategy.chapterCount || 8}\nCreate unique, non-overlapping chapters.`,
          [outlineTool]
        );

        // Save front/back matter
        await supabase.from("books").update({
          front_matter: { introduction: outline.introduction },
          back_matter: { conclusion: outline.conclusion },
        }).eq("id", book.id);

        // Step 3: Generate each chapter
        const chapterSummaries: string[] = [];
        for (const ch of (outline.chapters || [])) {
          const depthGuide = depth === "short" ? "800-1200 words" : depth === "detailed" ? "2500-4000 words" : "1500-2500 words";

          const chapterContent = await callAI(
            LOVABLE_API_KEY,
            `You are a bestselling author. ${antiRepetitionGuide}\nTone: ${strategy.tone || "professional"}\nWrite ${depthGuide}.`,
            `Write Chapter ${ch.number}: "${ch.title}" for "${strategy.title}"
Hook: ${ch.hook}
Sections: ${ch.sections?.join(", ") || ""}
${chapterSummaries.length > 0 ? `ALREADY COVERED (do NOT repeat): ${chapterSummaries.join("; ")}` : ""}
Start directly with content, no chapter title heading.`
          );

          const wordCount = chapterContent.split(/\s+/).filter(Boolean).length;
          await supabase.from("chapters").insert({
            book_id: book.id,
            user_id: user.id,
            chapter_number: ch.number,
            title: ch.title,
            hook: ch.hook,
            content: chapterContent,
            word_count: wordCount,
            status: "complete",
          });

          // Track summaries for anti-repetition
          chapterSummaries.push(`Ch${ch.number} "${ch.title}": ${ch.keyInsights?.slice(0, 2).join(", ") || ch.title}`);
        }

        // Step 4: Mark complete
        await supabase.from("books").update({ status: "complete" }).eq("id", book.id);

        return new Response(JSON.stringify({ result: { bookId: book.id, strategy, outline } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== REPURPOSE ==========
      case "repurpose": {
        const { bookId, bookTitle, chapterContents, assetTypes } = params;
        const repurposed = await callAIWithTools(
          LOVABLE_API_KEY,
          `You are a content marketing expert. Transform book content into various marketing and educational formats. Each piece should stand alone and be immediately usable. Adapt the tone and format appropriately for each medium.`,
          `Book: "${bookTitle}"\nContent summary:\n${chapterContents}\n\nGenerate the following content types: ${assetTypes.join(", ")}. Each piece should be polished and ready to publish.`,
          [repurposeTool]
        );

        // Save assets to DB
        if (repurposed.items && bookId) {
          const inserts = repurposed.items.map((item: any) => ({
            user_id: user.id,
            book_id: bookId,
            asset_type: item.type,
            title: item.title,
            content: item.content,
          }));
          await supabase.from("generated_assets").insert(inserts);
        }

        return new Response(JSON.stringify({ result: repurposed }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ========== PUBLISHING PACKAGE ==========
      case "publishing_package": {
        const { bookTitle, subtitle, targetAudience, bookSummary } = params;
        const pkg = await callAIWithTools(
          LOVABLE_API_KEY,
          `You are a publishing and marketing expert. Generate a complete publishing package.`,
          `Book: "${bookTitle}" — ${subtitle}\nAudience: ${targetAudience}\nSummary: ${bookSummary}\n\nGenerate: description (compelling book blurb, 200-300 words), keywords (15-20 SEO-optimized), categories (3-5 BISAC-style), author bio suggestion.`,
          [{
            type: "function",
            function: {
              name: "create_publishing_package",
              description: "Generate publishing metadata",
              parameters: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } },
                  categories: { type: "array", items: { type: "string" } },
                  authorBio: { type: "string" },
                  coverDirection: {
                    type: "object",
                    properties: {
                      style: { type: "string" },
                      colors: { type: "string" },
                      typography: { type: "string" },
                      mood: { type: "string" },
                    },
                  },
                },
                required: ["description", "keywords", "categories", "authorBio", "coverDirection"],
              },
            },
          }]
        );

        return new Response(JSON.stringify({ result: pkg }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("book-engine error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "RATE_LIMITED" ? 429 : msg === "CREDITS_EXHAUSTED" ? 402 : 500;
    const userMsg = msg === "RATE_LIMITED" ? "Rate limited. Please try again in a moment." :
      msg === "CREDITS_EXHAUSTED" ? "AI credits exhausted. Please add funds." : msg;
    return new Response(JSON.stringify({ error: userMsg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
