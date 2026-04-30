import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, FileText, Pencil, Trash2, Bold, Italic, Heading2, Link2, Code2, List } from "lucide-react";

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string; cover_image_url: string | null; status: string;
  tags: string[]; published_at: string | null; created_at: string;
}

const emptyForm = { title: "", slug: "", excerpt: "", content: "", cover_image_url: "", status: "draft", tags: "" };

const renderMarkdown = (md: string): string => {
  if (!md.trim()) return "<p class='text-muted-foreground italic'>Nothing to preview yet...</p>";
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^#### (.+)$/gm, "<h4 class='text-base font-semibold mt-4 mb-1'>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-semibold mt-5 mb-2'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold mt-6 mb-2'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold mt-6 mb-3'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='bg-muted px-1 rounded text-xs font-mono'>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-primary underline' target='_blank'>$1</a>")
    .replace(/^---$/gm, "<hr class='border-border my-4' />")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li class='ml-4 list-decimal'>$2</li>")
    .split("\n\n")
    .map((block) => block.startsWith("<") ? block : `<p class='mb-3 leading-relaxed'>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
};

const AdminBlog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowEditor(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post.id);
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt || "",
      content: post.content, cover_image_url: post.cover_image_url || "",
      status: post.status, tags: (post.tags || []).join(", "),
    });
    setShowEditor(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = form.slug.trim() || generateSlug(form.title);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      title: form.title.trim(), slug, excerpt: form.excerpt.trim() || null,
      content: form.content.trim(), cover_image_url: form.cover_image_url.trim() || null,
      status: form.status, tags,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      author_id: user?.id || null,
    };

    let resultId = editing;
    if (editing) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing);
      if (error) { setSaving(false); toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
      if (error) { setSaving(false); toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      resultId = data?.id || null;
    }

    await logAudit({ action: editing ? "update" : "create", entity_type: "blog_post", entity_id: resultId || undefined, details: { title: payload.title, status: payload.status } });

    setSaving(false);
    toast({ title: editing ? "Post updated" : "Post created" });
    setShowEditor(false);
    load();
  };

  const deletePost = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    await supabase.from("blog_posts").delete().eq("id", post.id);
    await logAudit({ action: "delete", entity_type: "blog_post", entity_id: post.id, details: { title: post.title } });
    toast({ title: "Post deleted" });
    load();
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-500/20 text-green-400",
    archived: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Blog & Insights</h1>
        <Button onClick={openCreate}><Plus size={16} className="mr-1" /> New Post</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : posts.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center">
          <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">No blog posts yet. Create your first one!</p>
        </CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Title</TableHead><TableHead>Status</TableHead>
              <TableHead>Tags</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell><Badge className={statusColor[p.status] || ""}>{p.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(p.tags || []).slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deletePost(p)} className="text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="glass max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => {
                  setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || generateSlug(e.target.value) }));
                }} placeholder="Post title" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder="Brief summary..." />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Tabs defaultValue="write">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    {[
                      { icon: Bold, insert: "**bold**", title: "Bold" },
                      { icon: Italic, insert: "*italic*", title: "Italic" },
                      { icon: Heading2, insert: "\n## Heading\n", title: "Heading" },
                      { icon: List, insert: "\n- Item\n", title: "List" },
                      { icon: Link2, insert: "[link text](url)", title: "Link" },
                      { icon: Code2, insert: "`code`", title: "Inline Code" },
                    ].map(({ icon: Icon, insert, title }) => (
                      <Button key={title} type="button" variant="ghost" size="icon" className="h-7 w-7" title={title}
                        onClick={() => setForm((f) => ({ ...f, content: f.content + insert }))}>
                        <Icon size={13} />
                      </Button>
                    ))}
                  </div>
                  <TabsList className="h-7">
                    <TabsTrigger value="write" className="text-xs px-3 py-0.5">Write</TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs px-3 py-0.5">Preview</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="write" className="mt-0">
                  <Textarea
                    rows={14}
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder={"# Article Title\n\nWrite your article in **Markdown**.\n\n## Section Heading\n\nParagraph text here..."}
                    className="font-mono text-sm resize-y"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div
                    className="min-h-[280px] rounded-md border border-input bg-muted/30 p-4 text-sm prose prose-invert max-w-none overflow-auto"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
                  />
                </TabsContent>
              </Tabs>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="tech, design, ai" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full glow-primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
