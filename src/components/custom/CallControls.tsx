"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, UserPlus, MessageSquare } from 'lucide-react';

interface CallControlsProps {
  onHangUp: () => void;
  // Add other control handlers as needed
}

export function CallControls({ onHangUp }: CallControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="flex justify-center items-center space-x-3 p-4 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-12 w-12 rounded-full transition-colors duration-150"
        onClick={() => setIsMuted(!isMuted)}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff className="h-6 w-6 text-red-500" /> : <Mic className="h-6 w-6" />}
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-12 w-12 rounded-full transition-colors duration-150"
        onClick={() => setIsVideoOff(!isVideoOff)}
        aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
      >
        {isVideoOff ? <VideoOff className="h-6 w-6 text-red-500" /> : <Video className="h-6 w-6" />}
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-12 w-12 rounded-full transition-colors duration-150"
        aria-label="Speaker"
      >
        <Volume2 className="h-6 w-6" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-12 w-12 rounded-full transition-colors duration-150"
        aria-label="Add participant"
      >
        <UserPlus className="h-6 w-6" />
      </Button>
       <Button 
        variant="outline" 
        size="icon" 
        className="h-12 w-12 rounded-full transition-colors duration-150"
        aria-label="Chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      <Button 
        variant="destructive" 
        size="icon" 
        className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 transition-colors duration-150"
        onClick={onHangUp}
        aria-label="Hang up"
      >
        <PhoneOff className="h-7 w-7" />
      </Button>
    </div>
  );
}
