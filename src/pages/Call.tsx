import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, MonitorUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useCallHistory } from "@/hooks/useCallHistory";
import { useToast } from "@/hooks/use-toast";

const Call = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "audio";
  const name = searchParams.get("name") || "Unknown";
  const avatar = searchParams.get("avatar");
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === "audio");
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callRecordId, setCallRecordId] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const { 
    localStream, 
    remoteStream, 
    isScreenSharing, 
    initializeLocalStream, 
    createPeerConnection,
    addLocalStream,
    toggleScreenShare, 
    cleanup 
  } = useWebRTC();
  
  const { createCallRecord, updateCallRecord } = useCallHistory();

  useEffect(() => {
    const initCall = async () => {
      try {
        // Initialize WebRTC
        const stream = await initializeLocalStream(type === "video");
        const pc = createPeerConnection();
        addLocalStream(stream);
        
        // Create call history record
        createCallRecord({
          other_participant_name: name,
          other_participant_avatar: avatar || undefined,
          call_type: type as "audio" | "video",
          duration: 0,
          status: "ongoing",
          direction: "outgoing",
        });
        
        // Simulate connection
        setTimeout(() => setIsConnecting(false), 2000);
      } catch (error) {
        console.error("Error initializing call:", error);
        toast({
          title: "Call Failed",
          description: "Failed to initialize call",
          variant: "destructive",
        });
        navigate(-1);
      }
    };

    initCall();
    
    // Duration counter
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      cleanup();
      
      // Update call record on cleanup
      if (callRecordId) {
        updateCallRecord({
          id: callRecordId,
          duration: callDuration,
          status: "completed",
        });
      }
    };
  }, []);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (callRecordId) {
      updateCallRecord({
        id: callRecordId,
        duration: callDuration,
        status: "completed",
      });
    }
    cleanup();
    navigate(-1);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Video/Avatar Area */}
      <div className="flex-1 relative overflow-hidden">
        {type === "video" && !isVideoOff ? (
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!remoteStream && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-muted-foreground">
                <Video className="w-24 h-24 opacity-20" />
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary/20">
              {avatar && <AvatarImage src={avatar} alt={name} />}
              <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">{name}</h2>
              <p className="text-muted-foreground mt-2">
                {isConnecting ? "Connecting..." : formatDuration(callDuration)}
              </p>
            </div>
          </div>
        )}

        {/* Local video preview for video calls */}
        {type === "video" && (
          <div className={cn(
            "absolute top-4 right-4 w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72 rounded-lg overflow-hidden border-2 border-border shadow-lg transition-all",
            isVideoOff && "hidden"
          )}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            {isScreenSharing && (
              <div className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs">
                Sharing Screen
              </div>
            )}
          </div>
        )}

        {/* Status overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isMuted && (
            <div className="bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <MicOff className="w-4 h-4" />
              Muted
            </div>
          )}
          {isVideoOff && type === "video" && (
            <div className="bg-muted/90 text-muted-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <VideoOff className="w-4 h-4" />
              Camera Off
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 sm:p-6 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* Mute */}
          <Button
            size="lg"
            variant={isMuted ? "destructive" : "secondary"}
            className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          </Button>

          {/* Video toggle (only for video calls) */}
          {type === "video" && (
            <>
              <Button
                size="lg"
                variant={isVideoOff ? "destructive" : "secondary"}
                className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
              </Button>

              {/* Screen share */}
              <Button
                size="lg"
                variant={isScreenSharing ? "default" : "secondary"}
                className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
                onClick={toggleScreenShare}
              >
                <MonitorUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </>
          )}

          {/* Speaker */}
          <Button
            size="lg"
            variant={isSpeakerOff ? "destructive" : "secondary"}
            className="rounded-full w-12 h-12 sm:w-14 sm:h-14"
            onClick={() => setIsSpeakerOff(!isSpeakerOff)}
          >
            {isSpeakerOff ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          </Button>

          {/* End call */}
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full w-14 h-14 sm:w-16 sm:h-16 ml-2 sm:ml-4"
            onClick={handleEndCall}
          >
            <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Call;
