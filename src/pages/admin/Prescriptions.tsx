import { useEffect, useState } from "react";
import { adminGetPrescriptions, adminUpdatePrescription, adminDeletePrescription, AdminPrescription } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPrescriptionsPage() {
  const [items, setItems] = useState<AdminPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const revoke = async (id: number) => {
    try {
      await adminUpdatePrescription(id, { status: 'REVOKED' as any });
      toast.success('Prescription revoked');
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to revoke');
    }
  };

  const removeItem = async (id: number) => {
    try {
      await adminDeletePrescription(id);
      toast.success('Prescription deleted');
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
        <CardTitle>Prescriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Medication</th>
                <th className="text-left p-2">Dosage</th>
                <th className="text-left p-2">Issued</th>
                <th className="text-left p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.medication}</td>
                  <td className="p-2">{p.dosage}</td>
                  <td className="p-2">{new Date(p.issuedAt).toLocaleDateString()}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => revoke(p.id!)}>Revoke</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeItem(p.id!)}>Delete</Button>
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
