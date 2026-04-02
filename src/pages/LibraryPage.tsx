import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, MoreHorizontal, Copy, Trash2, Download, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";

const documents = [
  { id: 1, title: "Software Engineer CV", type: "CV", updated: "Apr 1, 2026", size: "24 KB" },
  { id: 2, title: "Google Cover Letter", type: "Cover Letter", updated: "Mar 30, 2026", size: "12 KB" },
  { id: 3, title: "The Art of Engineering", type: "Book", updated: "Mar 28, 2026", size: "1.2 MB" },
  { id: 4, title: "Resume — Norwegian", type: "Translation", updated: "Mar 25, 2026", size: "18 KB" },
  { id: 5, title: "Product Manager CV", type: "CV", updated: "Mar 20, 2026", size: "22 KB" },
  { id: 6, title: "Startup Cover Letter", type: "Cover Letter", updated: "Mar 18, 2026", size: "10 KB" },
];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = documents.filter(
    (d) =>
      (typeFilter === "All" || d.type === typeFilter) &&
      d.title.toLowerCase().includes(search.toLowerCase())
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
          {filtered.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.type} • {d.size} • {d.updated}</p>
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
                  <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
