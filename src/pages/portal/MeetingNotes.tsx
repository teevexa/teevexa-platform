import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotebookText, CheckSquare, Users, Calendar, Inbox } from "lucide-react";

interface MeetingNote {
  id: string;
  project_id: string;
  title: string;
  meeting_date: string;
  attendees: string[];
  summary: string;
  action_items: string[];
  created_at: string;
}

interface Project {
  id: string;
  title: string;
}

const MeetingNotes = () => {
  const { user } = useAuth();
  const [projectFilter, setProjectFilter] = useState("all");
  const [selected, setSelected] = useState<MeetingNote | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["portal-projects-select", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("client_projects").select("id, title").eq("user_id", user!.id);
      return (data || []) as Project[];
    },
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["portal-meeting-notes", user?.id, projectFilter],
    enabled: !!user?.id && projects.length >= 0,
    queryFn: async () => {
      const projectIds = projectFilter === "all"
        ? projects.map((p) => p.id)
        : [projectFilter];
      if (projectIds.length === 0) return [] as MeetingNote[];
      const { data } = await supabase
        .from("meeting_notes")
        .select("*")
        .in("project_id", projectIds)
        .order("meeting_date", { ascending: false });
      return (data || []) as MeetingNote[];
    },
    enabled: !!user?.id && projects.length > 0,
  });

  const getProjectTitle = (id: string) => projects.find((p) => p.id === id)?.title || "—";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Meeting Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">Notes and action items from your project calls</p>
        </div>
        {projects.length > 1 && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : notes.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto text-muted-foreground mb-4 opacity-40" size={48} />
            <p className="font-display font-semibold mb-1">No meeting notes yet</p>
            <p className="text-sm text-muted-foreground">After each call, the team will post notes and action items here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="glass hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelected(note)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{note.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(note.meeting_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {note.attendees?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {note.attendees.length} attendee{note.attendees.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{getProjectTitle(note.project_id)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{note.summary}</p>
                {note.action_items?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-primary/80">
                    <CheckSquare size={12} />
                    {note.action_items.length} action item{note.action_items.length > 1 ? "s" : ""}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="glass max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <NotebookText size={18} className="text-primary" />
                {selected.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 text-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(selected.meeting_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
                <Badge variant="outline">{getProjectTitle(selected.project_id)}</Badge>
              </div>

              {selected.attendees?.length > 0 && (
                <div>
                  <p className="font-semibold mb-2 flex items-center gap-1.5"><Users size={14} /> Attendees</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.attendees.map((a, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="font-semibold mb-2">Summary</p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selected.summary}</p>
              </div>

              {selected.action_items?.length > 0 && (
                <div>
                  <p className="font-semibold mb-2 flex items-center gap-1.5"><CheckSquare size={14} className="text-primary" /> Action Items</p>
                  <ul className="space-y-2">
                    {selected.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 w-5 h-5 rounded-md border border-primary/30 bg-primary/5 flex items-center justify-center text-[10px] font-semibold text-primary flex-shrink-0">{i + 1}</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default MeetingNotes;
