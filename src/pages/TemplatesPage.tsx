import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Heart, Search } from "lucide-react";
import { useState } from "react";
import templateCv from "@/assets/template-cv.jpg";
import templateCoverLetter from "@/assets/template-cover-letter.jpg";
import templateCreative from "@/assets/template-creative.jpg";
import templateAcademic from "@/assets/template-academic.jpg";

const categories = ["All", "Modern CV", "Academic", "Corporate", "Creative", "Minimal"];

const templateImages: Record<string, string> = {
  "Modern CV": templateCv,
  "Academic": templateAcademic,
  "Creative": templateCreative,
  "Corporate": templateCoverLetter,
  "Minimal": templateCv,
};

const templates = [
  { id: 1, name: "Modern Professional", category: "Modern CV", desc: "Clean layout with sidebar" },
  { id: 2, name: "Executive Resume", category: "Modern CV", desc: "Senior-level format" },
  { id: 3, name: "Academic CV", category: "Academic", desc: "Research & publications focus" },
  { id: 4, name: "PhD Application", category: "Academic", desc: "For academic positions" },
  { id: 5, name: "Corporate Standard", category: "Corporate", desc: "Traditional business format" },
  { id: 6, name: "Enterprise Leader", category: "Corporate", desc: "C-suite presentation" },
  { id: 7, name: "Creative Portfolio", category: "Creative", desc: "Visual-first design" },
  { id: 8, name: "Designer CV", category: "Creative", desc: "Bold typography layout" },
  { id: 9, name: "Clean Minimal", category: "Minimal", desc: "Simple, elegant spacing" },
  { id: 10, name: "Swiss Style", category: "Minimal", desc: "Grid-based minimalism" },
  { id: 11, name: "Tech Resume", category: "Modern CV", desc: "Developer-focused layout" },
  { id: 12, name: "Marketing Pro", category: "Corporate", desc: "Results-driven format" },
];

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

  const filtered = templates.filter((t) =>
    (active === "All" || t.category === active) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFav = (id: number) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <PageHeader title="Template Gallery" subtitle="Browse and select professional templates" />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <Button
                key={c}
                variant={active === c ? "default" : "outline"}
                size="sm"
                onClick={() => setActive(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <div key={t.id} className="glass-card-hover group overflow-hidden">
              <div className="relative flex h-44 items-center justify-center bg-secondary">
                <FileText className="h-12 w-12 text-muted-foreground/30" />
                <button
                  onClick={() => toggleFav(t.id)}
                  className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Heart className={`h-3.5 w-3.5 ${favorites.includes(t.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium">{t.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
