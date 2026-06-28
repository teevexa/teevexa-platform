import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Key, Plus, Trash2, Copy, Check, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { DashboardSkeleton } from "@/components/portal/PortalSkeleton";
import PortalError from "@/components/portal/PortalError";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  revoked: boolean;
  last_used_at: string | null;
  created_at: string;
}

function generateApiKey(): string {
  const prefix = "tkvx_";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = prefix;
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  for (const byte of array) {
    key += chars[byte % chars.length];
  }
  return key;
}

async function sha256Hex(str: string): Promise<string> {
  const encoded = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ApiKeys() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: keys, isLoading, error, refetch } = useQuery<ApiKey[]>({
    queryKey: ["apiKeys", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trace_api_keys")
        .select("id, name, prefix, revoked, last_used_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from("trace_api_keys")
        .update({ revoked: true })
        .eq("id", keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys", user?.id] });
      toast({ title: "API key revoked" });
    },
    onError: () => {
      toast({ title: "Failed to revoke key", variant: "destructive" });
    },
  });

  const handleCreate = async () => {
    if (!newKeyName.trim() || !user) return;
    setCreating(true);
    try {
      const fullKey = generateApiKey();
      const prefix = fullKey.slice(5, 13);
      const keyHash = await sha256Hex(fullKey);

      const { error } = await supabase.from("trace_api_keys").insert({
        user_id: user.id,
        name: newKeyName.trim(),
        prefix,
        key_hash: keyHash,
      });

      if (error) {
        toast({ title: "Could not create API key", description: error.message, variant: "destructive" });
        return;
      }

      setCreatedKey(fullKey);
      setNewKeyName("");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["apiKeys", user.id] });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <PortalError onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use API keys to verify batch provenance from your own systems.{" "}
            <a href="/api-docs" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Read the API docs →
            </a>
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 glow-primary">
          <Plus size={16} />
          New API Key
        </Button>
      </div>

      {/* Newly created key — show once */}
      {createdKey && (
        <Card className="glass border-green-500/30 bg-green-500/5">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-400 mb-1">API Key Created</p>
                <p className="text-xs text-muted-foreground">
                  Copy this key now — it will not be shown again.
                </p>
              </div>
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            </div>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 bg-muted/30 border border-border rounded-lg text-xs font-mono text-green-300 truncate">
                {createdKey}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyKey} className="gap-1.5 shrink-0">
                {copiedKey ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copiedKey ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-muted-foreground"
              onClick={() => setCreatedKey(null)}
            >
              I've saved this key — dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create form */}
      {showForm && (
        <Card className="glass border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Key size={16} className="text-primary" />
              Create New API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Key Name (e.g. "Shopify Integration")
              </label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="My Integration"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()} className="gap-2">
                <Plus size={14} />
                {creating ? "Creating…" : "Create Key"}
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setNewKeyName(""); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys list */}
      <Card className="glass border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Key size={16} className="text-primary" />
            Your API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!keys || keys.length === 0 ? (
            <div className="text-center py-8">
              <Key size={28} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No API keys yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Create a key to integrate with your own systems.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl border transition-colors ${
                    key.revoked
                      ? "border-border/30 bg-muted/10 opacity-60"
                      : "border-border/60 bg-white/2 hover:border-primary/20"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{key.name}</span>
                      {key.revoked ? (
                        <Badge className="bg-red-500/20 text-red-400 text-[10px]">Revoked</Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400 text-[10px]">Active</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <code className="text-xs font-mono text-muted-foreground">
                        tkvx_{key.prefix}…
                      </code>
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      {key.last_used_at && (
                        <span className="text-xs text-muted-foreground">
                          Last used {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {!key.revoked && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
                      onClick={() => {
                        if (confirm(`Revoke key "${key.name}"? This cannot be undone.`)) {
                          revokeMutation.mutate(key.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Docs link */}
      <Card className="glass border-border bg-primary/5">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Key size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">How to use your API key</p>
              <p className="text-xs text-muted-foreground mb-3">
                Pass the key in the <code className="text-primary bg-primary/10 px-1 rounded font-mono">X-Teevexa-API-Key</code> header.
                See the full API docs for request examples and response schemas.
              </p>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                  View API Documentation →
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
