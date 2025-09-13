import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Row { id: string; email: string; role: "TRIAL"|"UNLIMITED"|"SUSPENDED"|"admin"; created_at: string }

const Admin: React.FC = () => {
  const { role } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,role,created_at")
        .order("created_at", { ascending: false });
      setLoading(false);
      if (error) {
        toast({ title: "Failed to load users", description: error.message, variant: "destructive" });
        return;
      }
      setRows((data || []) as Row[]);
    };
    load();
  }, [toast]);

  const filtered = useMemo(() => rows.filter(r => r.email.toLowerCase().includes(query.toLowerCase())), [rows, query]);

  const updateRole = async (id: string, newRole: Row["role"]) => {
    const prev = rows.slice();
    setRows(rows.map(r => r.id === id ? { ...r, role: newRole } : r));
    const { error } = await supabase.rpc("admin_set_role", { _user_id: id, _new_role: newRole });
    if (error) {
      setRows(prev);
      toast({ title: "Role change failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role updated" });
    }
  };

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage users and roles</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <Input placeholder="Search by email" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-md" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-muted text-sm font-medium">
          <div>Email</div>
          <div>Role</div>
          <div>Created</div>
          <div>Action</div>
        </div>
        <div>
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading users…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No users found</div>
          ) : (
            filtered.map((row) => (
              <div key={row.id} className="grid grid-cols-4 gap-2 px-4 py-3 border-t items-center">
                <div className="truncate" title={row.email}>{row.email}</div>
                <div>
                  <Select value={row.role} onValueChange={(v) => updateRole(row.id, v as Row["role"]) }>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRIAL">TRIAL</SelectItem>
                      <SelectItem value="UNLIMITED">UNLIMITED</SelectItem>
                      <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">{new Date(row.created_at).toLocaleString()}</div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => updateRole(row.id, row.role)}>Save</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Admin;
