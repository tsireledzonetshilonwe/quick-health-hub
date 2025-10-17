import { useEffect, useState } from "react";
import { adminGetPrescriptions, adminUpdatePrescription, adminGetPrescription, AdminPrescription } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminPrescriptionsPage() {
  const [items, setItems] = useState<AdminPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminGetPrescriptions();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      setSavingId(id);
      const existing = await adminGetPrescription(id);
      await adminUpdatePrescription(id, { ...existing, status });
      toast.success('Status updated');
      // Optimistic update
      setItems((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
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
        <CardTitle>Prescriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Patient Name</th>
                <th className="text-left p-2">Patient Email</th>
                <th className="text-left p-2">Medication</th>
                <th className="text-left p-2">Dosage</th>
                <th className="text-left p-2">Issued</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.patientName || "Unknown"}</td>
                  <td className="p-2">{p.patientEmail || "Unknown"}</td>
                  <td className="p-2">{p.medication}</td>
                  <td className="p-2">{p.dosage}</td>
                  <td className="p-2">{new Date(p.issuedAt).toLocaleDateString()}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Select
                        value={p.status || 'Active'}
                        onValueChange={(val) => updateStatus(p.id!, val)}
                        disabled={savingId === p.id}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Revoked">Revoked</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
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
