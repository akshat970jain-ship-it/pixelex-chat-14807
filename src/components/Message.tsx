import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CheckCheck } from "lucide-react";

interface MessageProps {
  sender: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  avatar: string;
  isImage?: boolean;
  images?: string[];
}

export const Message = ({ sender, content, timestamp, isSent, avatar, isImage, images }: MessageProps) => {
  return (
    <div className={`flex gap-3 ${isSent ? 'flex-row-reverse' : ''}`}>
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={avatar} />
        <AvatarFallback>{sender[0]}</AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isSent && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{sender}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
        )}
        
        {isImage && images ? (
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Shared image ${idx + 1}`}
                className="w-48 h-36 object-cover rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className={`px-4 py-3 rounded-2xl ${
            isSent 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card text-card-foreground'
          }`}>
            <p className="text-sm">{content}</p>
          </div>
        )}
        
        {isSent && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{timestamp}</span>
            <CheckCheck className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};
