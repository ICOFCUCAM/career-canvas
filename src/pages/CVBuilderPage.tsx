import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, Sparkles, Target, Download, Plus, Trash2, FileText } from "lucide-react";
import { useState } from "react";

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export default function CVBuilderPage() {
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
          subtitle="Build your professional resume"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5"><Save className="h-3.5 w-3.5" /> Save</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Improve with AI</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><Target className="h-3.5 w-3.5" /> Match JD</Button>
              <Button size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export PDF</Button>
            </div>
          }
        />

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
          <div className="glass-card sticky top-20 h-fit p-6 lg:p-8">
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Live Preview
            </div>
            <Separator className="mb-5" />
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-sm text-primary font-medium">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{email} • {phone}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Summary</h3>
                <p className="text-sm">{summary}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                    <span key={s} className="rounded-md bg-surface-active px-2 py-0.5 text-xs font-medium text-primary">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Experience</h3>
                {experiences.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-semibold">{exp.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">{exp.period}</p>
                    </div>
                    <p className="text-xs text-primary">{exp.company}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{exp.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Education</h3>
                <p className="text-sm">{education}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Certifications</h3>
                <p className="text-sm">{certifications}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Languages</h3>
                <p className="text-sm">{languages}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
