import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { Plus, Pencil, Trash2, Briefcase, Eye, Upload, X, Image } from "lucide-react";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name: string | null;
  industry: string | null;
  description: string;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  technologies: string[];
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

const emptyForm = {
  title: "", slug: "", client_name: "", industry: "", description: "",
  challenge: "", solution: "", results: "", technologies: "",
  cover_image_url: "", status: "draft",
};

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminPortfolio = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("case_studies")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as CaseStudy[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview(null);
    setShowDialog(true);
  };

  const openEdit = (item: CaseStudy) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      client_name: item.client_name || "",
      industry: item.industry || "",
      description: item.description,
      challenge: item.challenge || "",
      solution: item.solution || "",
      results: item.results || "",
      technologies: (item.technologies || []).join(", "),
      cover_image_url: item.cover_image_url || "",
      status: item.status,
    });
    setImagePreview(item.cover_image_url || null);
    setShowDialog(true);
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("portfolio-images")
      .getPublicUrl(filePath);

    setForm((f) => ({ ...f, cover_image_url: urlData.publicUrl }));
    setImagePreview(urlData.publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded" });
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, cover_image_url: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Title and description are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = form.slug.trim() || generateSlug(form.title);
    const techs = form.technologies.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: form.title.trim(),
      slug,
      client_name: form.client_name.trim() || null,
      industry: form.industry.trim() || null,
      description: form.description.trim(),
      challenge: form.challenge.trim() || null,
      solution: form.solution.trim() || null,
      results: form.results.trim() || null,
      technologies: techs,
      cover_image_url: form.cover_image_url.trim() || null,
      status: form.status,
      published_at: form.status === "published" ? new Date().toISOString() : null,
    };

    if (editingId) {
      const { error } = await supabase.from("case_studies").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      await logAudit({ action: "update", entity_type: "case_study", entity_id: editingId, details: { title: payload.title, status: payload.status } });
      toast({ title: "Case study updated" });
    } else {
      const { data, error } = await supabase.from("case_studies").insert(payload).select("id").single();
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      await logAudit({ action: "create", entity_type: "case_study", entity_id: data?.id, details: { title: payload.title } });
      toast({ title: "Case study created" });
    }

    setSaving(false);
    setShowDialog(false);
    load();
  };

  const deleteItem = async (item: CaseStudy) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase.from("case_studies").delete().eq("id", item.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logAudit({ action: "delete", entity_type: "case_study", entity_id: item.id, details: { title: item.title } });
    toast({ title: "Case study deleted" });
    load();
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-500/20 text-green-400",
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Portfolio Management</h1>
        <Button onClick={openCreate}><Plus size={16} className="mr-1" /> New Case Study</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : items.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No case studies yet. Create your first one to showcase your work.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <Image size={16} className="text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.client_name || "—"}</TableCell>
                  <TableCell>{item.industry || "—"}</TableCell>
                  <TableCell><Badge className={statusColor[item.status] || ""}>{item.status}</Badge></TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.status === "published" && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/portfolio/${item.slug}`} target="_blank" rel="noopener noreferrer"><Eye size={16} /></a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem(item)} className="text-destructive hover:text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Case Study" : "New Case Study"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated from title" className="text-muted-foreground" />
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Cover preview" className="w-full h-48 object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removeImage}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto text-muted-foreground mb-2" size={32} />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload cover image"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input value={form.client_name} onChange={(e) => set("client_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input value={form.industry} onChange={(e) => set("industry", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Challenge</Label>
              <Textarea value={form.challenge} onChange={(e) => set("challenge", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Solution</Label>
              <Textarea value={form.solution} onChange={(e) => set("solution", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Results</Label>
              <Textarea value={form.results} onChange={(e) => set("results", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Technologies (comma-separated)</Label>
              <Input value={form.technologies} onChange={(e) => set("technologies", e.target.value)} placeholder="React, Node.js, Solidity" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full glow-primary" onClick={save} disabled={saving || uploading}>
              {saving ? "Saving..." : editingId ? "Update Case Study" : "Create Case Study"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortfolio;
