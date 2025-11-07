import { useEffect, useState } from "react";
import { Settings, Bell, Lock, Languages, Moon, Camera, LogOut, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Profile = {
  full_name: string;
  username: string;
  status: string | null;
  avatar_url: string | null;
};

type SidebarProps = {
  isGuest?: boolean;
};

export const Sidebar = ({ isGuest = false }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const activeSection = location.pathname === "/settings" ? searchParams.get("section") : null;

  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // For now, just use basic user info since we don't have profiles table
        setProfile({
          full_name: user.email?.split('@')[0] || 'User',
          username: user.email?.split('@')[0] || 'user',
          status: 'Online',
          avatar_url: null
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [isGuest]);

  const handleLogout = async () => {
    if (isGuest) {
      localStorage.removeItem("guestMode");
      toast({
        title: "Guest session ended",
        description: "Redirecting to login...",
      });
      navigate("/auth");
      return;
    }

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth");
    }
  };

  const handleLogin = () => {
    localStorage.removeItem("guestMode");
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-64 bg-sidebar-background border-r border-border flex flex-col">
      {/* User Profile */}
      <div className="p-6 border-b border-border">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={isGuest 
                ? "https://api.dicebear.com/7.x/avataaars/svg?seed=guest" 
                : profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`
              } 
            />
            <AvatarFallback>
              {loading ? "..." : isGuest ? "GU" : profile ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          {!isGuest && (
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          )}
        </div>
        <h2 className="text-center text-lg font-semibold text-foreground">
          {loading ? "Loading..." : isGuest ? "Guest User" : profile?.full_name || "User"}
        </h2>
        <p className="text-center text-sm text-muted-foreground">
          {isGuest ? "Try the app without signing up" : (loading ? "" : profile?.status || "Online")}
        </p>
        {isGuest && (
          <Button 
            onClick={handleLogin}
            className="w-full mt-4"
            size="sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Create Account
          </Button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <button 
          onClick={() => navigate("/settings?section=general")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            activeSection === "general"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">General Settings</span>
        </button>
        <button 
          onClick={() => navigate("/settings?section=notifications")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            activeSection === "notifications"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-sm">Notifications</span>
        </button>
        <button 
          onClick={() => navigate("/settings?section=privacy")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            activeSection === "privacy"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Lock className="w-5 h-5" />
          <span className="text-sm">Privacy and Security</span>
        </button>
        <button 
          onClick={() => navigate("/settings?section=language")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            activeSection === "language"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Languages className="w-5 h-5" />
          <span className="text-sm">Language</span>
        </button>
        <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-foreground">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5" />
            <span className="text-sm">Dark Mode</span>
          </div>
          <Switch 
            checked={theme === "dark"} 
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">{isGuest ? "Exit Guest Mode" : "Log Out"}</span>
        </button>
      </nav>

      {/* Premium Card */}
      <div className="m-4 p-4 bg-card border border-border rounded-2xl">
        <h3 className="font-semibold text-foreground">
          Mychats <span className="text-primary">Premium</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Experience enhanced features and improved accessibility.
        </p>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Buy Now
        </Button>
      </div>
    </aside>
  );
};
