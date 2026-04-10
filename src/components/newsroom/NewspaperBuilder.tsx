import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, GripVertical, Image, Type, Columns2, Columns3,
  FileDown, Eye, LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";

interface ArticleBlock {
  id: string;
  type: "headline" | "article" | "image" | "divider";
  headline?: string;
  body?: string;
  imageUrl?: string;
  caption?: string;
  column?: number;
}

interface NewspaperConfig {
  title: string;
  subtitle: string;
  date: string;
  edition: string;
  layout: "single" | "two-col" | "three-col";
  blocks: ArticleBlock[];
}

const defaultConfig: NewspaperConfig = {
  title: "The Daily Chronicle",
  subtitle: "Your trusted source for news & stories",
  date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  edition: "Vol. 1 — Issue 1",
  layout: "two-col",
  blocks: [
    { id: "1", type: "headline", headline: "Breaking: Major Development Announced" },
    { id: "2", type: "article", headline: "Lead Story", body: "Write your lead article content here. This will appear prominently at the top of your newspaper layout." },
    { id: "3", type: "divider" },
    { id: "4", type: "article", headline: "Feature Article", body: "Write your feature article here. Add depth and context to your reporting with detailed analysis." },
  ],
};

export function NewspaperBuilder() {
  const [config, setConfig] = useState<NewspaperConfig>(defaultConfig);
  const [previewMode, setPreviewMode] = useState(false);

  const addBlock = (type: ArticleBlock["type"]) => {
    const newBlock: ArticleBlock = {
      id: crypto.randomUUID(),
      type,
      headline: type === "headline" || type === "article" ? "" : undefined,
      body: type === "article" ? "" : undefined,
    };
    setConfig((c) => ({ ...c, blocks: [...c.blocks, newBlock] }));
  };

  const updateBlock = (id: string, updates: Partial<ArticleBlock>) => {
    setConfig((c) => ({
      ...c,
      blocks: c.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const removeBlock = (id: string) => {
    setConfig((c) => ({ ...c, blocks: c.blocks.filter((b) => b.id !== id) }));
  };

  const handleExportPdf = () => {
    toast.success("Newspaper exported as PDF", { description: "Your newspaper is ready to download." });
  };

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Preview</h2>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>Back to Editor</Button>
        </div>
        <div className="rounded-xl border bg-white p-8 text-black shadow-lg">
          {/* Masthead */}
          <div className="mb-6 border-b-4 border-double border-black pb-4 text-center">
            <p className="text-xs tracking-widest uppercase text-gray-500">{config.edition}</p>
            <h1 className="font-serif text-4xl font-black tracking-tight lg:text-5xl">{config.title}</h1>
            <p className="mt-1 text-sm italic text-gray-600">{config.subtitle}</p>
            <p className="mt-1 text-xs text-gray-400">{config.date}</p>
          </div>
          {/* Articles */}
          <div
            className={`gap-6 ${
              config.layout === "three-col"
                ? "columns-1 sm:columns-2 lg:columns-3"
                : config.layout === "two-col"
                ? "columns-1 sm:columns-2"
                : ""
            }`}
          >
            {config.blocks.map((block) => {
              if (block.type === "headline") {
                return (
                  <h2 key={block.id} className="mb-3 break-inside-avoid font-serif text-2xl font-bold leading-tight">
                    {block.headline || "Untitled Headline"}
                  </h2>
                );
              }
              if (block.type === "divider") {
                return <hr key={block.id} className="my-4 border-t border-gray-300" />;
              }
              if (block.type === "image") {
                return (
                  <figure key={block.id} className="mb-4 break-inside-avoid">
                    <div className="flex h-40 items-center justify-center rounded bg-gray-100 text-gray-400">
                      <Image className="h-8 w-8" />
                    </div>
                    {block.caption && <figcaption className="mt-1 text-center text-xs italic text-gray-500">{block.caption}</figcaption>}
                  </figure>
                );
              }
              return (
                <article key={block.id} className="mb-5 break-inside-avoid">
                  {block.headline && <h3 className="mb-1 font-serif text-lg font-semibold">{block.headline}</h3>}
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{block.body || "..."}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Editor */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Masthead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={config.title} onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))} placeholder="Newspaper title" />
            <Input value={config.subtitle} onChange={(e) => setConfig((c) => ({ ...c, subtitle: e.target.value }))} placeholder="Subtitle / tagline" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={config.edition} onChange={(e) => setConfig((c) => ({ ...c, edition: e.target.value }))} placeholder="Edition" />
              <Input value={config.date} onChange={(e) => setConfig((c) => ({ ...c, date: e.target.value }))} placeholder="Date" />
            </div>
          </CardContent>
        </Card>

        {/* Blocks */}
        {config.blocks.map((block, idx) => (
          <Card key={block.id} className="group relative">
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <GripVertical className="h-3.5 w-3.5 cursor-grab" />
                  <span className="uppercase tracking-wide">
                    {block.type === "headline" ? "Headline" : block.type === "article" ? "Article" : block.type === "image" ? "Image" : "Divider"}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeBlock(block.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {block.type === "headline" && (
                <Input value={block.headline || ""} onChange={(e) => updateBlock(block.id, { headline: e.target.value })} placeholder="Enter headline…" className="font-semibold" />
              )}
              {block.type === "article" && (
                <div className="space-y-2">
                  <Input value={block.headline || ""} onChange={(e) => updateBlock(block.id, { headline: e.target.value })} placeholder="Article title" />
                  <Textarea value={block.body || ""} onChange={(e) => updateBlock(block.id, { body: e.target.value })} placeholder="Write article body…" rows={5} />
                </div>
              )}
              {block.type === "image" && (
                <div className="space-y-2">
                  <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
                    <span className="text-sm">Click to upload image</span>
                  </div>
                  <Input value={block.caption || ""} onChange={(e) => updateBlock(block.id, { caption: e.target.value })} placeholder="Image caption" />
                </div>
              )}
              {block.type === "divider" && <hr className="border-t border-border" />}
            </CardContent>
          </Card>
        ))}

        {/* Add block bar */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("headline")}>
            <Type className="h-3.5 w-3.5" /> Headline
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("article")}>
            <Plus className="h-3.5 w-3.5" /> Article
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("image")}>
            <Image className="h-3.5 w-3.5" /> Image
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("divider")}>
            — Divider
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={config.layout} onValueChange={(v) => setConfig((c) => ({ ...c, layout: v as NewspaperConfig["layout"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single"><span className="flex items-center gap-2"><LayoutTemplate className="h-3.5 w-3.5" /> Single Column</span></SelectItem>
                <SelectItem value="two-col"><span className="flex items-center gap-2"><Columns2 className="h-3.5 w-3.5" /> Two Columns</span></SelectItem>
                <SelectItem value="three-col"><span className="flex items-center gap-2"><Columns3 className="h-3.5 w-3.5" /> Three Columns</span></SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full gap-2" onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleExportPdf}>
              <FileDown className="h-4 w-4" /> Export PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
