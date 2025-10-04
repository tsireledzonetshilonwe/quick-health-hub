import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const ProfileButton = () => {
  const { user } = useAuth();
  if (!user) return null;

  const initials = (user.fullName || "U").split(" ").map((s) => s[0]).slice(0,2).join("");
  const avatar = (user as any).avatar as string | undefined;

  return (
    <Link to="/profile" className="fixed right-6 bottom-6 z-50">
      <div className="h-14 w-14 rounded-full bg-white/5 ring-1 ring-border shadow-lg flex items-center justify-center hover:scale-105 transform transition">
        <Avatar>
          {avatar ? <AvatarImage src={avatar} alt={user.fullName || "User"} /> : <AvatarImage src="/placeholder.svg" alt={user.fullName || "User"} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </Link>
  );
};

export default ProfileButton;
