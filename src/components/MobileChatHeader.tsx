import { ArrowLeft, Menu, Phone, Video, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

type MobileChatHeaderProps = {
  onBack: () => void;
  onMenuClick: () => void;
  otherParticipant?: {
    full_name?: string;
    username?: string;
    avatar_url?: string | null;
    status?: string | null;
  } | null;
};

export const MobileChatHeader = ({ onBack, onMenuClick, otherParticipant }: MobileChatHeaderProps) => {
  const navigate = useNavigate();

  const handleCall = (type: "audio" | "video") => {
    const name = otherParticipant?.full_name || otherParticipant?.username || 'Unknown User';
    const avatar = otherParticipant?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.username}`;
    navigate(`/call?type=${type}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}`);
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-sidebar-background md:hidden">
      <div className="flex items-center gap-3 flex-1">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarImage src={otherParticipant?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.username}`} />
          <AvatarFallback>{otherParticipant?.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm">
            {otherParticipant?.full_name || otherParticipant?.username || 'Unknown User'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {otherParticipant?.status || 'offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted" onClick={() => handleCall("audio")}>
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted" onClick={() => handleCall("video")}>
          <Video className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-foreground hover:bg-muted">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
