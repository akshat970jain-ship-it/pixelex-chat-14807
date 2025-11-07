import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IncomingCallModal } from "@/components/IncomingCallModal";

const IncomingCall = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);
  
  const callerName = searchParams.get("name") || "Unknown Caller";
  const callerAvatar = searchParams.get("avatar") || undefined;
  const callType = (searchParams.get("type") || "audio") as "audio" | "video";

  const handleAccept = () => {
    setIsOpen(false);
    // Navigate to call page
    navigate(`/call?type=${callType}&name=${encodeURIComponent(callerName)}&avatar=${encodeURIComponent(callerAvatar || '')}`);
  };

  const handleReject = () => {
    setIsOpen(false);
    setTimeout(() => navigate(-1), 300);
  };

  return (
    <IncomingCallModal
      isOpen={isOpen}
      callerName={callerName}
      callerAvatar={callerAvatar}
      callType={callType}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
};

export default IncomingCall;
