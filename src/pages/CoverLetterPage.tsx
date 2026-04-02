import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Sparkles, RefreshCw, Target, Languages, Download, FileText, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useAIAssist } from "@/hooks/useAIAssist";
import { useSaveDocument } from "@/hooks/useDocuments";

export default function CoverLetterPage() {
  const [docId, setDocId] = useState<string | undefined>();
  const [company, setCompany] = useState("Google");
  const [position, setPosition] = useState("Senior Frontend Engineer");
  const [hiringManager, setHiringManager] = useState("Hiring Manager");
  const [body, setBody] = useState("");
  const { assist, loading: aiLoading } = useAIAssist();
  const saveDocument = useSaveDocument();

  const handleGenerate = async () => {
    const result = await assist({
      action: "generate_cover_letter",
      content: { company, position, hiringManager },
    });
    if (result) setBody(result);
  };

  const handleRewriteTone = async () => {
    if (!body) return;
    const result = await assist({
      action: "rewrite_tone",
      content: { text: body },
      tone: "professional",
    });
    if (result) setBody(result);
  };

  const handleSave = () => {
    saveDocument.mutate({
      id: docId,
      title: `Cover Letter — ${company} ${position}`,
      type: "cover_letter",
      content: { company, position, hiringManager, body },
    }, {
      onSuccess: (data) => { if (data?.id) setDocId(data.id); },
    });
  };

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <PageHeader
          title="Cover Letter"
          subtitle="Generate tailored cover letters"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSave} disabled={saveDocument.isPending}>
                {saveDocument.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleGenerate} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Generate
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleRewriteTone} disabled={aiLoading || !body}>
                <RefreshCw className="h-3.5 w-3.5" /> Rewrite Tone
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Match JD</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Languages className="h-3.5 w-3.5" /> Translate</Button>
              <Button size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-semibold">Details</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
                <Input placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
              </div>
              <Input placeholder="Hiring Manager" value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} />
            </div>
            <div className="glass-card p-5 space-y-3">
              <h2 className="text-sm font-semibold">Letter Content</h2>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                className="font-mono text-sm"
                placeholder="Click 'Generate' to create a cover letter, or write your own..."
              />
            </div>
          </div>

          <div className="glass-card sticky top-20 h-fit p-6 lg:p-8">
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Live Preview
            </div>
            <Separator className="mb-5" />
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              <p className="text-sm font-semibold">{company}</p>
              <p className="text-sm">Re: {position}</p>
              <Separator />
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {body || <span className="text-muted-foreground italic">Your cover letter will appear here...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
