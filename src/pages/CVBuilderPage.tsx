import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Sparkles, Target, Download, Plus, Trash2, FileText, Loader2, Layout } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAIAssist } from "@/hooks/useAIAssist";
import { useSaveDocument } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
import { templateDefinitions, getTemplateById } from "@/data/templateDefinitions";
import { templateImageMap } from "@/data/templateImages";
import CVPreview from "@/components/cv/CVPreview";

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

// Only CV-applicable categories
const cvTemplates = templateDefinitions.filter(t =>
  ["Modern CV", "Academic", "Corporate", "Creative", "Minimal"].includes(t.category)
);

export default function CVBuilderPage() {
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get("template");

  const [docId, setDocId] = useState<string | undefined>();
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateParam || "modern-professional");
  const [name, setName] = useState("John Doe");
  const [title, setTitle] = useState("Senior Software Engineer");
  const [email, setEmail] = useState("john@example.com");
  const [phone, setPhone] = useState("+1 555 123 4567");
  const [summary, setSummary] = useState("Experienced software engineer with 8+ years building scalable web applications.");
  const [skills, setSkills] = useState("React, TypeScript, Node.js, Python, AWS, Docker");
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    { id: "1", title: "Senior Engineer", company: "TechCorp", period: "2022 — Present", description: "Led frontend architecture for a SaaS platform serving 50k users." },
    { id: "2", title: "Software Engineer", company: "StartupXYZ", period: "2019 — 2022", description: "Built core product features and reduced page load by 40%." },
  ]);
  const [education, setEducation] = useState("B.Sc. Computer Science — MIT, 2019");
  const [certifications, setCertifications] = useState("AWS Solutions Architect, Google Cloud Professional");
  const [languages, setLanguages] = useState("English (Native), Norwegian (B2), Spanish (A2)");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const { assist, loading: aiLoading } = useAIAssist();
  const saveDocument = useSaveDocument();
  const { toast } = useToast();

  useEffect(() => {
    if (templateParam) setSelectedTemplateId(templateParam);
  }, [templateParam]);

  const selectedTemplate = getTemplateById(selectedTemplateId) || templateDefinitions[0];

  const getCVContent = () => ({
    name, title, email, phone, summary, skills, experiences, education, certifications, languages, templateId: selectedTemplateId,
  });

  const handleSave = () => {
    saveDocument.mutate({
      id: docId,
      title: `${name} — ${title}`,
      type: "cv",
      content: getCVContent(),
    }, {
      onSuccess: (data) => {
        if (data?.id) setDocId(data.id);
      },
    });
  };

  const handleImproveWithAI = async () => {
    const result = await assist({
      action: "improve_cv",
      content: getCVContent(),
    });
    if (result) {
      try {
        const improved = JSON.parse(result);
        if (improved.summary) setSummary(improved.summary);
        if (improved.skills) setSkills(improved.skills);
        toast({ title: "AI Improved", description: "Your CV has been enhanced." });
      } catch {
        setSummary(result);
        toast({ title: "AI Improved", description: "Summary has been enhanced." });
      }
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, { id: Date.now().toString(), title: "", company: "", period: "", description: "" }]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <PageHeader
          title="CV Builder"
          subtitle={`Template: ${selectedTemplate.name}`}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowTemplatePicker(!showTemplatePicker)}>
                <Layout className="h-3.5 w-3.5" /> {showTemplatePicker ? "Hide Templates" : "Change Template"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSave} disabled={saveDocument.isPending}>
                {saveDocument.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleImproveWithAI} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Improve with AI
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Match JD</Button>
              <Button size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export PDF</Button>
            </div>
          }
        />

        {/* Template Picker */}
        {showTemplatePicker && (
          <div className="mb-6 glass-card p-4">
            <h3 className="text-sm font-semibold mb-3">Select a Template</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {cvTemplates.map((t) => {
                const img = templateImageMap[t.imageKey];
                const isActive = t.id === selectedTemplateId;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTemplateId(t.id); setShowTemplatePicker(false); }}
                    className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                      isActive ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/40"
                    }`}
                  >
                    {img ? (
                      <img src={img} alt={t.name} className="h-24 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-24 w-full bg-secondary flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                      <p className="text-[9px] text-white font-medium leading-tight truncate">{t.name}</p>
                    </div>
                    {isActive && (
                      <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[8px] text-primary-foreground">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-semibold">Personal Information</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="glass-card p-5 space-y-3">
              <h2 className="text-sm font-semibold">Professional Summary</h2>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
            </div>

            <div className="glass-card p-5 space-y-3">
              <h2 className="text-sm font-semibold">Skills</h2>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Comma-separated skills" />
            </div>

            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Experience</h2>
                <Button variant="ghost" size="sm" onClick={addExperience} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
              </div>
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <Input className="max-w-[200px]" placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(exp.id, "title", e.target.value)} />
                    <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                    <Input placeholder="Period" value={exp.period} onChange={(e) => updateExperience(exp.id, "period", e.target.value)} />
                  </div>
                  <Textarea placeholder="Description" value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} rows={2} />
                </div>
              ))}
            </div>

            <div className="glass-card p-5 space-y-3">
              <h2 className="text-sm font-semibold">Education</h2>
              <Input value={education} onChange={(e) => setEducation(e.target.value)} />
            </div>

            <div className="glass-card p-5 space-y-3">
              <h2 className="text-sm font-semibold">Certifications</h2>
              <Input value={certifications} onChange={(e) => setCertifications(e.target.value)} />
            </div>

            <div className="glass-card p-5 space-y-3">
              <h2 className="text-sm font-semibold">Languages</h2>
              <Input value={languages} onChange={(e) => setLanguages(e.target.value)} />
            </div>
          </div>

          {/* Live Preview */}
          <div className="sticky top-20 h-fit">
            <div className="glass-card p-4 mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> Live Preview — <span className="font-medium text-foreground">{selectedTemplate.name}</span>
              </div>
            </div>
            <CVPreview
              data={{ name, title, email, phone, summary, skills, experiences, education, certifications, languages }}
              style={selectedTemplate.style}
              templateName={selectedTemplate.name}
            />
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
