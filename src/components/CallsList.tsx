import { Phone, Video, PhoneMissed } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCallHistory } from "@/hooks/useCallHistory";
import { format } from "date-fns";

const mockCalls = [
  {
    id: 1,
    name: "Jane Cooper",
    time: "Today at 12:30 PM",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    type: "video" as const,
    incoming: true,
    missed: false,
  },
  {
    id: 2,
    name: "Jenny Wilson",
    time: "Today at 11:00 AM",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jenny",
    type: "voice" as const,
    incoming: false,
    missed: false,
  },
  {
    id: 3,
    name: "Bessie Cooper",
    time: "Yesterday at 10:45 PM",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bessie",
    type: "voice" as const,
    incoming: true,
    missed: true,
  },
  {
    id: 4,
    name: "Guy Hawkins",
    time: "Yesterday at 09:30 AM",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guy",
    type: "video" as const,
    incoming: false,
    missed: false,
  },
];

export const CallsList = () => {
  const navigate = useNavigate();
  const { callHistory, isLoading } = useCallHistory();

  const handleCall = (call: { type: string; name: string; avatar: string }) => {
    navigate(`/call?type=${call.type}&name=${encodeURIComponent(call.name)}&avatar=${encodeURIComponent(call.avatar)}`);
  };

  // Demo incoming call button
  const handleTestIncomingCall = () => {
    navigate(`/incoming-call?type=video&name=Sarah Connor&avatar=${encodeURIComponent('https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah')}`);
  };

  // Use database history if available, fallback to mock data
  const calls = callHistory && callHistory.length > 0 ? callHistory.map(call => ({
    id: call.id,
    name: call.other_participant_name,
    time: format(new Date(call.created_at), 'MMM d, yyyy h:mm a'),
    avatar: call.other_participant_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${call.other_participant_name}`,
    type: call.call_type,
    incoming: call.direction === 'incoming',
    missed: call.status === 'missed',
  })) : mockCalls;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-sidebar-background">
        <h1 className="text-xl font-semibold text-foreground">Calls</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleTestIncomingCall}
          className="text-xs"
        >
          Test Call
        </Button>
      </header>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading call history...</p>
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Phone className="w-12 h-12 text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">No call history yet</p>
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-2">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarImage src={call.avatar} />
                  <AvatarFallback>{call.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{call.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {call.missed ? (
                      <PhoneMissed className="w-3 h-3 text-destructive flex-shrink-0" />
                    ) : call.type === "video" ? (
                      <Video className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <Phone className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className={cn(call.missed && "text-destructive", "truncate")}>
                      {call.incoming ? "Incoming" : "Outgoing"}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline truncate">{call.time}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary/10 flex-shrink-0"
                  onClick={() => handleCall(call)}
                >
                  {call.type === "video" ? (
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
