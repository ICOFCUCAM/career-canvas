import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIAssistOptions {
  action: string;
  content: Record<string, unknown>;
  jobDescription?: string;
  tone?: string;
}

export function useAIAssist() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const assist = async (options: AIAssistOptions): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: options,
      });

      if (error) {
        toast({ title: "AI Error", description: error.message, variant: "destructive" });
        return null;
      }

      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return null;
      }

      return data?.result || null;
    } catch (e) {
      toast({ title: "Error", description: "Failed to connect to AI service", variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { assist, loading };
}
