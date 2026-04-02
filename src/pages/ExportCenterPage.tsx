import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

const exports = [
  { id: 1, name: "Software_Engineer_CV.pdf", format: "PDF", date: "Apr 1, 2026", status: "Completed" as const },
  { id: 2, name: "Cover_Letter_Google.docx", format: "DOCX", date: "Mar 30, 2026", status: "Completed" as const },
  { id: 3, name: "Engineering_Book.epub", format: "EPUB", date: "Mar 28, 2026", status: "Processing" as const },
  { id: 4, name: "Resume_Norwegian.pdf", format: "PDF", date: "Mar 25, 2026", status: "Completed" as const },
  { id: 5, name: "PM_CV.docx", format: "DOCX", date: "Mar 20, 2026", status: "Failed" as const },
  { id: 6, name: "Book_Chapter3.pdf", format: "PDF", date: "Mar 18, 2026", status: "Completed" as const },
];

const statusConfig = {
  Completed: { icon: CheckCircle, className: "bg-success/10 text-success" },
  Processing: { icon: Clock, className: "bg-warning/10 text-warning" },
  Failed: { icon: AlertCircle, className: "bg-destructive/10 text-destructive" },
};

export default function ExportCenterPage() {
  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-5xl animate-fade-in">
        <PageHeader title="Export Center" subtitle="Download and manage your exported files" />

        <div className="glass-card divide-y">
          {exports.map((e) => {
            const status = statusConfig[e.status];
            const StatusIcon = status.icon;
            return (
              <div key={e.id} className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.format} • {e.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}>
                    <StatusIcon className="h-3 w-3" /> {e.status}
                  </span>
                  {e.status === "Completed" && (
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  )}
                  {e.status === "Failed" && (
                    <Button variant="ghost" size="sm" className="text-xs">Retry</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
