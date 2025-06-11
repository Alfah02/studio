
"use client";

import { PageTitle } from "@/components/custom/PageTitle";
import { DialPad } from "@/components/custom/DialPad";
import { CallControls } from "@/components/custom/CallControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PhoneCall, UserCircle2, PhoneIncoming as PhoneIncomingIcon, PhoneOff, Video as VideoIcon, Mic, ServerCrash, ListX, Clock, Video, Users, History, Settings, Ear, EarOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSip } from "@/contexts/SipContext";
import { useToast } from "@/hooks/use-toast";

export default function CallsPage() {
  const { toast } = useToast();
  const { 
    makeCall, 
    hangupCall, 
    answerCall, 
    activeCall, 
    localStream, 
    remoteStream, 
    connectionStatus,
    requestCameraPermission,
    hasCameraPermission,
    isMuted,
    isVideoEnabled,
    toggleMute,
    toggleVideo
  } = useSip();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [callDuration, setCallDuration] = useState(0);
  const callDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (hasCameraPermission === null) { // Only request if not already determined
        requestCameraPermission();
    }
  }, [requestCameraPermission, hasCameraPermission]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    } else if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null; // Clear if remote stream is removed
    }
  }, [remoteStream]);

  useEffect(() => {
    if (activeCall && activeCall.status === 'answered') {
      setCallDuration(0); // Reset duration
      callDurationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
        callDurationIntervalRef.current = null;
      }
      setCallDuration(0);
    }
    return () => {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
    };
  }, [activeCall]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleDial = (number: string) => {
    if (connectionStatus !== 'registered') {
      toast({ title: "Not Registered", description: "Please connect to SIP server in Settings first.", variant: "destructive"});
      return;
    }
    if (!hasCameraPermission) {
        toast({ title: "Permissions Required", description: "Camera and microphone access needed to make calls.", variant: "destructive" });
        requestCameraPermission(); // Prompt again
        return;
    }
    makeCall(number);
  };

  const handleLocalHangUp = () => {
    hangupCall();
  };
  
  const handleAnswer = () => {
    if (!hasCameraPermission) {
        toast({ title: "Permissions Required", description: "Camera and microphone access needed to answer calls.", variant: "destructive" });
        requestCameraPermission();
        return;
    }
    answerCall();
  }

  const renderConnectionStatus = () => {
    if (connectionStatus !== 'registered' && connectionStatus !== 'connected') { // 'connected' means trying to register
      return (
        <Alert variant="destructive" className="mb-4">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>SIP Server Not Connected</AlertTitle>
          <AlertDescription>
            Please go to Settings to configure and connect to your SIP server to make and receive calls. Current status: {connectionStatus}.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  if (activeCall) {
    return (
      <div className="space-y-6">
        <PageTitle>Ongoing Call</PageTitle>
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PhoneCall className="text-accent" />
              <span>
                {activeCall.direction === 'outgoing' ? 'Calling ' : 'Incoming call from '} 
                {activeCall.remoteIdentity} - <span className="capitalize">{activeCall.status}</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
                {!remoteStream && <UserCircle2 size={96} className="text-foreground/30 absolute" />}
                <p className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">Remote Video</p>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                 <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                 {!localStream && hasCameraPermission && <Mic size={96} className="text-foreground/30 absolute" />}
                 {hasCameraPermission === false && (
                    <Alert variant="destructive" className="absolute inset-2 flex flex-col items-center justify-center text-center">
                        <VideoIcon className="h-8 w-8 mb-2" />
                        <AlertTitle>Camera/Mic Access Denied</AlertTitle>
                        <AlertDescription>Enable permissions to show local video.</AlertDescription>
                    </Alert>
                 )}
                <p className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">Local Video</p>
                 {activeCall.status === 'answered' && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 text-xs rounded flex items-center">
                        <Clock size={14} className="mr-1" /> {formatDuration(callDuration)}
                    </div>
                )}
              </div>
            </div>
            
            {activeCall.direction === 'incoming' && activeCall.status === 'ringing' && (
              <div className="flex justify-center space-x-4 my-4">
                <Button onClick={handleAnswer} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
                  <PhoneIncomingIcon className="mr-2 h-5 w-5" /> Answer
                </Button>
                <Button onClick={handleLocalHangUp} variant="destructive" className="px-6 py-3">
                  <PhoneOff className="mr-2 h-5 w-5" /> Decline
                </Button>
              </div>
            )}
            <CallControls 
              onHangUp={handleLocalHangUp} 
              isMuted={isMuted}
              isVideoOff={!isVideoEnabled}
              onToggleMute={toggleMute}
              onToggleVideo={toggleVideo}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle>Calls</PageTitle>
      {renderConnectionStatus()}

      {hasCameraPermission === false && (
         <Alert variant="destructive" className="mb-4">
            <VideoIcon className="h-4 w-4" />
            <AlertTitle>Camera and Microphone Access Denied</AlertTitle>
            <AlertDescription>
                VidApp Connect needs access to your camera and microphone to make and receive video calls. 
                Please enable these permissions in your browser settings and refresh the page.
            </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><PhoneCall className="mr-2" />Start a New Call</CardTitle>
          </CardHeader>
          <CardContent>
            <DialPad onDial={handleDial} disabled={connectionStatus !== 'registered' || hasCameraPermission === false} />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><History className="mr-2" />Recent Calls / Favorites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[200px] flex flex-col items-center justify-center text-center">
            <ListX size={48} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No recent calls to display.</p>
            <p className="text-sm text-muted-foreground">Your recent calls and favorite contacts will appear here.</p>
            <Button variant="link" onClick={() => toast({ title: "Feature Info", description: "Recent calls and favorites will appear here once you make/receive calls and mark contacts as favorites."})}>Learn More</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
