
"use client";

import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, UserPlus, MessageSquare } from 'lucide-react';

interface CallControlsProps {
  onHangUp: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export function CallControls({ 
  onHangUp, 
  isMuted, 
  isVideoOff, 
  onToggleMute, 
  onToggleVideo 
}: CallControlsProps) {

  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-colors duration-150"
        onClick={onToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-colors duration-150"
        onClick={onToggleVideo}
        aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
      >
        {isVideoOff ? <VideoOff className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" /> : <Video className="h-5 w-5 sm:h-6 sm:w-6" />}
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-colors duration-150"
        aria-label="Speaker"
        disabled // Placeholder
      >
        <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-colors duration-150"
        aria-label="Add participant"
        disabled // Placeholder
      >
        <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
       <Button 
        variant="outline" 
        size="icon" 
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-colors duration-150"
        aria-label="Chat"
        disabled // Placeholder
      >
        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      <Button 
        variant="destructive" 
        size="icon" 
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-destructive hover:bg-destructive/90 transition-colors duration-150"
        onClick={onHangUp}
        aria-label="Hang up"
      >
        <PhoneOff className="h-6 w-6 sm:h-7 sm:w-7" />
      </Button>
    </div>
  );
}
