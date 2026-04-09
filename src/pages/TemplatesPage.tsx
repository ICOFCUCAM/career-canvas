import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Heart, Search, Upload, Loader2, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { templateDefinitions } from "@/data/templateDefinitions";
import { templateImageMap } from "@/data/templateImages";

const categories = ["All", "Modern CV", "Academic", "Corporate", "Creative", "Minimal", "Cover Letter", "Book", "Custom"];

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Custom");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadThumbnail, setUploadThumbnail] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: customTemplates = [] } = useQuery({
    queryKey: ["custom-templates"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-templates"] });
      toast({ title: "Template deleted" });
    },
  });

  const handleUpload = async () => {
    if (!user || !uploadFile || !uploadName.trim()) return;
    setUploading(true);
    try {
      const ts = Date.now();
      const filePath = `${user.id}/${ts}-${uploadFile.name}`;
      const { error: fileErr } = await supabase.storage.from("templates").upload(filePath, uploadFile);
      if (fileErr) throw fileErr;
      const { data: fileUrl } = supabase.storage.from("templates").getPublicUrl(filePath);

      let thumbnailUrl: string | null = null;
      if (uploadThumbnail) {
        const thumbPath = `${user.id}/${ts}-thumb-${uploadThumbnail.name}`;
        const { error: thumbErr } = await supabase.storage.from("templates").upload(thumbPath, uploadThumbnail);
        if (thumbErr) throw thumbErr;
        const { data: thumbUrl } = supabase.storage.from("templates").getPublicUrl(thumbPath);
        thumbnailUrl = thumbUrl.publicUrl;
      }

      const { error: dbErr } = await supabase.from("templates").insert({
        user_id: user.id,
        name: uploadName.trim(),
        category: uploadCategory,
        description: uploadDesc.trim() || null,
        file_url: fileUrl.publicUrl,
        thumbnail_url: thumbnailUrl,
      });
      if (dbErr) throw dbErr;

      queryClient.invalidateQueries({ queryKey: ["custom-templates"] });
      toast({ title: "Template uploaded!", description: "Your template is now available in the gallery." });
      setUploadOpen(false);
      setUploadName("");
      setUploadDesc("");
      setUploadFile(null);
      setUploadThumbnail(null);
      setUploadCategory("Custom");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/cv?template=${templateId}`);
  };

  const allTemplates = [
    ...templateDefinitions.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      desc: t.description,
      isCustom: false,
      image: templateImageMap[t.imageKey] || null,
      thumbnail_url: null as string | null,
      file_url: null as string | null,
    })),
    ...customTemplates.map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      desc: t.description || "Custom template",
      isCustom: true,
      thumbnail_url: t.thumbnail_url,
      file_url: t.file_url,
      image: null as string | null,
    })),
  ];

  const filtered = allTemplates.filter((t) =>
    (active === "All" || t.category === active) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFav = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  return (
    <WorkspaceLayout>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <PageHeader
          title="Template Gallery"
          subtitle={`${templateDefinitions.length + customTemplates.length} templates available`}
          actions={
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Upload Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Your Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Template name" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.filter((c) => c !== "All").map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Short description (optional)" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} rows={2} />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template File (DOCX, PDF)</label>
                    <input ref={fileRef} type="file" accept=".docx,.pdf,.doc,.txt" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                    <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => fileRef.current?.click()}>
                      <Upload className="h-3.5 w-3.5" /> {uploadFile ? uploadFile.name : "Choose file"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Thumbnail (optional, JPG/PNG)</label>
                    <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={(e) => setUploadThumbnail(e.target.files?.[0] || null)} />
                    <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => thumbRef.current?.click()}>
                      <Upload className="h-3.5 w-3.5" /> {uploadThumbnail ? uploadThumbnail.name : "Choose thumbnail"}
                    </Button>
                  </div>
                  <Button className="w-full gap-1.5" onClick={handleUpload} disabled={uploading || !uploadName.trim() || !uploadFile}>
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {uploading ? "Uploading..." : "Upload Template"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <Button key={c} variant={active === c ? "default" : "outline"} size="sm" onClick={() => setActive(c)}>
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => {
            const imgSrc = t.thumbnail_url || t.image;
            const isCvTemplate = ["Modern CV", "Academic", "Corporate", "Creative", "Minimal"].includes(t.category);
            return (
              <div key={t.id} className="glass-card-hover group overflow-hidden">
                <div className="relative h-44 overflow-hidden bg-secondary">
                  {imgSrc ? (
                    <img src={imgSrc} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex gap-1">
                    {t.isCustom && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">Custom</span>
                    )}
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {t.isCustom && (
                      <button onClick={() => deleteMutation.mutate(t.id)} className="rounded-full bg-card/80 p-1.5">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    )}
                    <button onClick={() => toggleFav(t.id)} className="rounded-full bg-card/80 p-1.5">
                      <Heart className={`h-3.5 w-3.5 ${favorites.includes(t.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium">{t.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
                  <div className="mt-3 flex gap-2">
                    {isCvTemplate && !t.isCustom ? (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleUseTemplate(t.id)}>
                        Use Template
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1">Use Template</Button>
                    )}
                    {t.file_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={t.file_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No templates found. Try a different search or category.</p>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
