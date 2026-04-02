import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Download, FileText, ArrowRightLeft } from "lucide-react";
import { useState } from "react";

const languages = ["English", "Norwegian", "Spanish", "French", "German", "Arabic", "Chinese", "Japanese"];
const tones = ["Professional", "Formal", "Academic", "Norwegian workplace style"];

export default function TranslationPage() {
  const [sourceLang, setSourceLang] = useState("English");
  const [targetLang, setTargetLang] = useState("Norwegian");
  const [tone, setTone] = useState("Professional");
  const [source, setSource] = useState("We are pleased to inform you that your application has been reviewed and we would like to invite you for an interview at our earliest convenience.");
  const [result] = useState("Vi har gleden av å informere deg om at søknaden din er gjennomgått, og vi ønsker å invitere deg til intervju ved første anledning.");

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <PageHeader
          title="Translation"
          subtitle="Translate documents with professional tone control"
          actions={
            <div className="flex gap-2">
              <Button size="sm" className="gap-1.5"><Languages className="h-3.5 w-3.5" /> Translate</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          }
        />

        <div className="glass-card mb-4 flex flex-wrap items-center gap-3 p-4">
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-6" />
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Tone" /></SelectTrigger>
            <SelectContent>{tones.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Source — {sourceLang}
            </div>
            <Textarea value={source} onChange={(e) => setSource(e.target.value)} rows={10} />
          </div>
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Result — {targetLang} ({tone})
            </div>
            <div className="min-h-[200px] rounded-md border bg-surface-hover p-3 text-sm leading-relaxed">
              {result}
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
