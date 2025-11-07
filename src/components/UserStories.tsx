import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { mockUsers } from "@/data/mockData";
import { useState } from "react";
import { ProfileView } from "./ProfileView";
import { useHaptics } from "@/hooks/useHaptics";

export const UserStories = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const haptics = useHaptics();

  const handleUserClick = (user: any) => {
    haptics.light();
    setSelectedUser(user);
  };

  return (
    <>
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Stories</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {mockUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="flex-shrink-0 flex flex-col items-center gap-2 hover-scale"
            >
              <div className="relative">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary via-accent to-primary">
                  <Avatar className="w-16 h-16 border-2 border-background">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                {user.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <span className="text-xs text-foreground truncate max-w-[70px]">
                {user.full_name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ProfileView 
        user={selectedUser} 
        open={!!selectedUser} 
        onOpenChange={(open) => !open && setSelectedUser(null)} 
      />
    </>
  );
};
