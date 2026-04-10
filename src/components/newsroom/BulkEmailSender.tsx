import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload, Send, Users, Mail, Clock, CheckCircle2, AlertCircle,
  FileDown, Trash2, Plus,
} from "lucide-react";
import { toast } from "sonner";

interface Recipient {
  email: string;
  name?: string;
}

interface Campaign {
  name: string;
  subject: string;
  body: string;
  recipients: Recipient[];
  status: "draft" | "sending" | "sent" | "failed";
  sentCount: number;
}

const defaultCampaign: Campaign = {
  name: "",
  subject: "",
  body: "",
  recipients: [],
  status: "draft",
  sentCount: 0,
};

export function BulkEmailSender() {
  const [campaign, setCampaign] = useState<Campaign>(defaultCampaign);
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  const [sending, setSending] = useState(false);

  const addRecipient = () => {
    if (!manualEmail.trim()) return;
    if (campaign.recipients.some((r) => r.email === manualEmail.trim())) {
      toast.error("Duplicate email");
      return;
    }
    setCampaign((c) => ({
      ...c,
      recipients: [...c.recipients, { email: manualEmail.trim(), name: manualName.trim() || undefined }],
    }));
    setManualEmail("");
    setManualName("");
  };

  const removeRecipient = (email: string) => {
    setCampaign((c) => ({ ...c, recipients: c.recipients.filter((r) => r.email !== email) }));
  };

  const handleCsvUpload = () => {
    toast.info("CSV import", { description: "Upload a CSV with columns: email, name" });
  };

  const handleSend = async () => {
    if (!campaign.subject.trim()) {
      toast.error("Please enter a subject line");
      return;
    }
    if (campaign.recipients.length === 0) {
      toast.error("Add at least one recipient");
      return;
    }
    setSending(true);
    setCampaign((c) => ({ ...c, status: "sending" }));

    // Simulate sending
    for (let i = 0; i <= campaign.recipients.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setCampaign((c) => ({ ...c, sentCount: i }));
    }

    setCampaign((c) => ({ ...c, status: "sent" }));
    setSending(false);
    toast.success(`Sent to ${campaign.recipients.length} recipients!`);
  };

  const progress = campaign.recipients.length > 0
    ? Math.round((campaign.sentCount / campaign.recipients.length) * 100)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Left: compose */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={campaign.name}
              onChange={(e) => setCampaign((c) => ({ ...c, name: e.target.value }))}
              placeholder="Campaign name (internal)"
            />
            <Input
              value={campaign.subject}
              onChange={(e) => setCampaign((c) => ({ ...c, subject: e.target.value }))}
              placeholder="Email subject line"
            />
            <Textarea
              value={campaign.body}
              onChange={(e) => setCampaign((c) => ({ ...c, body: e.target.value }))}
              placeholder="Write your email body here… (HTML supported)"
              rows={8}
            />
          </CardContent>
        </Card>

        {/* Recipient list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Recipients
              <Badge variant="secondary" className="ml-auto">{campaign.recipients.length}</Badge>
            </CardTitle>
            <CardDescription>Add recipients manually or import a CSV file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} placeholder="email@example.com" className="flex-1" onKeyDown={(e) => e.key === "Enter" && addRecipient()} />
              <Input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Name (optional)" className="w-36" onKeyDown={(e) => e.key === "Enter" && addRecipient()} />
              <Button size="icon" variant="outline" onClick={addRecipient}><Plus className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCsvUpload}>
              <Upload className="h-3.5 w-3.5" /> Import CSV
            </Button>

            {campaign.recipients.length > 0 && (
              <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border p-2">
                {campaign.recipients.map((r) => (
                  <div key={r.email} className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-secondary">
                    <div>
                      <span className="font-medium">{r.email}</span>
                      {r.name && <span className="ml-2 text-xs text-muted-foreground">({r.name})</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeRecipient(r.email)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: status & send */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Send Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <Mail className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1 text-lg font-bold">{campaign.recipients.length}</p>
                <p className="text-xs text-muted-foreground">Recipients</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                {campaign.status === "sent" ? (
                  <CheckCircle2 className="mx-auto h-5 w-5 text-[hsl(var(--success))]" />
                ) : campaign.status === "sending" ? (
                  <Clock className="mx-auto h-5 w-5 text-[hsl(var(--warning))]" />
                ) : campaign.status === "failed" ? (
                  <AlertCircle className="mx-auto h-5 w-5 text-destructive" />
                ) : (
                  <Send className="mx-auto h-5 w-5 text-muted-foreground" />
                )}
                <p className="mt-1 text-lg font-bold capitalize">{campaign.status}</p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>

            {campaign.status === "sending" && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-xs text-muted-foreground">{campaign.sentCount} / {campaign.recipients.length} sent</p>
              </div>
            )}

            <Button className="w-full gap-2" disabled={sending || campaign.status === "sent"} onClick={handleSend}>
              <Send className="h-4 w-4" /> {campaign.status === "sent" ? "Sent ✓" : sending ? "Sending…" : "Send Now"}
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Scheduling coming soon")}>
              <Clock className="h-4 w-4" /> Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2" onClick={() => toast.success("Report exported")}>
              <FileDown className="h-4 w-4" /> Download Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
