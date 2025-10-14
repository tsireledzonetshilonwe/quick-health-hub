import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";
import { getAppointments, updateAppointment, getAppointment } from "@/lib/api";
import { toast } from "sonner";

interface Appointment {
  id: string | number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  rawStartTime?: string;
  status: string;
}

const Appointments = () => {
  const navigate = useNavigate();
  const { user, initialized } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const list = await getAppointments();
        const mapped = list.map((a) => ({
          id: a.id || "",
          doctor: a.doctor,
          specialty: a.specialty,
              date: a.startTime.split("T")[0],
              time: new Date(a.startTime).toLocaleTimeString(),
              rawStartTime: a.startTime,
          status: a.status || "",
        }));
        setAppointments(mapped);
      } catch (e) {
        const savedAppointments = localStorage.getItem("appointments");
        if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
      }
    };

    load();
  }, [navigate, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "Completed":
        return "bg-primary/20 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">Manage and view all your healthcare appointments</p>
        </div>

        <div className="mb-6 flex gap-4">
          <Button onClick={() => navigate("/dashboard")}>Book New Appointment</Button>
          <Button variant="outline">Filter by Status</Button>
        </div>

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-6">
                Book your first appointment to get started with your healthcare journey
              </p>
              <Button onClick={() => navigate("/dashboard")}>Book Appointment</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{appointment.doctor}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{appointment.specialty}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Medical Center, 123 Healthcare Blvd</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                      <div className="pt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // open reschedule dialog prefilled with current date/time using rawStartTime
                        setSelectedAppt(appointment);
                        try {
                          const dt = new Date(appointment.rawStartTime || `${appointment.date}T00:00:00Z`);
                          // date input expects yyyy-mm-dd
                          const isoDate = dt.toISOString().split('T')[0];
                          // time input expects HH:MM
                          const hhmm = dt.toISOString().split('T')[1].slice(0,5);
                          setNewDate(isoDate);
                          setNewTime(hhmm);
                        } catch (e) {
                          setNewDate("");
                          setNewTime("");
                        }
                        setRescheduleOpen(true);
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button variant="destructive" className="flex-1">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Reschedule Dialog */}
        <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <Label htmlFor="resched-date">New date</Label>
                <Input id="resched-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="resched-time">New time</Label>
                <Input id="resched-time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
              <Button
                type="button"
                disabled={rescheduling}
                onClick={async () => {
                  if (!selectedAppt) return toast.error('No appointment selected');
                  if (!newDate || !newTime) return toast.error('Please provide a date and time'); // validation
                  setRescheduling(true);
                  try {
                    const iso = new Date(`${newDate}T${newTime}`).toISOString();
                    // fetch current appointment to preserve required fields such as status
                    const existing = await getAppointment(Number(selectedAppt.id));
                    const dto = {
                      ...existing,
                      startTime: iso,
                    } as any;
                    const saved = await updateAppointment(Number(selectedAppt.id), dto);
                    // update local list
                    setAppointments((prev) => prev.map((a) => a.id === selectedAppt.id ? ({
                      ...a,
                      date: saved.startTime.split('T')[0],
                      time: new Date(saved.startTime).toLocaleTimeString(),
                      rawStartTime: saved.startTime,
                    }) : a));
                    setRescheduleOpen(false);
                    setSelectedAppt(null);
                    setNewDate("");
                    setNewTime("");
                    toast.success('Appointment rescheduled');
                  } catch (err: any) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    toast.error(err?.message || 'Failed to reschedule');
                  } finally {
                    setRescheduling(false);
                  }
                }}
              >
                {rescheduling ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Appointments;
