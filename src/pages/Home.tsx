import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, FileText, Users, Clock, Heart, Shield, Award, Stethoscope } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

const Home = () => {
  const stats = [
    { label: "Patients Served", value: "50K+", icon: Users },
    { label: "Expert Doctors", value: "200+", icon: Stethoscope },
    { label: "Years Experience", value: "25+", icon: Award },
    { label: "Success Rate", value: "98%", icon: Heart },
  ];

  const services = [
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book appointments with top healthcare providers instantly.",
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Access and manage your prescriptions securely online.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock medical support whenever you need it.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is encrypted and completely confidential.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container relative py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Health,
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {" "}Our Priority
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Experience seamless healthcare management. Book appointments, manage prescriptions, 
                and connect with top medical professionals - all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="hero" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/appointments">Book Appointment</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Healthcare professionals"
                className="relative rounded-3xl shadow-2xl w-full object-cover aspect-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center space-y-2">
                  <Icon className="h-8 w-8 mx-auto text-primary" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed for your convenience and well-being
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="pt-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Modern Healthcare at Your Fingertips
              </h2>
              <p className="text-muted-foreground text-lg">
                Our platform combines cutting-edge technology with compassionate care to deliver 
                an exceptional healthcare experience.
              </p>
              <ul className="space-y-4">
                {[
                  "Instant appointment booking with real-time availability",
                  "Secure digital health records and prescriptions",
                  "Video consultations with certified physicians",
                  "Automated reminders for appointments and medications"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Heart className="h-3 w-3 text-secondary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">Join Today</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "15min", label: "Avg. Wait Time" },
                { number: "4.9★", label: "Patient Rating" },
                { number: "100%", label: "HIPAA Compliant" },
                { number: "24/7", label: "Available" },
              ].map((item, index) => (
                <Card key={index} className="text-center p-6">
                  <CardContent className="p-0 space-y-2">
                    <div className="text-3xl font-bold text-primary">{item.number}</div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
            <CardContent className="py-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Join thousands of satisfied patients managing their health the modern way
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/signup">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
