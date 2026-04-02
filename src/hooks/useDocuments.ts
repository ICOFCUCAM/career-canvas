import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type DocumentType = Database["public"]["Enums"]["document_type"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];

export function useDocuments(type?: DocumentType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["documents", type],
    queryFn: async () => {
      let query = supabase.from("documents").select("*").order("updated_at", { ascending: false });
      if (type) query = query.eq("type", type);
      const { data, error } = await query;
      if (error) throw error;
      return data as DocumentRow[];
    },
    enabled: !!user,
  });
}

export function useDocument(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as DocumentRow;
    },
    enabled: !!user && !!id,
  });
}

export function useSaveDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (doc: { id?: string; title: string; type: DocumentType; content: Record<string, unknown> }) => {
      if (!user) throw new Error("Not authenticated");

      if (doc.id) {
        const { data, error } = await supabase
          .from("documents")
          .update({ title: doc.title, content: doc.content as unknown as Database["public"]["Tables"]["documents"]["Update"]["content"] })
          .eq("id", doc.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("documents")
          .insert({ title: doc.title, type: doc.type, content: doc.content as unknown as DocumentInsert["content"], user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Saved", description: "Document saved successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Deleted", description: "Document deleted." });
    },
  });
}
