import { useEffect, useState } from "react";
import { adminGetContactMessages, adminDeleteContactMessage, AdminContactMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminMessagesPage() {
  const [items, setItems] = useState<AdminContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminGetContactMessages();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const removeItem = async (id: number) => {
    try {
      await adminDeleteContactMessage(id);
      toast.success('Message deleted');
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Message</th>
                <th className="text-left p-2">Received</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.id} className="border-t">
                  <td className="p-2">{m.name}</td>
                  <td className="p-2">{m.email}</td>
                  <td className="p-2 max-w-[400px] truncate" title={m.message}>{m.message}</td>
                  <td className="p-2">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</td>
                  <td className="p-2">
                    <Button size="sm" variant="destructive" onClick={() => removeItem(m.id!)}>Delete</Button>
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
