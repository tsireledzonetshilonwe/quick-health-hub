import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, FileText, Clock, Activity, Plus, Bell, User } from "lucide-react";
import { toast } from "sonner";
import { getAppointments, createAppointment, AppointmentDTO } from "@/lib/api";
import { getDoctors, DoctorDTO } from "@/lib/api";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    specialty: "",
    date: "",
    time: "",
  });
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);

  const { user, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const list = await getAppointments();
        // map backend AppointmentDTO to local Appointment format
        const mapped = list.map((a) => ({
          id: a.id || "",
          doctor: a.doctor,
          specialty: a.specialty,
          date: a.startTime.split("T")[0],
          time: new Date(a.startTime).toLocaleTimeString(),
          status: a.status || "",
        }));
        setAppointments(mapped);
      } catch (err: any) {
        // fallback to localStorage demo data
        const savedAppointments = localStorage.getItem("appointments");
        if (savedAppointments) {
          setAppointments(JSON.parse(savedAppointments));
        }
      }
    };

    load();
  }, [navigate, user]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const list = await getDoctors();
        setDoctors(list);
      } catch (e) {
        // fallback list
        setDoctors([
          { id: "1", fullName: "Dr. Sarah Johnson", specialty: "Cardiology" },
          { id: "2", fullName: "Dr. Michael Chen", specialty: "General Medicine" },
          { id: "3", fullName: "Dr. Emily Roberts", specialty: "Pediatrics" },
        ]);
      }
    };

    loadDoctors();
  }, []);

  const handleQuickBook = () => {
    if (!newAppointment.doctorId || !newAppointment.specialty || !newAppointment.date || !newAppointment.time) {
      toast.error("Please fill in all fields");
      return;
    }

    (async () => {
      try {
        const selectedDoctor = doctors.find(d => d.id === newAppointment.doctorId) || null;
        const dto: AppointmentDTO = {
          doctor: selectedDoctor?.fullName || newAppointment.doctorId || "",
          specialty: newAppointment.specialty,
          startTime: new Date(`${newAppointment.date}T${newAppointment.time}`).toISOString(),
          reason: "",
        };
        if ((import.meta.env as any).VITE_API_DEBUG) {
          // eslint-disable-next-line no-console
          console.debug("Creating appointment payload:", dto);
        }
        const saved = await createAppointment(dto);
        const entry: Appointment = {
          id: saved.id || Date.now().toString(),
          doctor: saved.doctor,
          specialty: saved.specialty,
          date: saved.startTime.split("T")[0],
          time: new Date(saved.startTime).toLocaleTimeString(),
          status: saved.status || "Pending",
        };
        const updatedAppointments = [...appointments, entry];
        setAppointments(updatedAppointments);
        toast.success("Appointment booked successfully!");
        setQuickBookOpen(false);
  setNewAppointment({ doctorId: "", specialty: "", date: "", time: "" });
      } catch (err: any) {
        toast.error(err?.message || "Failed to book appointment");
      }
    })();
  };

  const userName = user?.fullName || "User";

  const stats = [
    { label: "Appointments", value: appointments.length.toString(), icon: Calendar, color: "text-primary" },
    { label: "Prescriptions", value: "5", icon: FileText, color: "text-secondary" },
    { label: "Upcoming", value: appointments.filter(a => a.status === "Confirmed").length.toString(), icon: Clock, color: "text-accent" },
    { label: "Reports", value: "12", icon: Activity, color: "text-destructive" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here's an overview of your healthcare journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Dialog open={quickBookOpen} onOpenChange={setQuickBookOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Quick Book
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                    <DialogDescription>
                      Schedule an appointment with one of our healthcare professionals
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Doctor</Label>
                        <Select value={newAppointment.doctorId} onValueChange={(val) => setNewAppointment({ ...newAppointment, doctorId: val })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((d) => (
                              <SelectItem key={d.id || d.fullName} value={d.id || d.fullName}>
                                {d.fullName} {d.specialty ? `— ${d.specialty}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Select
                        value={newAppointment.specialty}
                        onValueChange={(value) => setNewAppointment({ ...newAppointment, specialty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Medicine">General Medicine</SelectItem>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="Dermatology">Dermatology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setQuickBookOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleQuickBook}>Book Appointment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{appointment.doctor}</div>
                          <div className="text-sm text-muted-foreground">{appointment.specialty}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{appointment.date}</div>
                        <div className="text-sm text-muted-foreground">{appointment.time}</div>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "Confirmed"
                              ? "bg-secondary/20 text-secondary"
                              : "bg-yellow-500/20 text-yellow-700"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/appointments")}>
                <Calendar className="mr-2 h-4 w-4" />
                View All Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/prescriptions")}>
                <FileText className="mr-2 h-4 w-4" />
                My Prescriptions
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { text: "Appointment confirmed with Dr. Johnson", time: "2 hours ago" },
                  { text: "Prescription renewed for Blood Pressure", time: "1 day ago" },
                  { text: "Lab results uploaded", time: "3 days ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
