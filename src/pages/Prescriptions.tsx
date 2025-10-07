import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Pill, Calendar, User } from "lucide-react";
import { getPrescriptions, PrescriptionDTO, getProfile } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Prescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, initialized } = useAuth();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // ensure profile/session is available; backend endpoints require an authenticated principal
      try {
        await getProfile();
      } catch (e: any) {
        // If getting profile fails, don't automatically redirect — show an action so user can sign in.
        if (e?.status === 401 || e?.status === 404) {
          setError("You need to sign in to view prescriptions. Click Sign in to continue.");
          return;
        }
        // ignore other profile retrieval errors and continue to try fetching prescriptions
      }

      const list = await getPrescriptions();
      setPrescriptions(list);
    } catch (err: any) {
        if (err?.status === 401) {
          setError("Session expired. Please sign in to continue.");
        } else if (err?.status === 500) {
        setError(err?.message || "Server error while loading prescriptions");
        toast.error("Server error while loading prescriptions. You can retry.");
      } else {
        setError(err?.message || "Failed to load prescriptions");
        toast.error(err?.message || "Failed to load prescriptions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) return; // wait until auth state is initialized from session
    if (!user) {
      // user not signed in
      setError("You need to sign in to view prescriptions. Click Sign in to continue.");
      return;
    }
    load();
  }, [navigate, user, initialized]);

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
          {error ? (
            <div className="col-span-1 p-6 border rounded-md bg-yellow-50">
              <h3 className="text-lg font-semibold mb-2">Unable to load prescriptions</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => { setError(null); load(); }} variant="outline">Retry</Button>
                <Button onClick={() => navigate('/contact')} variant="ghost">Contact Support</Button>
              </div>
            </div>
          ) : (
            <>
              {prescriptions.map((prescription) => {
                return (
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
                              {prescription.dosage} {prescription.instructions ? `• ${prescription.instructions}` : ""}
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
                            <p className="text-sm font-medium">Prescribed</p>
                            <p className="text-sm text-muted-foreground">{new Date(prescription.issuedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(prescription.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">End Date</p>
                            <p className="text-sm text-muted-foreground">
                              {prescription.expiresAt ? new Date(prescription.expiresAt).toLocaleDateString() : "—"}
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
                );
              })}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Prescriptions;
