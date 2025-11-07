import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageCircle, Phone, Video, MoreVertical } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";

interface ProfileViewProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileView = ({ user, open, onOpenChange }: ProfileViewProps) => {
  const haptics = useHaptics();

  if (!user) return null;

  const handleAction = (action: string) => {
    haptics.medium();
    console.log(`Action: ${action} for user:`, user.username);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <div className="p-1 rounded-full bg-gradient-to-tr from-primary via-accent to-primary">
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-3xl">{user.full_name[0]}</AvatarFallback>
              </Avatar>
            </div>
            {user.status === 'online' && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-background" />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground">{user.full_name}</h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {user.status}
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={() => handleAction('message')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Message
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleAction('call')}
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleAction('video')}
            >
              <Video className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleAction('more')}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>

          <div className="w-full mt-4 p-4 rounded-lg bg-muted">
            <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
            <p className="text-sm text-muted-foreground">
              Hey there! I'm using this chat app. Feel free to message me anytime!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
