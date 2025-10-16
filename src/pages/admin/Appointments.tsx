import { useEffect, useState } from "react";
import { adminGetAppointments, adminUpdateAppointment, adminDeleteAppointment, AdminAppointment } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminAppointmentsPage() {
  const [items, setItems] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminGetAppointments();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id: number) => {
    try {
      await adminUpdateAppointment(id, { status: 'CANCELLED' });
      toast.success('Appointment cancelled');
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to cancel');
    }
  };

  const removeItem = async (id: number) => {
    try {
      await adminDeleteAppointment(id);
      toast.success('Appointment deleted');
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
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Doctor</th>
                <th className="text-left p-2">Specialty</th>
                <th className="text-left p-2">Start</th>
                <th className="text-left p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.doctor}</td>
                  <td className="p-2">{a.specialty}</td>
                  <td className="p-2">{new Date(a.startTime).toLocaleString()}</td>
                  <td className="p-2">{a.status}</td>
                  <td className="p-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => cancel(a.id!)}>Cancel</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeItem(a.id!)}>Delete</Button>
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
