import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Sparkles, Download, BookOpen, Tag, User, FileText, GripVertical } from "lucide-react";
import { useState } from "react";
import bookCreatorImg from "@/assets/book-creator-illustration.jpg";

interface Chapter {
  id: string;
  title: string;
  content: string;
}

export default function BookCreatorPage() {
  const [bookTitle, setBookTitle] = useState("The Art of Modern Engineering");
  const [subtitle, setSubtitle] = useState("A Practical Guide to Building Scalable Systems");
  const [activeChapter, setActiveChapter] = useState("1");
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: "1", title: "Introduction", content: "Welcome to the definitive guide on modern engineering practices..." },
    { id: "2", title: "Fundamentals", content: "Before diving into advanced topics, let's establish the core principles..." },
    { id: "3", title: "Architecture Patterns", content: "" },
  ]);

  const addChapter = () => {
    const id = Date.now().toString();
    setChapters([...chapters, { id, title: `Chapter ${chapters.length + 1}`, content: "" }]);
    setActiveChapter(id);
  };

  const removeChapter = (id: string) => {
    const filtered = chapters.filter((c) => c.id !== id);
    setChapters(filtered);
    if (activeChapter === id && filtered.length) setActiveChapter(filtered[0].id);
  };

  const updateChapter = (id: string, field: keyof Chapter, value: string) => {
    setChapters(chapters.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const active = chapters.find((c) => c.id === activeChapter);

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <PageHeader
          title="Book Creator"
          subtitle="Write, structure, and publish your book"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI Assist</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> EPUB</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> PDF</Button>
              <Button size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> DOCX</Button>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[240px_1fr_240px]">
          {/* Chapter List */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Chapters</h2>
              <Button variant="ghost" size="sm" onClick={addChapter}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(ch.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeChapter === ch.id ? "bg-surface-active text-primary font-medium" : "text-muted-foreground hover:bg-surface-hover"
                }`}
              >
                <GripVertical className="h-3 w-3 shrink-0 opacity-40" />
                <span className="truncate">{i + 1}. {ch.title}</span>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-3">
              <h2 className="text-sm font-semibold">Book Details</h2>
              <Input placeholder="Book Title" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} className="text-lg font-semibold" />
              <Input placeholder="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>

            {active && (
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={active.title}
                    onChange={(e) => updateChapter(active.id, "title", e.target.value)}
                    className="max-w-xs font-semibold"
                    placeholder="Chapter Title"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeChapter(active.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <Textarea
                  value={active.content}
                  onChange={(e) => updateChapter(active.id, "content", e.target.value)}
                  rows={16}
                  placeholder="Start writing your chapter..."
                  className="font-mono text-sm leading-relaxed"
                />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{active.content.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{active.content.length} characters</span>
                </div>
              </div>
            )}
          </div>

          {/* Publishing Toolkit */}
          <div className="space-y-4">
            <div className="glass-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" /> Keywords
              </h2>
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Sparkles className="h-3 w-3" /> Generate Keywords
              </Button>
            </div>
            <div className="glass-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" /> Description
              </h2>
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Sparkles className="h-3 w-3" /> Generate Description
              </Button>
            </div>
            <div className="glass-card p-4 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Author Bio
              </h2>
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Sparkles className="h-3 w-3" /> Generate Bio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
