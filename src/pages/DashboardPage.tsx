import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText, Mail, Briefcase, BookOpen, Languages,
  Plus, Clock, TrendingUp, Download,
} from "lucide-react";

const quickActions = [
  { icon: FileText, label: "New CV", path: "/cv", color: "text-primary" },
  { icon: Mail, label: "Cover Letter", path: "/cover-letter", color: "text-primary" },
  { icon: Briefcase, label: "Match Job", path: "/jobs", color: "text-primary" },
  { icon: BookOpen, label: "New Book", path: "/books", color: "text-primary" },
  { icon: Languages, label: "Translate", path: "/translate", color: "text-primary" },
];

const recentDocs = [
  { title: "Software Engineer CV", type: "CV", updated: "2 hours ago" },
  { title: "Google Cover Letter", type: "Cover Letter", updated: "5 hours ago" },
  { title: "Portfolio Book Ch.3", type: "Book", updated: "1 day ago" },
  { title: "Resume — Norwegian", type: "Translation", updated: "2 days ago" },
];

const suggestions = [
  { text: "Add a professional summary to your latest CV", priority: "High" },
  { text: "Your cover letter could use stronger action verbs", priority: "Medium" },
  { text: "Consider adding certifications section", priority: "Low" },
];

export default function DashboardPage() {
  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-5xl animate-fade-in">
        <PageHeader title="Dashboard" subtitle="Welcome back. Pick up where you left off." />

        {/* Quick Actions */}
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
          {/* Recent Documents */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Recent Documents
              </h2>
              <Link to="/library" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {recentDocs.map((d) => (
                <div key={d.title} className="flex items-center justify-between rounded-lg p-3 hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{d.updated}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Suggestions */}
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

            {/* Export Status */}
            <div className="glass-card p-5">
              <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" /> Recent Exports
              </h2>
              <div className="space-y-2">
                {[
                  { name: "CV_2026.pdf", status: "Completed" },
                  { name: "CoverLetter.docx", status: "Completed" },
                ].map((e) => (
                  <div key={e.name} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{e.name}</span>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
