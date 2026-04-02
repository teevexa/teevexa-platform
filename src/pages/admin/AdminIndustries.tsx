import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";

interface Industry {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  cover_image_url: string | null;
  services: string[] | null;
  status: string;
  sort_order: number;
}

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminIndustries = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [status, setStatus] = useState("published");
  const [sortOrder, setSortOrder] = useState(0);

  const fetchAll = async () => {
    const { data } = await supabase
      .from("industries")
      .select("*")
      .order("sort_order", { ascending: true });
    setItems((data as Industry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setTitle(""); setSlug(""); setDescription(""); setIcon(""); setCoverUrl("");
    setServicesText(""); setStatus("published"); setSortOrder(0); setEditId(null);
  };

  const openCreate = () => { resetForm(); setOpen(true); };

  const openEdit = (item: Industry) => {
    setEditId(item.id);
    setTitle(item.title);
    setSlug(item.slug);
    setDescription(item.description);
    setIcon(item.icon || "");
    setCoverUrl(item.cover_image_url || "");
    setServicesText((item.services || []).join(", "));
    setStatus(item.status);
    setSortOrder(item.sort_order);
    setOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editId) setSlug(generateSlug(val));
  };

  const handleSave = async () => {
    if (!title || !slug) { toast({ title: "Title and slug are required", variant: "destructive" }); return; }
    const services = servicesText.split(",").map(s => s.trim()).filter(Boolean);
    const payload = {
      title, slug, description, icon: icon || null, cover_image_url: coverUrl || null,
      services, status, sort_order: sortOrder,
    };

    if (editId) {
      const { error } = await supabase.from("industries").update(payload).eq("id", editId);
      if (error) { toast({ title: "Error updating industry", description: error.message, variant: "destructive" }); return; }
      logAudit("update", "industry", editId, user?.id);
      toast({ title: "Industry updated" });
    } else {
      const { error } = await supabase.from("industries").insert(payload);
      if (error) { toast({ title: "Error creating industry", description: error.message, variant: "destructive" }); return; }
      logAudit("create", "industry", slug, user?.id);
      toast({ title: "Industry created" });
    }
    setOpen(false); resetForm(); fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this industry?")) return;
    await supabase.from("industries").delete().eq("id", id);
    logAudit("delete", "industry", id, user?.id);
    toast({ title: "Industry deleted" });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Industries</h1>
          <p className="text-muted-foreground">Manage industry categories displayed on the public site.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus size={16} className="mr-2" /> Add Industry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Industry</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Healthcare" />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="healthcare" />
              </div>
              <div>
                <label className="text-sm font-medium">Icon (emoji)</label>
                <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🏥" />
              </div>
              <div>
                <label className="text-sm font-medium">Cover Image URL</label>
                <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe what you offer in this industry..." />
              </div>
              <div>
                <label className="text-sm font-medium">Services (comma separated)</label>
                <Input value={servicesText} onChange={(e) => setServicesText(e.target.value)} placeholder="Web App, Mobile App, ERP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sort Order</label>
                  <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>{editId ? "Update" : "Create"} Industry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Building2 className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">No industries yet. Create your first one!</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xl">{item.icon || "—"}</TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(item.services || []).slice(0, 2).map(s => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                      {(item.services || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">+{(item.services || []).length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "published" ? "default" : "secondary"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.sort_order}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Edit size={14} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminIndustries;
