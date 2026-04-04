import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useBookEngine() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const { toast } = useToast();

  const invoke = async (action: string, params: Record<string, unknown> = {}): Promise<any> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("book-engine", {
        body: { action, ...params },
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return null;
      }

      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return null;
      }

      return data?.result || null;
    } catch (e) {
      toast({ title: "Error", description: "Failed to connect to book engine", variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const createStrategy = (topic: string, audience?: string, depth?: string, tone?: string) => {
    setLoadingStep("Creating book strategy...");
    return invoke("create_strategy", { topic, audience, depth, tone });
  };

  const createOutline = (bookId: string, strategy: any) => {
    setLoadingStep("Building chapter outline...");
    return invoke("create_outline", { bookId, strategy });
  };

  const generateChapter = (params: {
    bookId: string;
    chapterId: string;
    chapterTitle: string;
    chapterHook?: string;
    chapterNumber: number;
    bookTitle: string;
    bookTone?: string;
    depth?: string;
    previousChaptersSummary?: string;
    sections?: string[];
  }) => {
    setLoadingStep(`Writing "${params.chapterTitle}"...`);
    return invoke("generate_chapter", params);
  };

  const improveChapter = (content: string, chapterId: string, bookTone?: string, instructions?: string) => {
    setLoadingStep("Improving chapter...");
    return invoke("improve_chapter", { content, chapterId, bookTone, instructions });
  };

  const quickGenerate = (topic: string, audience?: string, depth?: string, tone?: string) => {
    setLoadingStep("Generating full book...");
    return invoke("quick_generate", { topic, audience, depth, tone });
  };

  const repurpose = (bookId: string, bookTitle: string, chapterContents: string, assetTypes: string[]) => {
    setLoadingStep("Creating content...");
    return invoke("repurpose", { bookId, bookTitle, chapterContents, assetTypes });
  };

  const publishingPackage = (bookTitle: string, subtitle: string, targetAudience: string, bookSummary: string) => {
    setLoadingStep("Generating publishing package...");
    return invoke("publishing_package", { bookTitle, subtitle, targetAudience, bookSummary });
  };

  return {
    loading,
    loadingStep,
    createStrategy,
    createOutline,
    generateChapter,
    improveChapter,
    quickGenerate,
    repurpose,
    publishingPackage,
  };
}
