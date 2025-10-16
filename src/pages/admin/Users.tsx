import { useEffect, useState } from "react";
import { adminGetUsers, adminSetUserRoles, adminActivateUser, adminDeactivateUser, AdminUser } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminGetUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (u: AdminUser) => {
    try {
      if (u.active === false) {
        await adminActivateUser(u.id!);
        toast.success("User activated");
      } else {
        await adminDeactivateUser(u.id!);
        toast.success("User deactivated");
      }
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update user status");
    }
  };

  const setRoles = async (u: AdminUser, roles: string[]) => {
    try {
      await adminSetUserRoles(u.id!, roles);
      toast.success("Roles updated");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update roles");
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Roles</th>
                <th className="text-left p-2">Active</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.fullName}</td>
                  <td className="p-2">{(u.roles || []).join(', ') || '-'}</td>
                  <td className="p-2">{u.active === false ? 'No' : 'Yes'}</td>
                  <td className="p-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(u)}>
                      {u.active === false ? 'Activate' : 'Deactivate'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setRoles(u, (u.roles?.includes('ADMIN') ? ['PATIENT'] : ['ADMIN','PATIENT']))}>
                      {u.roles?.includes('ADMIN') ? 'Revoke Admin' : 'Make Admin'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
