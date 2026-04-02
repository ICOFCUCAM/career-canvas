import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, MoreHorizontal, Copy, Trash2, Download, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useDocuments, useDeleteDocument } from "@/hooks/useDocuments";
import type { Database } from "@/integrations/supabase/types";

type DocumentType = Database["public"]["Enums"]["document_type"];

const typeLabels: Record<string, string> = {
  cv: "CV",
  cover_letter: "Cover Letter",
  book: "Book",
  translation: "Translation",
};

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const { data: documents, isLoading } = useDocuments(
    typeFilter !== "All" ? (typeFilter.toLowerCase().replace(" ", "_") as DocumentType) : undefined
  );
  const deleteDocument = useDeleteDocument();

  const filtered = (documents || []).filter(
    (d) => d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-5xl animate-fade-in">
        <PageHeader title="Document Library" subtitle="All your saved documents in one place" />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["All", "CV", "Cover Letter", "Book", "Translation"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card divide-y">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No documents found.</p>
          ) : (
            filtered.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabels[d.type] || d.type} • {new Date(d.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Rename</DropdownMenuItem>
                    <DropdownMenuItem><Copy className="mr-2 h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                    <DropdownMenuItem><Download className="mr-2 h-3.5 w-3.5" /> Export</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteDocument.mutate(d.id)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
