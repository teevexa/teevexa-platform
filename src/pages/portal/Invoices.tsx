import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardRowSkeleton } from "@/components/portal/PortalSkeleton";
import PortalError from "@/components/portal/PortalError";
import { formatCurrency } from "@/lib/format";

interface Invoice {
  id: string; invoice_number: string; amount: number; currency: string;
  status: string; due_date: string | null; paid_at: string | null; pdf_url: string | null;
}

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  overdue: "bg-destructive/20 text-destructive",
  sent: "bg-primary/20 text-primary",
};

const Invoices = () => {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: invoices = [], isLoading, error, refetch } = useQuery<Invoice[]>({
    queryKey: ["invoices", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Invoice[];
    },
  });

  const unpaid = invoices.filter((i) => i.status !== "paid");
  const totalUnpaidByCurrency = unpaid.reduce<Record<string, number>>((acc, inv) => {
    const code = (inv.currency || "KES").toUpperCase();
    acc[code] = (acc[code] || 0) + Number(inv.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Invoices</h1>
        {invoices.length > 0 && (
          <span className="text-sm text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Outstanding summary bar */}
      {!isLoading && unpaid.length > 0 && (
        <div className="glass rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 border-amber-500/20 border">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Outstanding balance</p>
            <p className="text-xs text-muted-foreground">
              {unpaid.length} unpaid invoice{unpaid.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(totalUnpaidByCurrency).map(([currency, total]) => (
              <span key={currency} className="text-base font-display font-bold text-amber-400">
                {formatCurrency(total, currency)}
              </span>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <CardRowSkeleton rows={5} />
      ) : error ? (
        <PortalError onRetry={refetch} />
      ) : invoices.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <Receipt className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="font-medium mb-1">No invoices yet</p>
            <p className="text-sm text-muted-foreground">Your billing details will appear here once invoices are issued.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const isOverdue = inv.status === "overdue";
            return (
              <Card key={inv.id} className={`glass transition-all ${isOverdue ? "border-l-2 border-l-destructive" : ""}`}>
                <CardContent className="flex items-center justify-between py-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatCurrency(Number(inv.amount), inv.currency)}
                      {inv.due_date && (
                        <span className={isOverdue ? "text-destructive ml-2" : " ml-2"}>
                          · Due {new Date(inv.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {inv.paid_at && <span className="text-green-400 ml-2">· Paid {new Date(inv.paid_at).toLocaleDateString()}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={statusStyle[inv.status] || statusStyle.pending}>{inv.status}</Badge>
                    {inv.pdf_url && (
                      <Button variant="ghost" size="icon" asChild title="Download invoice">
                        <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"><Download size={16} /></a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Invoices;
