import { useState } from "react";
import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewspaperBuilder } from "@/components/newsroom/NewspaperBuilder";
import { NewsletterEditor } from "@/components/newsroom/NewsletterEditor";
import { BulkEmailSender } from "@/components/newsroom/BulkEmailSender";
import { Newspaper, PenLine, Send } from "lucide-react";

export default function NewsroomPage() {
  const [activeTab, setActiveTab] = useState("newspaper");

  return (
    <WorkspaceLayout>
      <PageHeader
        title="Newsroom"
        subtitle="Create newspapers, write newsletters, and send bulk emails."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="newspaper" className="gap-2">
            <Newspaper className="h-4 w-4" /> Newspaper
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="gap-2">
            <PenLine className="h-4 w-4" /> Newsletter
          </TabsTrigger>
          <TabsTrigger value="bulk-email" className="gap-2">
            <Send className="h-4 w-4" /> Bulk Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="newspaper">
          <NewspaperBuilder />
        </TabsContent>
        <TabsContent value="newsletter">
          <NewsletterEditor />
        </TabsContent>
        <TabsContent value="bulk-email">
          <BulkEmailSender />
        </TabsContent>
      </Tabs>
    </WorkspaceLayout>
  );
}
