import { Menu } from "lucide-react";
import { Button } from "./ui/button";

type MobileChatListHeaderProps = {
  onMenuClick: () => void;
};

export const MobileChatListHeader = ({ onMenuClick }: MobileChatListHeaderProps) => {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-sidebar-background md:hidden">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-foreground hover:bg-muted">
          <Menu className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Chats</h1>
      </div>
    </header>
  );
};
