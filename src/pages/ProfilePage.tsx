import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, User } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [lang, setLang] = useState("English");
  const [exportFormat, setExportFormat] = useState("PDF");

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-2xl animate-fade-in">
        <PageHeader title="Profile" subtitle="Manage your account and preferences" />

        <div className="space-y-4">
          {/* Personal Info */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> Personal Information
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-semibold">Preferences</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Language</label>
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["English", "Norwegian", "Spanish", "French", "German"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Default Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["PDF", "DOCX", "EPUB"].map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="glass-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pro Plan</p>
                <p className="text-xs text-muted-foreground">$12/month • Renews Apr 15, 2026</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>

          {/* Usage */}
          <div className="glass-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Usage Statistics</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Documents", value: "24" },
                { label: "Exports", value: "18" },
                { label: "AI Credits", value: "156" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full gap-1.5"><Save className="h-3.5 w-3.5" /> Save Changes</Button>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
