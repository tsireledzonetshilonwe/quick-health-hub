import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Pill, Calendar, User } from "lucide-react";
import { getPrescriptions, PrescriptionDTO } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Prescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const list = await getPrescriptions();
        setPrescriptions(list);
      } catch (err: any) {
        if (err?.status === 401) {
          toast.error("Session expired. Please sign in again.");
          navigate("/login");
        } else {
          toast.error(err?.message || "Failed to load prescriptions");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "Completed":
        return "bg-muted text-muted-foreground border-muted";
      case "Expired":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Prescriptions</h1>
          <p className="text-muted-foreground">View and manage your medication prescriptions</p>
        </div>

        <div className="mb-6 flex gap-4">
          <Button variant="outline">Active</Button>
          <Button variant="outline">All Prescriptions</Button>
          <Button variant="outline">Request Refill</Button>
        </div>

        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Pill className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{prescription.medication}</CardTitle>
                      <p className="text-muted-foreground mt-1">
                        {prescription.dosage} • {prescription.frequency}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(prescription.status)}>
                    {prescription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Prescribed by</p>
                      <p className="text-sm text-muted-foreground">{prescription.doctor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(prescription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(prescription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    Request Refill
                  </Button>
                  {prescription.status === "Active" && (
                    <Button variant="outline" size="sm">
                      Set Reminder
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Prescriptions;
