import { useEffect, useState } from "react";
import { adminGetAppointments, adminUpdateAppointment, adminGetAppointment, AdminAppointment } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminAppointmentsPage() {
  const [items, setItems] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

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

  const updateStatus = async (id: number, status: string) => {
    try {
      setSavingId(id);
      const existing = await adminGetAppointment(id);
      await adminUpdateAppointment(id, { ...existing, status });
      toast.success('Status updated');
      // Optimistic update to avoid full reload flicker
      setItems((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    } catch (e: any) {
      if (e?.status === 401) {
        toast.error('Unauthorized. Please log in as admin.');
      } else {
        toast.error(e?.message || 'Failed to update status');
      }
    } finally {
      setSavingId(null);
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
                <th className="text-left p-2">Patient Name</th>
                <th className="text-left p-2">Patient Email</th>
                <th className="text-left p-2">Doctor</th>
                <th className="text-left p-2">Specialty</th>
                <th className="text-left p-2">Start</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.patientName || "Unknown"}</td>
                  <td className="p-2">{a.patientEmail || "Unknown"}</td>
                  <td className="p-2">{a.doctor}</td>
                  <td className="p-2">{a.specialty}</td>
                  <td className="p-2">{new Date(a.startTime).toLocaleString()}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Select
                        value={a.status || 'PENDING'}
                        onValueChange={(val) => updateStatus(a.id!, val)}
                        disabled={savingId === a.id}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
