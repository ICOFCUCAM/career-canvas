import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import jobMatchingImg from "@/assets/job-matching-illustration.jpg";

const mockKeywords = ["React", "TypeScript", "Node.js", "CI/CD", "Agile", "REST API", "GraphQL", "AWS", "Docker"];
const mockMissing = ["GraphQL", "Docker"];
const mockSuggestions = [
  "Add GraphQL experience to your skills section",
  "Mention containerization or Docker in your experience",
  "Include specific metrics for CI/CD improvements",
  "Add a project demonstrating REST API design",
];

export default function JobMatchingPage() {
  const [jd, setJd] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-5xl animate-fade-in">
        <PageHeader title="Job Matching" subtitle="Analyze job descriptions and optimize your CV" />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" /> Job Description
              </h2>
              <Textarea
                placeholder="Paste the job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={12}
              />
              <Button className="w-full gap-1.5" onClick={() => setAnalyzed(true)}>
                <Target className="h-3.5 w-3.5" /> Analyze Match
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {analyzed ? (
              <>
                {/* Score */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold mb-3">Match Score</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
                      <span className="text-2xl font-bold text-primary">78%</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Good Match</p>
                      <p className="text-xs text-muted-foreground">Your CV matches most requirements</p>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold mb-3">Extracted Keywords</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {mockKeywords.map((k) => (
                      <span
                        key={k}
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          mockMissing.includes(k)
                            ? "bg-destructive/10 text-destructive"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {mockMissing.includes(k) ? <AlertCircle className="mr-1 inline h-3 w-3" /> : <CheckCircle className="mr-1 inline h-3 w-3" />}
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" /> Improvement Suggestions
                  </h2>
                  <ul className="space-y-2">
                    {mockSuggestions.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center gap-4 p-5">
                <img src={jobMatchingImg} alt="Job matching analysis" loading="lazy" width={800} height={512} className="rounded-lg" />
                <p className="text-sm text-muted-foreground">Paste a job description and click Analyze to see results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
