import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { ChatList } from "./ChatList";
import { ChatProvider } from "@/contexts/ChatContext";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileDrawer } from "./MobileDrawer";
import { CallsList } from "./CallsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ChatLayoutProps = {
  isGuest?: boolean;
};

type MobileView = "list" | "chat" | "settings" | "calls";

export const ChatLayout = ({ isGuest = false }: ChatLayoutProps) => {
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [activeTab, setActiveTab] = useState<"chats" | "calls" | "settings">("chats");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleTabChange = (tab: "chats" | "calls" | "settings") => {
    setActiveTab(tab);
    if (tab === "settings") {
      setMobileView("settings");
    } else if (tab === "calls") {
      setMobileView("calls");
    } else {
      setMobileView("list");
    }
  };

  return (
    <ChatProvider isGuest={isGuest}>
      <div className="flex h-screen w-full bg-background overflow-hidden overflow-x-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:flex w-full">
          <Sidebar isGuest={isGuest} />
          <ChatArea />
          <ChatList />
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="flex md:hidden flex-col w-full pb-16">
          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            isGuest={isGuest}
          />

          {/* Chat List View */}
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-300 ease-out",
              mobileView === "list" ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <ChatList
              isMobile={true}
              onMenuClick={() => setIsDrawerOpen(true)}
              onChatSelect={() => setMobileView("chat")}
            />
          </div>

          {/* Chat View */}
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-300 ease-out",
              mobileView === "chat" ? "translate-x-0" : "translate-x-full"
            )}
          >
            <ChatArea
              isMobile={true}
              onBack={() => setMobileView("list")}
              onMenuClick={() => setIsDrawerOpen(true)}
            />
          </div>

          {/* Calls View */}
          <div
            className={cn(
              "absolute inset-0 bg-background transition-opacity duration-300",
              mobileView === "calls" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <CallsList />
          </div>

          {/* Settings View */}
          <div
            className={cn(
              "absolute inset-0 bg-background transition-opacity duration-300",
              mobileView === "settings" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <Sidebar isGuest={isGuest} />
          </div>

          <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    </ChatProvider>
  );
};
