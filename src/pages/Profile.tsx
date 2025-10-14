import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserDTO } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const { user, refreshProfile, updateProfile, initialized } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<UserDTO>({ fullName: user?.fullName || "", email: user?.email || "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate("/login");
      return;
    }
    // Use local auth state as the profile source since backend doesn't expose /api/auth/me
    setProfile({ fullName: user.fullName || "", email: user.email || "", phone: (user as any).phone });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName: profile.fullName || "", phone: profile.phone });
      toast.success("Profile updated (saved locally)");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  const triggerFile = () => fileRef.current?.click();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <Label>Avatar</Label>
                      <div className="mt-2 flex items-center gap-4">
                      <Avatar>
                        {profile.avatar ? (
                          <AvatarImage src={profile.avatar} alt={profile.fullName || "User"} />
                        ) : (
                          <AvatarFallback>{(profile.fullName || "U").slice(0, 1)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="space-y-2">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" />
                        <div className="flex gap-2">
                          <Button variant="outline" disabled>Upload (unsupported)</Button>
                          <Button variant="ghost" disabled>Remove (unsupported)</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <Label>Full name</Label>
                    <Input value={profile.fullName || ""} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                    <div className="mt-3 grid grid-cols-1 gap-3">
                      <div>
                        <Label>Email</Label>
                        <Input value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
                
                
              </div>
              <div className="flex justify-end">
                <Button disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
