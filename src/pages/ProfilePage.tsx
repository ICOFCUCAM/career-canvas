import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, User, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: documents } = useDocuments();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lang, setLang] = useState("English");
  const [exportFormat, setExportFormat] = useState("PDF");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      // Load profile
      supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
        if (data) {
          setName(data.full_name || "");
          setLang(data.language_preference || "English");
          setExportFormat(data.export_format_default || "PDF");
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: name,
      language_preference: lang,
      export_format_default: exportFormat,
    }).eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Profile updated successfully." });
    }
    setSaving(false);
  };

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-2xl animate-fade-in">
        <PageHeader title="Profile" subtitle="Manage your account and preferences" />

        <div className="space-y-4">
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
                <Input value={email} disabled className="opacity-60" />
              </div>
            </div>
          </div>

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

          <div className="glass-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Usage Statistics</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{documents?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Exports</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">—</p>
                <p className="text-xs text-muted-foreground">AI Credits</p>
              </div>
            </div>
          </div>

          <Button className="w-full gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Changes
          </Button>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
