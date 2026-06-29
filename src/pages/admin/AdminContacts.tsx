import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Download, Search, Inbox } from "lucide-react";

interface Submission {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const AdminContacts = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [exporting, setExporting] = useState(false);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []) as Submission[];
    },
    staleTime: 60_000,
  });

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.subject.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    setExporting(true);
    const header = ["Name", "Email", "Subject", "Message", "Date"].join(",");
    const rows = submissions.map((s) =>
      [s.full_name, s.email, s.subject, s.message, new Date(s.created_at).toLocaleString()]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-submissions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Contact Submissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Messages sent via the website contact form
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email or subject..."
              className="pl-8 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={exporting || submissions.length === 0}>
            <Download size={14} className="mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto text-muted-foreground mb-4 opacity-40" size={48} />
            <p className="font-display font-semibold mb-1">
              {search ? "No results found" : "No contact submissions yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search ? "Try a different search term." : "Messages from the contact form will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(s)}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${s.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary hover:underline"
                    >
                      {s.email}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">{s.subject}</TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                      View
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="glass max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{selected.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{selected.full_name}</span>
                <span>·</span>
                <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                <span>·</span>
                <span>{new Date(selected.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap border-t border-border pt-4">
                {selected.message}
              </p>
              <Button className="w-full glow-primary" asChild>
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                  <Mail size={14} className="mr-2" /> Reply via Email
                </a>
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminContacts;
