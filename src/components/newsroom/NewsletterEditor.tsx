import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Eye, Sparkles, Type, Image, Link as LinkIcon,
  Quote, List, Send,
} from "lucide-react";
import { toast } from "sonner";

interface ContentBlock {
  id: string;
  type: "text" | "heading" | "image" | "cta" | "quote" | "list";
  content: string;
  url?: string;
  items?: string[];
}

interface NewsletterData {
  subject: string;
  preheader: string;
  headerImage: string;
  brandColor: string;
  blocks: ContentBlock[];
}

const defaultNewsletter: NewsletterData = {
  subject: "",
  preheader: "",
  headerImage: "",
  brandColor: "#4f46e5",
  blocks: [
    { id: "1", type: "heading", content: "Welcome to this week's edition" },
    { id: "2", type: "text", content: "Write your introduction here. Share updates, insights, or stories with your audience." },
    { id: "3", type: "cta", content: "Read More", url: "https://example.com" },
  ],
};

const templates = [
  { id: "weekly-digest", label: "Weekly Digest" },
  { id: "product-update", label: "Product Update" },
  { id: "event-invite", label: "Event Invitation" },
  { id: "curated-links", label: "Curated Links" },
  { id: "storytelling", label: "Storytelling" },
];

export function NewsletterEditor() {
  const [data, setData] = useState<NewsletterData>(defaultNewsletter);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const addBlock = (type: ContentBlock["type"]) => {
    const block: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: "",
      items: type === "list" ? ["Item 1", "Item 2"] : undefined,
    };
    setData((d) => ({ ...d, blocks: [...d.blocks, block] }));
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setData((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const removeBlock = (id: string) => {
    setData((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
  };

  const handleAIGenerate = () => {
    toast.success("AI content generated", { description: "Newsletter body has been drafted by AI." });
  };

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Newsletter Preview</h2>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>Back to Editor</Button>
        </div>
        <div className="mx-auto max-w-xl rounded-xl border bg-white p-0 text-black shadow-lg overflow-hidden">
          {/* Header band */}
          <div className="px-8 py-6" style={{ backgroundColor: data.brandColor }}>
            <h1 className="text-xl font-bold text-white">{data.subject || "Newsletter Subject"}</h1>
            {data.preheader && <p className="mt-1 text-sm text-white/80">{data.preheader}</p>}
          </div>
          <div className="space-y-4 p-8">
            {data.blocks.map((block) => {
              if (block.type === "heading") return <h2 key={block.id} className="text-xl font-bold">{block.content || "Heading"}</h2>;
              if (block.type === "text") return <p key={block.id} className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{block.content || "…"}</p>;
              if (block.type === "image") return (
                <div key={block.id} className="flex h-40 items-center justify-center rounded-lg bg-gray-100 text-gray-400"><Image className="h-8 w-8" /></div>
              );
              if (block.type === "cta") return (
                <div key={block.id} className="text-center">
                  <a href={block.url || "#"} className="inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white" style={{ backgroundColor: data.brandColor }}>
                    {block.content || "Click Here"}
                  </a>
                </div>
              );
              if (block.type === "quote") return (
                <blockquote key={block.id} className="border-l-4 pl-4 italic text-gray-600" style={{ borderColor: data.brandColor }}>
                  {block.content || "Quote"}
                </blockquote>
              );
              if (block.type === "list") return (
                <ul key={block.id} className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {(block.items || []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              );
              return null;
            })}
          </div>
          <div className="border-t px-8 py-4 text-center text-xs text-gray-400">
            You received this email because you subscribed. <a href="#" className="underline">Unsubscribe</a>
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
            <CardTitle className="text-base">Email Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={data.subject} onChange={(e) => setData((d) => ({ ...d, subject: e.target.value }))} placeholder="Subject line" />
            <Input value={data.preheader} onChange={(e) => setData((d) => ({ ...d, preheader: e.target.value }))} placeholder="Preheader text (shows in inbox preview)" />
          </CardContent>
        </Card>

        {/* Content Blocks */}
        {data.blocks.map((block) => (
          <Card key={block.id} className="group relative">
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="secondary" className="text-xs uppercase">{block.type}</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeBlock(block.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {(block.type === "heading" || block.type === "quote") && (
                <Input value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })} placeholder={block.type === "heading" ? "Heading text" : "Quote text"} />
              )}
              {block.type === "text" && (
                <Textarea value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })} placeholder="Paragraph text…" rows={4} />
              )}
              {block.type === "cta" && (
                <div className="space-y-2">
                  <Input value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value })} placeholder="Button label" />
                  <Input value={block.url || ""} onChange={(e) => updateBlock(block.id, { url: e.target.value })} placeholder="https://…" />
                </div>
              )}
              {block.type === "image" && (
                <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
                  <span className="text-sm">Click to upload image</span>
                </div>
              )}
              {block.type === "list" && (
                <div className="space-y-2">
                  {(block.items || []).map((item, i) => (
                    <Input
                      key={i}
                      value={item}
                      onChange={(e) => {
                        const items = [...(block.items || [])];
                        items[i] = e.target.value;
                        updateBlock(block.id, { items });
                      }}
                      placeholder={`Item ${i + 1}`}
                    />
                  ))}
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => updateBlock(block.id, { items: [...(block.items || []), ""] })}>
                    <Plus className="h-3 w-3" /> Add item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add block toolbar */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("heading")}><Type className="h-3.5 w-3.5" /> Heading</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("text")}><Plus className="h-3.5 w-3.5" /> Text</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("image")}><Image className="h-3.5 w-3.5" /> Image</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("cta")}><LinkIcon className="h-3.5 w-3.5" /> CTA Button</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("quote")}><Quote className="h-3.5 w-3.5" /> Quote</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addBlock("list")}><List className="h-3.5 w-3.5" /> List</Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Template</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger><SelectValue placeholder="Choose a starter…" /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Brand</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Color</label>
              <input type="color" value={data.brandColor} onChange={(e) => setData((d) => ({ ...d, brandColor: e.target.value }))} className="h-8 w-12 cursor-pointer rounded border" />
              <span className="text-xs text-muted-foreground">{data.brandColor}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full gap-2" onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleAIGenerate}>
              <Sparkles className="h-4 w-4" /> AI Draft
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Ready to send", { description: "Switch to Bulk Email tab to send." })}>
              <Send className="h-4 w-4" /> Send
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
