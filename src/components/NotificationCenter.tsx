import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCheck, MessageSquare, Milestone, Receipt, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "@/lib/format";

interface Notification {
  id: string; title: string; message: string; type: string; read: boolean; link: string | null; created_at: string;
}

const typeIcons: Record<string, typeof Info> = {
  message: MessageSquare, milestone: Milestone, invoice: Receipt, info: Info,
};

const groupByDate = (notifications: Notification[]): { label: string; items: Notification[] }[] => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const groups: Record<string, Notification[]> = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach((n) => {
    const d = new Date(n.created_at); d.setHours(0, 0, 0, 0);
    if (d >= today) groups["Today"].push(n);
    else if (d >= yesterday) groups["Yesterday"].push(n);
    else groups["Earlier"].push(n);
  });
  return Object.entries(groups).filter(([, items]) => items.length > 0).map(([label, items]) => ({ label, items }));
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setNotifications(data);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 50)))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Update browser tab title with unread count
  useEffect(() => {
    const baseTitle = "Client Portal — Teevexa";
    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
    return () => { document.title = baseTitle; };
  }, [unreadCount]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) { navigate(n.link); setOpen(false); }
  };

  const groups = groupByDate(notifications);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-display font-semibold text-sm">
            Notifications
            {unreadCount > 0 && <span className="ml-2 text-xs text-muted-foreground">{unreadCount} unread</span>}
          </h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7 gap-1">
              <CheckCheck size={14} /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="mx-auto text-muted-foreground mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            groups.map(({ label, items }) => (
              <div key={label}>
                <div className="px-4 py-2 bg-muted/40 border-b border-border/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                </div>
                {items.map((n) => {
                  const Icon = typeIcons[n.type] || Info;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${!n.read ? "text-primary" : "text-muted-foreground"}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!n.read ? "font-medium" : ""}`}>{n.title}</p>
                          {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
