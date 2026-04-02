import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "react-router-dom";
import {
  FileText, Mail, Briefcase, BookOpen, Languages,
  Clock, TrendingUp, Download,
} from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";

const quickActions = [
  { icon: FileText, label: "New CV", path: "/cv", color: "text-primary" },
  { icon: Mail, label: "Cover Letter", path: "/cover-letter", color: "text-primary" },
  { icon: Briefcase, label: "Match Job", path: "/jobs", color: "text-primary" },
  { icon: BookOpen, label: "New Book", path: "/books", color: "text-primary" },
  { icon: Languages, label: "Translate", path: "/translate", color: "text-primary" },
];

const suggestions = [
  { text: "Add a professional summary to your latest CV", priority: "High" },
  { text: "Your cover letter could use stronger action verbs", priority: "Medium" },
  { text: "Consider adding certifications section", priority: "Low" },
];

const typeLabels: Record<string, string> = {
  cv: "CV",
  cover_letter: "Cover Letter",
  book: "Book",
  translation: "Translation",
};

export default function DashboardPage() {
  const { data: documents } = useDocuments();
  const recentDocs = (documents || []).slice(0, 5);

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-5xl animate-fade-in">
        <PageHeader title="Dashboard" subtitle="Welcome back. Pick up where you left off." />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((a) => (
            <Link key={a.path} to={a.path} className="glass-card-hover flex flex-col items-center gap-2 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-active">
                <a.icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <span className="text-xs font-medium">{a.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="glass-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Recent Documents
              </h2>
              <Link to="/library" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {recentDocs.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No documents yet. Create your first CV or cover letter!</p>
              ) : (
                recentDocs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{typeLabels[d.type] || d.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(d.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass-card p-5">
              <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" /> Suggestions
              </h2>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <div key={s.text} className="rounded-lg bg-surface-hover p-3">
                    <p className="text-xs">{s.text}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      s.priority === "High" ? "bg-destructive/10 text-destructive"
                      : s.priority === "Medium" ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                    }`}>
                      {s.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" /> Stats
              </h2>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{documents?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Documents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">Exports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
