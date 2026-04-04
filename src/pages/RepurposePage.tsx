import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy, FileText, Mail, Video, BookOpen, Megaphone, GraduationCap,
  Sparkles, Loader2, Trash2, Download, Share2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookEngine } from "@/hooks/useBookEngine";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const assetTypes = [
  { value: "blog_post", label: "Blog Posts", icon: FileText, desc: "SEO-optimized articles from your book content" },
  { value: "social_media", label: "Social Media", icon: Share2, desc: "Engaging posts for LinkedIn, Twitter, etc." },
  { value: "newsletter", label: "Email Newsletter", icon: Mail, desc: "Newsletter series from your chapters" },
  { value: "course_outline", label: "Course Outline", icon: GraduationCap, desc: "Educational course structure" },
  { value: "video_script", label: "Video Scripts", icon: Video, desc: "YouTube/webinar scripts" },
  { value: "sales_page", label: "Sales Page", icon: Megaphone, desc: "Marketing copy for your book" },
];

export default function RepurposePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const engine = useBookEngine();
  const queryClient = useQueryClient();

  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["blog_post", "social_media"]);

  // Fetch books
  const { data: books = [] } = useQuery({
    queryKey: ["books", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch generated assets
  const { data: assets = [], refetch: refetchAssets } = useQuery({
    queryKey: ["generated-assets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_assets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleGenerate = async () => {
    if (!selectedBook || selectedTypes.length === 0) return;
    const book = books.find((b: any) => b.id === selectedBook);
    if (!book) return;

    // Fetch chapters for summary
    const { data: chapters } = await supabase
      .from("chapters")
      .select("title, content")
      .eq("book_id", selectedBook)
      .order("chapter_number");

    const chapterContents = (chapters || [])
      .map((c: any) => `## ${c.title}\n${(c.content || "").slice(0, 500)}`)
      .join("\n\n");

    const result = await engine.repurpose(selectedBook, book.title, chapterContents, selectedTypes);
    if (result) {
      refetchAssets();
      toast({ title: "Content generated!", description: `${result.items?.length || 0} pieces created.` });
    }
  };

  const handleDeleteAsset = async (id: string) => {
    await supabase.from("generated_assets").delete().eq("id", id);
    refetchAssets();
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const bookAssets = selectedBook ? assets.filter((a: any) => a.book_id === selectedBook) : assets;

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-5xl animate-fade-in">
        <PageHeader
          title="Content Repurposing"
          subtitle="Transform your books into blog posts, social media, newsletters, and more"
        />

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="library">Library ({assets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Book selector */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold">Select Source Book</h2>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger><SelectValue placeholder="Choose a book..." /></SelectTrigger>
                <SelectContent>
                  {books.map((book: any) => (
                    <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {books.length === 0 && (
                <p className="text-sm text-muted-foreground">No books found. Create a book first in the Book Creator.</p>
              )}
            </div>

            {/* Content types */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold">Content Types</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {assetTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => toggleType(type.value)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      selectedTypes.includes(type.value) ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <type.icon className={`h-4 w-4 mt-0.5 shrink-0 ${selectedTypes.includes(type.value) ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full gap-2" size="lg" onClick={handleGenerate}
              disabled={engine.loading || !selectedBook || selectedTypes.length === 0}>
              {engine.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {engine.loading ? engine.loadingStep || "Generating..." : `Generate ${selectedTypes.length} Content Type${selectedTypes.length > 1 ? "s" : ""}`}
            </Button>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            {bookAssets.length === 0 ? (
              <div className="text-center py-12">
                <Copy className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">No content generated yet. Select a book and generate content above.</p>
              </div>
            ) : (
              bookAssets.map((asset: any) => {
                const typeInfo = assetTypes.find((t) => t.value === asset.asset_type);
                return (
                  <div key={asset.id} className="glass-card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs gap-1">
                          {typeInfo && <typeInfo.icon className="h-3 w-3" />}
                          {typeInfo?.label || asset.asset_type}
                        </Badge>
                        <h3 className="font-medium text-sm">{asset.title}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => {
                          navigator.clipboard.writeText(asset.content);
                          toast({ title: "Copied to clipboard!" });
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteAsset(asset.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{asset.content}</p>
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(asset.content);
                      toast({ title: "Full content copied!" });
                    }}>
                      <Copy className="h-3 w-3 mr-1" /> Copy Full Content
                    </Button>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WorkspaceLayout>
  );
}
