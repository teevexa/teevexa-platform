import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  pdf_url: string | null;
}

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  overdue: "bg-destructive/20 text-destructive",
};

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
      setInvoices(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Invoices</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : invoices.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Receipt className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No invoices yet. Your billing details will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id} className="glass">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{inv.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {inv.currency} {Number(inv.amount).toLocaleString()}
                    {inv.due_date && ` · Due ${new Date(inv.due_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusStyle[inv.status] || statusStyle.pending}>{inv.status}</Badge>
                  {inv.pdf_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"><Download size={16} /></a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;
