import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Activity className="h-6 w-6 text-primary" />
              <span>HealthCare</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted partner in health management and medical appointments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/appointments" className="text-muted-foreground hover:text-foreground transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/prescriptions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Prescriptions
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>General Medicine</li>
              <li>Cardiology</li>
              <li>Pediatrics</li>
              <li>Orthopedics</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@healthcare.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Medical Center Dr</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HealthCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
