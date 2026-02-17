import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="space-y-6 animate-fade-in">
    <h1 className="font-display font-bold text-2xl">{title}</h1>
    <Card className="glass">
      <CardContent className="py-12 text-center">
        <Construction className="mx-auto text-muted-foreground mb-4" size={48} />
        <p className="text-muted-foreground">This section is coming soon.</p>
      </CardContent>
    </Card>
  </div>
);

export default AdminPlaceholder;
