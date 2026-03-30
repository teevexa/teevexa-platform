import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const AdminReports = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("client_projects").select("*").order("created_at", { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const generatePDF = async () => {
    if (!selectedProject) {
      toast({ title: "Select a project", variant: "destructive" });
      return;
    }
    setGenerating(true);

    try {
      // Fetch all project data
      const project = projects.find(p => p.id === selectedProject)!;
      const [milestonesRes, tasksRes, invoicesRes, timeRes, profilesRes] = await Promise.all([
        supabase.from("project_milestones").select("*").eq("project_id", selectedProject).order("due_date"),
        supabase.from("project_tasks").select("*").eq("project_id", selectedProject).order("created_at"),
        supabase.from("invoices").select("*").eq("project_id", selectedProject).order("created_at"),
        supabase.from("time_entries").select("*").eq("project_id", selectedProject).order("date"),
        supabase.from("profiles").select("user_id, display_name"),
      ]);

      const milestones = milestonesRes.data || [];
      const tasks = tasksRes.data || [];
      const invoices = invoicesRes.data || [];
      const timeEntries = timeRes.data || [];
      const profiles = profilesRes.data || [];

      const getName = (id: string) => profiles.find(p => p.user_id === id)?.display_name || "Unassigned";

      // Build HTML for PDF
      const totalHours = timeEntries.reduce((s, t) => s + Number(t.hours), 0);
      const totalInvoiced = invoices.reduce((s, i) => s + Number(i.amount), 0);
      const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);

      const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; font-size: 13px; }
  h1 { font-size: 24px; margin-bottom: 4px; color: #0f172a; }
  h2 { font-size: 16px; margin: 24px 0 8px; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
  .meta { display: flex; gap: 24px; margin: 16px 0; flex-wrap: wrap; }
  .meta-item { background: #f1f5f9; border-radius: 8px; padding: 12px 16px; flex: 1; min-width: 140px; }
  .meta-item .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
  .meta-item .value { font-size: 18px; font-weight: 700; color: #0f172a; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
  th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; color: #475569; }
  td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
  .badge-done { background: #dcfce7; color: #166534; }
  .badge-pending { background: #fef9c3; color: #854d0e; }
  .badge-active { background: #dbeafe; color: #1e40af; }
  .badge-paid { background: #dcfce7; color: #166534; }
  .badge-overdue { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 32px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <h1>${project.title}</h1>
  <p class="subtitle">Project Summary Report — Generated ${format(new Date(), "MMMM d, yyyy")}</p>
  
  <div class="meta">
    <div class="meta-item"><div class="label">Status</div><div class="value">${project.status}</div></div>
    <div class="meta-item"><div class="label">Progress</div><div class="value">${project.progress}%</div></div>
    <div class="meta-item"><div class="label">Budget</div><div class="value">${project.budget || "N/A"}</div></div>
    <div class="meta-item"><div class="label">Total Hours</div><div class="value">${totalHours.toFixed(1)}</div></div>
  </div>

  ${project.description ? `<p style="margin:12px 0;color:#475569;">${project.description}</p>` : ""}

  <div class="meta">
    <div class="meta-item"><div class="label">Start Date</div><div class="value">${project.start_date ? format(parseISO(project.start_date), "MMM d, yyyy") : "TBD"}</div></div>
    <div class="meta-item"><div class="label">End Date</div><div class="value">${project.end_date ? format(parseISO(project.end_date), "MMM d, yyyy") : "TBD"}</div></div>
    <div class="meta-item"><div class="label">Total Invoiced</div><div class="value">${totalInvoiced.toLocaleString()}</div></div>
    <div class="meta-item"><div class="label">Total Paid</div><div class="value">${totalPaid.toLocaleString()}</div></div>
  </div>

  ${milestones.length > 0 ? `
  <h2>Milestones (${milestones.length})</h2>
  <table><thead><tr><th>Title</th><th>Due Date</th><th>Status</th></tr></thead><tbody>
    ${milestones.map(m => `<tr>
      <td>${m.title}</td>
      <td>${m.due_date ? format(parseISO(m.due_date), "MMM d, yyyy") : "—"}</td>
      <td><span class="badge ${m.status === 'completed' ? 'badge-done' : 'badge-pending'}">${m.status}</span></td>
    </tr>`).join("")}
  </tbody></table>` : ""}

  ${tasks.length > 0 ? `
  <h2>Tasks (${tasks.length})</h2>
  <table><thead><tr><th>Title</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead><tbody>
    ${tasks.map(t => `<tr>
      <td>${t.title}</td>
      <td>${t.assigned_to ? getName(t.assigned_to) : "Unassigned"}</td>
      <td>${t.priority}</td>
      <td><span class="badge ${t.status === 'done' ? 'badge-done' : t.status === 'in-progress' ? 'badge-active' : 'badge-pending'}">${t.status}</span></td>
      <td>${t.due_date ? format(parseISO(t.due_date), "MMM d") : "—"}</td>
    </tr>`).join("")}
  </tbody></table>` : ""}

  ${invoices.length > 0 ? `
  <h2>Invoices (${invoices.length})</h2>
  <table><thead><tr><th>Invoice #</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead><tbody>
    ${invoices.map(i => `<tr>
      <td>${i.invoice_number}</td>
      <td>${i.currency} ${Number(i.amount).toLocaleString()}</td>
      <td><span class="badge ${i.status === 'paid' ? 'badge-paid' : i.status === 'overdue' ? 'badge-overdue' : 'badge-pending'}">${i.status}</span></td>
      <td>${i.due_date ? format(parseISO(i.due_date), "MMM d, yyyy") : "—"}</td>
    </tr>`).join("")}
  </tbody></table>` : ""}

  ${timeEntries.length > 0 ? `
  <h2>Time Log (${totalHours.toFixed(1)} hours)</h2>
  <table><thead><tr><th>Date</th><th>Team Member</th><th>Hours</th><th>Description</th></tr></thead><tbody>
    ${timeEntries.slice(0, 50).map(t => `<tr>
      <td>${format(parseISO(t.date), "MMM d, yyyy")}</td>
      <td>${getName(t.user_id)}</td>
      <td>${Number(t.hours).toFixed(1)}h</td>
      <td>${t.description || "—"}</td>
    </tr>`).join("")}
  </tbody></table>` : ""}

  <div class="footer">
    <p>Teevexa Ltd — Confidential Project Report</p>
    <p>Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
  </div>
</body></html>`;

      // Open in new tab for printing/saving as PDF
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (win) {
        win.onload = () => {
          setTimeout(() => win.print(), 500);
        };
      }
      toast({ title: "Report generated", description: "Use your browser's print dialog to save as PDF." });
    } catch (err: any) {
      toast({ title: "Error generating report", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Report Generation</h1>
        <p className="text-muted-foreground text-sm">Generate and export project summary reports as PDF</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText size={16} /> Project Summary Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a comprehensive report including project details, milestones, tasks, invoices, and time logs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-[300px]"><SelectValue placeholder="Select a project" /></SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      {p.title}
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generatePDF} disabled={generating || !selectedProject}>
              {generating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              {generating ? "Generating..." : "Generate PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Project list for quick access */}
      <Card>
        <CardHeader><CardTitle className="text-base">Available Projects</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map(p => (
              <button key={p.id} onClick={() => setSelectedProject(p.id)}
                className={`text-left p-4 rounded-lg border transition-colors ${selectedProject === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <p className="font-medium text-sm">{p.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                  <span className="text-xs text-muted-foreground">{p.progress}% complete</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
