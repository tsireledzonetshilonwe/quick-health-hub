import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, UserProfileDTO, uploadAvatar } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const { user, refreshProfile, updateProfile, initialized } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<UserProfileDTO>({ fullName: user?.fullName, email: user?.email, phone: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!initialized) return;
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const p = await getProfile();
        setProfile(p);
      } catch (e) {
        // if backend missing, fallback to local user state
        if (user) setProfile({ fullName: user.fullName, email: user.email, phone: (user as any).phone, avatar: (user as any).avatar });
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName: profile.fullName || "", phone: profile.phone });
      toast.success("Profile updated");
      await refreshProfile();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPick = async (file?: File) => {
    if (!file) return;
    // show an immediate preview (optional)
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...(p || {}), avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // upload the file to the backend and replace avatar with returned URL
    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      setProfile((p) => ({ ...(p || {}), avatar: res.url }));
      toast.success("Avatar uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
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
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarPick(e.target.files?.[0])} />
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={triggerFile}>Upload</Button>
                          <Button variant="ghost" onClick={() => setProfile({ ...profile, avatar: undefined })}>Remove</Button>
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
