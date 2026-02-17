import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, Eye } from "lucide-react";

interface Job {
  id: string; title: string; slug: string; department: string; location: string;
  employment_type: string; status: string; created_at: string;
}
interface Application {
  id: string; job_id: string; full_name: string; email: string; phone: string | null;
  linkedin: string | null; portfolio: string | null; resume_url: string | null;
  cover_letter: string | null; status: string; created_at: string;
}

const AdminCareers = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [form, setForm] = useState({
    title: "", slug: "", department: "", location: "", employment_type: "full-time",
    description: "", responsibilities: "", requirements: "", benefits: "",
  });

  const load = async () => {
    const [jRes, aRes] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("job_applications").select("*").order("created_at", { ascending: false }),
    ]);
    setJobs(jRes.data || []);
    setApps(aRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createJob = async () => {
    if (!form.title || !form.department || !form.location || !form.description) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("jobs").insert({
      ...form, slug, created_by: user?.id || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Job created" });
    setShowCreate(false);
    setForm({ title: "", slug: "", department: "", location: "", employment_type: "full-time", description: "", responsibilities: "", requirements: "", benefits: "" });
    load();
  };

  const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j.title]));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Careers</h1>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} className="mr-1" /> New Job</Button>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="glass"><TabsTrigger value="jobs">Jobs</TabsTrigger><TabsTrigger value="applications">Applications ({apps.length})</TabsTrigger></TabsList>

        <TabsContent value="jobs" className="mt-4">
          {loading ? <p className="text-muted-foreground">Loading...</p> : jobs.length === 0 ? (
            <Card className="glass"><CardContent className="py-12 text-center"><Briefcase className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No jobs posted yet.</p></CardContent></Card>
          ) : (
            <Card className="glass overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Title</TableHead><TableHead>Department</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {jobs.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell className="font-medium">{j.title}</TableCell>
                      <TableCell>{j.department}</TableCell>
                      <TableCell>{j.location}</TableCell>
                      <TableCell><Badge variant="outline">{j.status}</Badge></TableCell>
                      <TableCell>{new Date(j.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          {apps.length === 0 ? (
            <p className="text-muted-foreground">No applications yet.</p>
          ) : (
            <Card className="glass overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Job</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {apps.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.full_name}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>{jobMap[a.job_id] || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                      <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><Button size="icon" variant="ghost" onClick={() => setSelectedApp(a)}><Eye size={16} /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>Create Job Posting</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department *</Label><Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} /></div>
              <div><Label>Location *</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
            </div>
            <div><Label>Employment Type</Label><Input value={form.employment_type} onChange={(e) => setForm((f) => ({ ...f, employment_type: e.target.value }))} /></div>
            <div><Label>Description *</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div><Label>Responsibilities</Label><Textarea value={form.responsibilities} onChange={(e) => setForm((f) => ({ ...f, responsibilities: e.target.value }))} rows={3} /></div>
            <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} rows={3} /></div>
            <div><Label>Benefits</Label><Textarea value={form.benefits} onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))} rows={3} /></div>
            <Button className="w-full glow-primary" onClick={createJob}>Create Job</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {selectedApp && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {selectedApp.full_name}</div>
              <div><span className="text-muted-foreground">Email:</span> {selectedApp.email}</div>
              <div><span className="text-muted-foreground">Phone:</span> {selectedApp.phone || "—"}</div>
              <div><span className="text-muted-foreground">LinkedIn:</span> {selectedApp.linkedin || "—"}</div>
              <div><span className="text-muted-foreground">Portfolio:</span> {selectedApp.portfolio || "—"}</div>
              <div><span className="text-muted-foreground">Cover Letter:</span> {selectedApp.cover_letter || "—"}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline">{selectedApp.status}</Badge></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCareers;
