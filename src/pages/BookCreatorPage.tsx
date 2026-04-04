import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Trash2, Sparkles, Download, BookOpen, Tag, User, GripVertical,
  Zap, Wand2, RefreshCw, BarChart3, FileText, Loader2, ChevronRight,
  Copy, Lightbulb, Target, PenTool, Package, ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookEngine } from "@/hooks/useBookEngine";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import bookCreatorImg from "@/assets/book-creator-illustration.jpg";

type BookMode = "select" | "quick" | "guided" | "editor";
type GuidedStep = "strategy" | "outline" | "chapters" | "enhance" | "publish";

export default function BookCreatorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const engine = useBookEngine();

  // Mode state
  const [mode, setMode] = useState<BookMode>("select");
  const [guidedStep, setGuidedStep] = useState<GuidedStep>("strategy");

  // Quick generate
  const [quickTopic, setQuickTopic] = useState("");
  const [quickAudience, setQuickAudience] = useState("");
  const [quickDepth, setQuickDepth] = useState("standard");
  const [quickTone, setQuickTone] = useState("professional");

  // Guided creation
  const [strategy, setStrategy] = useState<any>(null);
  const [outline, setOutline] = useState<any>(null);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);

  // Editor
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [improveInstructions, setImproveInstructions] = useState("");

  // Fetch user's books
  const { data: books = [] } = useQuery({
    queryKey: ["books", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch chapters for current book
  const { data: chapters = [], refetch: refetchChapters } = useQuery({
    queryKey: ["chapters", currentBookId],
    queryFn: async () => {
      if (!currentBookId) return [];
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", currentBookId)
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!currentBookId,
  });

  const currentBook = books.find((b: any) => b.id === currentBookId);
  const activeChapter = chapters.find((c: any) => c.id === activeChapterId);

  // Set first chapter as active when chapters load
  useEffect(() => {
    if (chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(chapters[0].id);
    }
  }, [chapters, activeChapterId]);

  // ========== HANDLERS ==========

  const handleQuickGenerate = async () => {
    if (!quickTopic.trim()) return;
    const result = await engine.quickGenerate(quickTopic, quickAudience, quickDepth, quickTone);
    if (result?.bookId) {
      setCurrentBookId(result.bookId);
      setMode("editor");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Book generated!", description: "Your full book has been created." });
    }
  };

  const handleCreateStrategy = async () => {
    if (!quickTopic.trim()) return;
    const result = await engine.createStrategy(quickTopic, quickAudience, quickDepth, quickTone);
    if (result) {
      setStrategy(result);
      // Create book record
      const { data: book } = await supabase.from("books").insert({
        user_id: user!.id,
        title: result.title || quickTopic,
        subtitle: result.subtitle,
        target_audience: result.targetAudience,
        positioning: result.positioning,
        tone: result.tone || quickTone,
        depth: quickDepth,
        status: "draft",
        description: result.description,
        keywords: result.keywords || [],
        categories: result.categories || [],
        author_bio: result.authorBio,
        cover_direction: result.coverDirection || {},
        strategy: result,
      }).select().single();

      if (book) {
        setCurrentBookId(book.id);
        queryClient.invalidateQueries({ queryKey: ["books"] });
      }
      setGuidedStep("outline");
    }
  };

  const handleCreateOutline = async () => {
    if (!currentBookId || !strategy) return;
    const result = await engine.createOutline(currentBookId, strategy);
    if (result) {
      setOutline(result);
      refetchChapters();
      setGuidedStep("chapters");
    }
  };

  const handleGenerateChapter = async (chapter: any) => {
    if (!currentBookId || !currentBook) return;
    const prevSummaries = chapters
      .filter((c: any) => c.chapter_number < chapter.chapter_number && c.content)
      .map((c: any) => `Ch${c.chapter_number} "${c.title}": ${c.content.slice(0, 200)}`)
      .join("; ");

    await engine.generateChapter({
      bookId: currentBookId,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterHook: chapter.hook,
      chapterNumber: chapter.chapter_number,
      bookTitle: currentBook.title,
      bookTone: currentBook.tone,
      depth: currentBook.depth,
      previousChaptersSummary: prevSummaries,
    });
    refetchChapters();
  };

  const handleGenerateAllChapters = async () => {
    const drafts = chapters.filter((c: any) => c.status === "draft");
    for (const ch of drafts) {
      await handleGenerateChapter(ch);
    }
    toast({ title: "All chapters generated!" });
    setGuidedStep("enhance");
  };

  const handleImproveChapter = async () => {
    if (!activeChapter?.content) return;
    await engine.improveChapter(activeChapter.content, activeChapter.id, currentBook?.tone, improveInstructions);
    refetchChapters();
    setImproveInstructions("");
    toast({ title: "Chapter improved!" });
  };

  const handleOpenBook = (bookId: string) => {
    setCurrentBookId(bookId);
    setActiveChapterId(null);
    setMode("editor");
  };

  const handleDeleteBook = async (bookId: string) => {
    await supabase.from("books").delete().eq("id", bookId);
    queryClient.invalidateQueries({ queryKey: ["books"] });
    if (currentBookId === bookId) {
      setCurrentBookId(null);
      setMode("select");
    }
    toast({ title: "Book deleted" });
  };

  const handleUpdateChapterContent = async (chapterId: string, content: string) => {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    await supabase.from("chapters").update({ content, word_count: wordCount }).eq("id", chapterId);
  };

  const totalWords = chapters.reduce((sum: number, c: any) => sum + (c.word_count || 0), 0);
  const completedChapters = chapters.filter((c: any) => c.status !== "draft").length;
  const progress = chapters.length > 0 ? Math.round((completedChapters / chapters.length) * 100) : 0;

  // ========== RENDER ==========

  // MODE SELECT
  if (mode === "select") {
    return (
      <WorkspaceLayout>
        <div className="mx-auto max-w-6xl animate-fade-in">
          <PageHeader title="Book Creator" subtitle="Write, structure, and publish professional books with AI" />

          <div className="mb-6 overflow-hidden rounded-xl border">
            <img src={bookCreatorImg} alt="Book creation" loading="lazy" className="w-full h-36 object-cover" />
          </div>

          {/* Creation Modes */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <button onClick={() => setMode("quick")} className="glass-card-hover p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><Zap className="h-5 w-5 text-primary" /></div>
                <h3 className="font-semibold">Quick Generate</h3>
              </div>
              <p className="text-sm text-muted-foreground">One-click full book generation. Enter a topic and get a complete book with chapters, structure, and publishing package.</p>
            </button>

            <button onClick={() => setMode("guided")} className="glass-card-hover p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/50 p-2"><Target className="h-5 w-5 text-primary" /></div>
                <h3 className="font-semibold">Guided Creation</h3>
              </div>
              <p className="text-sm text-muted-foreground">Step-by-step book building: strategy → outline → chapters → enhancement → publishing.</p>
            </button>

            <button onClick={() => { setMode("editor"); setCurrentBookId(null); }} className="glass-card-hover p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary p-2"><PenTool className="h-5 w-5 text-primary" /></div>
                <h3 className="font-semibold">Manual Editor</h3>
              </div>
              <p className="text-sm text-muted-foreground">Write freely with AI assistance. Full control over structure and content.</p>
            </button>
          </div>

          {/* Existing Books */}
          {books.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mb-3">Your Books</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book: any) => (
                  <div key={book.id} className="glass-card p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{book.title}</h3>
                        {book.subtitle && <p className="text-xs text-muted-foreground truncate">{book.subtitle}</p>}
                      </div>
                      <Badge variant={book.status === "complete" ? "default" : book.status === "generating" ? "secondary" : "outline"}>
                        {book.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleOpenBook(book.id)}>
                        <BookOpen className="h-3 w-3" /> Open
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteBook(book.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </WorkspaceLayout>
    );
  }

  // QUICK GENERATE MODE
  if (mode === "quick") {
    return (
      <WorkspaceLayout>
        <div className="mx-auto max-w-2xl animate-fade-in">
          <Button variant="ghost" size="sm" onClick={() => setMode("select")} className="mb-4 gap-1">
            ← Back
          </Button>
          <PageHeader title="Quick Generate Book" subtitle="Enter a topic and AI generates your entire book" />

          <div className="glass-card p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Book Topic / Title *</label>
              <Input placeholder="e.g. The Art of Remote Leadership" value={quickTopic} onChange={(e) => setQuickTopic(e.target.value)} className="text-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Input placeholder="e.g. First-time managers at tech companies" value={quickAudience} onChange={(e) => setQuickAudience(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Depth</label>
                <Select value={quickDepth} onValueChange={setQuickDepth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (800-1200 words/chapter)</SelectItem>
                    <SelectItem value="standard">Standard (1500-2500 words/chapter)</SelectItem>
                    <SelectItem value="detailed">Detailed (2500-4000 words/chapter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select value={quickTone} onValueChange={setQuickTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="witty">Witty & Engaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full gap-2" size="lg" onClick={handleQuickGenerate} disabled={engine.loading || !quickTopic.trim()}>
              {engine.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {engine.loading ? engine.loadingStep || "Generating..." : "Generate Full Book"}
            </Button>

            {engine.loading && (
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{engine.loadingStep}</p>
                <p className="text-xs text-muted-foreground mt-1">This may take 2-5 minutes for a full book</p>
              </div>
            )}
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  // GUIDED MODE
  if (mode === "guided") {
    const steps: { key: GuidedStep; label: string; icon: any }[] = [
      { key: "strategy", label: "Strategy", icon: Lightbulb },
      { key: "outline", label: "Outline", icon: FileText },
      { key: "chapters", label: "Chapters", icon: PenTool },
      { key: "enhance", label: "Enhance", icon: Wand2 },
      { key: "publish", label: "Publish", icon: Package },
    ];

    return (
      <WorkspaceLayout>
        <div className="mx-auto max-w-4xl animate-fade-in">
          <Button variant="ghost" size="sm" onClick={() => setMode("select")} className="mb-4 gap-1">
            ← Back
          </Button>
          <PageHeader title="Guided Book Creation" subtitle="Build your book step by step with AI assistance" />

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2">
                <button
                  onClick={() => setGuidedStep(step.key)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    guidedStep === step.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-3.5 w-3.5" />
                  {step.label}
                </button>
                {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>

          {/* Step: Strategy */}
          {guidedStep === "strategy" && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Define Your Book</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Book Topic / Title *</label>
                <Input placeholder="e.g. The Art of Remote Leadership" value={quickTopic} onChange={(e) => setQuickTopic(e.target.value)} className="text-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Input placeholder="e.g. First-time managers at tech companies" value={quickAudience} onChange={(e) => setQuickAudience(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Depth</label>
                  <Select value={quickDepth} onValueChange={setQuickDepth}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={quickTone} onValueChange={setQuickTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="witty">Witty & Engaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={handleCreateStrategy} disabled={engine.loading || !quickTopic.trim()}>
                {engine.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {engine.loading ? "Generating Strategy..." : "Generate Book Strategy"}
              </Button>

              {strategy && (
                <div className="rounded-lg border bg-secondary/30 p-4 space-y-2 mt-4">
                  <h3 className="font-semibold">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground">{strategy.subtitle}</p>
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div><span className="font-medium">Audience:</span> {strategy.targetAudience}</div>
                    <div><span className="font-medium">Chapters:</span> {strategy.chapterCount}</div>
                    <div><span className="font-medium">Tone:</span> {strategy.tone}</div>
                  </div>
                  <p className="text-sm">{strategy.valueProposition}</p>
                  <Button size="sm" className="gap-1" onClick={() => setGuidedStep("outline")}>
                    Continue to Outline <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step: Outline */}
          {guidedStep === "outline" && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Chapter Outline</h2>
              {!outline ? (
                <Button className="w-full gap-2" onClick={handleCreateOutline} disabled={engine.loading || !strategy}>
                  {engine.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {engine.loading ? "Building Outline..." : "Generate Chapter Outline"}
                </Button>
              ) : (
                <div className="space-y-3">
                  {outline.chapters?.map((ch: any, i: number) => (
                    <div key={i} className="rounded-lg border p-3 space-y-1">
                      <h4 className="font-medium">Chapter {ch.number}: {ch.title}</h4>
                      <p className="text-xs text-primary italic">{ch.hook}</p>
                      <div className="flex flex-wrap gap-1">
                        {ch.sections?.map((s: string, j: number) => (
                          <Badge key={j} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button size="sm" className="gap-1" onClick={() => setGuidedStep("chapters")}>
                    Continue to Writing <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step: Chapters */}
          {guidedStep === "chapters" && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2"><PenTool className="h-4 w-4" /> Generate Chapters</h2>
                <Badge variant="outline">{completedChapters}/{chapters.length} complete</Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="space-y-2">
                {chapters.map((ch: any) => (
                  <div key={ch.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground">{ch.chapter_number}.</span>
                      <div>
                        <p className="text-sm font-medium">{ch.title}</p>
                        <p className="text-xs text-muted-foreground">{ch.word_count || 0} words</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ch.status === "complete" || ch.status === "improved" ? "default" : "outline"} className="text-xs">
                        {ch.status}
                      </Badge>
                      {ch.status === "draft" && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handleGenerateChapter(ch)} disabled={engine.loading}>
                          {engine.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          Generate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={handleGenerateAllChapters} disabled={engine.loading}>
                  {engine.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Generate All Remaining
                </Button>
                <Button variant="outline" onClick={() => setGuidedStep("enhance")} disabled={completedChapters === 0}>
                  Next <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Enhance */}
          {guidedStep === "enhance" && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><Wand2 className="h-4 w-4" /> Enhance & Improve</h2>
              <p className="text-sm text-muted-foreground">Select a chapter to improve, or open the full editor.</p>
              <div className="space-y-2">
                {chapters.filter((c: any) => c.content).map((ch: any) => (
                  <div key={ch.id} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">{ch.chapter_number}. {ch.title}</span>
                    <Button size="sm" variant="outline" className="gap-1" onClick={async () => {
                      await engine.improveChapter(ch.content, ch.id, currentBook?.tone);
                      refetchChapters();
                      toast({ title: `"${ch.title}" improved!` });
                    }} disabled={engine.loading}>
                      <Wand2 className="h-3 w-3" /> Improve
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setMode("editor"); }}>
                  Open Full Editor
                </Button>
                <Button className="flex-1 gap-1" onClick={() => setGuidedStep("publish")}>
                  Publishing <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Publish */}
          {guidedStep === "publish" && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Publishing Package</h2>
              <p className="text-sm text-muted-foreground">Generate your publishing metadata and export your book.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="gap-2 h-auto py-4 flex-col" onClick={async () => {
                  if (!currentBook) return;
                  const summary = chapters.map((c: any) => c.title).join(", ");
                  const result = await engine.publishingPackage(currentBook.title, currentBook.subtitle || "", currentBook.target_audience || "", summary);
                  if (result) {
                    await supabase.from("books").update({
                      description: result.description,
                      keywords: result.keywords,
                      categories: result.categories,
                      author_bio: result.authorBio,
                      cover_direction: result.coverDirection,
                    }).eq("id", currentBookId);
                    queryClient.invalidateQueries({ queryKey: ["books"] });
                    toast({ title: "Publishing package generated!" });
                  }
                }} disabled={engine.loading}>
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Generate Publishing Package</span>
                </Button>

                <Button variant="outline" className="gap-2 h-auto py-4 flex-col" onClick={() => navigate("/repurpose")}>
                  <Copy className="h-5 w-5" />
                  <span className="text-sm font-medium">Repurpose Content</span>
                </Button>
              </div>

              <Separator />

              <h3 className="font-medium text-sm">Export</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" /> PDF</Button>
                <Button variant="outline" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" /> DOCX</Button>
                <Button variant="outline" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" /> EPUB</Button>
              </div>

              <Button className="w-full" onClick={() => setMode("editor")}>
                Open Full Editor
              </Button>
            </div>
          )}
        </div>
      </WorkspaceLayout>
    );
  }

  // EDITOR MODE
  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <PageHeader
          title={currentBook?.title || "Book Editor"}
          subtitle={currentBook?.subtitle || "Write and edit your book"}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setMode("select"); setCurrentBookId(null); setActiveChapterId(null); }}>
                ← Books
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate("/repurpose")}>
                <Copy className="h-3.5 w-3.5" /> Repurpose
              </Button>
              <Button variant="outline" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" /> PDF</Button>
              <Button variant="outline" size="sm" className="gap-1"><Download className="h-3.5 w-3.5" /> DOCX</Button>
              <Button size="sm" className="gap-1"><Download className="h-3.5 w-3.5" /> EPUB</Button>
            </div>
          }
        />

        {/* Stats bar */}
        {currentBook && (
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{chapters.length} chapters</span>
            <span>{totalWords.toLocaleString()} words</span>
            <span>{completedChapters}/{chapters.length} complete</span>
            <Progress value={progress} className="h-1.5 w-32" />
            <Badge variant="outline">{currentBook.status}</Badge>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[240px_1fr_260px]">
          {/* Chapter List */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Chapters</h2>
              <Button variant="ghost" size="sm" onClick={async () => {
                if (!currentBookId || !user) return;
                const nextNum = chapters.length + 1;
                const { data } = await supabase.from("chapters").insert({
                  book_id: currentBookId,
                  user_id: user.id,
                  chapter_number: nextNum,
                  title: `Chapter ${nextNum}`,
                }).select().single();
                refetchChapters();
                if (data) setActiveChapterId(data.id);
              }}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {chapters.map((ch: any) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapterId(ch.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeChapterId === ch.id ? "bg-surface-active text-primary font-medium" : "text-muted-foreground hover:bg-surface-hover"
                }`}
              >
                <GripVertical className="h-3 w-3 shrink-0 opacity-40" />
                <span className="truncate flex-1">{ch.chapter_number}. {ch.title}</span>
                {ch.status === "complete" && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                {ch.status === "improved" && <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="space-y-4">
            {activeChapter ? (
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={activeChapter.title}
                    onChange={async (e) => {
                      await supabase.from("chapters").update({ title: e.target.value }).eq("id", activeChapter.id);
                      refetchChapters();
                    }}
                    className="max-w-xs font-semibold"
                    placeholder="Chapter Title"
                  />
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleGenerateChapter(activeChapter)} disabled={engine.loading}>
                      {engine.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {activeChapter.content ? "Regenerate" : "Generate"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      await supabase.from("chapters").delete().eq("id", activeChapter.id);
                      setActiveChapterId(null);
                      refetchChapters();
                    }}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>

                {activeChapter.hook && (
                  <div className="rounded-lg bg-primary/5 p-3 text-sm italic text-primary">
                    <span className="font-medium not-italic">Hook: </span>{activeChapter.hook}
                  </div>
                )}

                <Textarea
                  value={activeChapter.content || ""}
                  onChange={(e) => handleUpdateChapterContent(activeChapter.id, e.target.value)}
                  rows={20}
                  placeholder="Start writing your chapter or click Generate..."
                  className="font-mono text-sm leading-relaxed"
                />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{activeChapter.word_count || 0} words</span>
                  <span>{(activeChapter.content || "").length} characters</span>
                  <Badge variant="outline" className="text-xs">{activeChapter.status}</Badge>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {chapters.length > 0 ? "Select a chapter to start editing" : "Add a chapter or generate an outline to begin"}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel - Tools */}
          <div className="space-y-4">
            {/* AI Improve */}
            {activeChapter?.content && (
              <div className="glass-card p-4 space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Wand2 className="h-3.5 w-3.5" /> AI Improve
                </h2>
                <Textarea
                  value={improveInstructions}
                  onChange={(e) => setImproveInstructions(e.target.value)}
                  rows={2}
                  placeholder="Optional: specific improvements..."
                  className="text-xs"
                />
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleImproveChapter} disabled={engine.loading}>
                  {engine.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                  Improve Chapter
                </Button>
              </div>
            )}

            {/* Book Details */}
            {currentBook && (
              <div className="glass-card p-4 space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" /> Publishing Info
                </h2>
                {currentBook.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentBook.keywords.slice(0, 8).map((kw: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                )}
                {currentBook.description && (
                  <p className="text-xs text-muted-foreground line-clamp-4">{currentBook.description}</p>
                )}
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={async () => {
                  const summary = chapters.map((c: any) => c.title).join(", ");
                  const result = await engine.publishingPackage(currentBook.title, currentBook.subtitle || "", currentBook.target_audience || "", summary);
                  if (result) {
                    await supabase.from("books").update({
                      description: result.description,
                      keywords: result.keywords,
                      categories: result.categories,
                      author_bio: result.authorBio,
                      cover_direction: result.coverDirection,
                    }).eq("id", currentBookId);
                    queryClient.invalidateQueries({ queryKey: ["books"] });
                  }
                }} disabled={engine.loading}>
                  <Sparkles className="h-3 w-3" /> Generate Publishing Package
                </Button>
              </div>
            )}

            {/* Author Bio */}
            {currentBook?.author_bio && (
              <div className="glass-card p-4 space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-3.5 w-3.5" /> Author Bio
                </h2>
                <p className="text-xs text-muted-foreground">{currentBook.author_bio}</p>
              </div>
            )}

            {/* Stats */}
            <div className="glass-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" /> Statistics
              </h2>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Total words</span><span className="font-medium text-foreground">{totalWords.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Chapters</span><span className="font-medium text-foreground">{chapters.length}</span></div>
                <div className="flex justify-between"><span>Completed</span><span className="font-medium text-foreground">{completedChapters}</span></div>
                <div className="flex justify-between"><span>Est. pages</span><span className="font-medium text-foreground">{Math.ceil(totalWords / 250)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
