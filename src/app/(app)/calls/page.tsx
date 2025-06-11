
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
    if (hasCameraPermission === null) {
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
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (activeCall && activeCall.status === 'answered') {
      setCallDuration(0); 
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
      toast({ title: "Non Enregistré", description: "Veuillez d'abord vous connecter au serveur SIP dans les Paramètres.", variant: "destructive"});
      return;
    }
    if (!hasCameraPermission) {
        toast({ title: "Permissions Requises", description: "L'accès à la caméra et au microphone est nécessaire pour passer des appels.", variant: "destructive" });
        requestCameraPermission(); 
        return;
    }
    makeCall(number);
  };

  const handleLocalHangUp = () => {
    hangupCall();
  };
  
  const handleAnswer = async () => {
    if (!hasCameraPermission) {
        toast({ title: "Permissions Requises", description: "L'accès à la caméra et au microphone est nécessaire pour répondre aux appels.", variant: "destructive" });
        await requestCameraPermission();
        if(!hasCameraPermission) return;
    }
    await answerCall();
  }

  const renderConnectionStatus = () => {
    if (connectionStatus !== 'registered' && connectionStatus !== 'connected') {
      return (
        <Alert variant="destructive" className="mb-4">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Serveur SIP Non Connecté</AlertTitle>
          <AlertDescription>
            Veuillez aller dans Paramètres pour configurer et vous connecter à votre serveur SIP pour passer et recevoir des appels. Statut actuel : {connectionStatus}.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  if (activeCall) {
    return (
      <div className="space-y-6">
        <PageTitle>Appel en Cours</PageTitle>
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PhoneCall className="text-accent" />
              <span>
                {activeCall.direction === 'outgoing' ? 'Appel de ' : 'Appel entrant de '} 
                {activeCall.remoteIdentity} - <span className="capitalize">{activeCall.status}</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
                {!remoteStream && <UserCircle2 size={96} className="text-foreground/30 absolute" />}
                <p className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">Vidéo Distante</p>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                 <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                 {!localStream && hasCameraPermission && <Mic size={96} className="text-foreground/30 absolute" />}
                 {hasCameraPermission === false && (
                    <Alert variant="destructive" className="absolute inset-2 flex flex-col items-center justify-center text-center">
                        <VideoIcon className="h-8 w-8 mb-2" />
                        <AlertTitle>Accès Caméra/Micro Refusé</AlertTitle>
                        <AlertDescription>Activez les permissions pour afficher la vidéo locale.</AlertDescription>
                    </Alert>
                 )}
                <p className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">Vidéo Locale</p>
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
                  <PhoneIncomingIcon className="mr-2 h-5 w-5" /> Répondre
                </Button>
                <Button onClick={handleLocalHangUp} variant="destructive" className="px-6 py-3">
                  <PhoneOff className="mr-2 h-5 w-5" /> Refuser
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
      <PageTitle>Appels</PageTitle>
      {renderConnectionStatus()}

      {hasCameraPermission === false && (
         <Alert variant="destructive" className="mb-4">
            <VideoIcon className="h-4 w-4" />
            <AlertTitle>Accès Caméra et Microphone Refusé</AlertTitle>
            <AlertDescription>
                VidApp Connect a besoin d'accès à votre caméra et microphone pour passer et recevoir des appels vidéo. 
                Veuillez activer ces permissions dans les paramètres de votre navigateur et rafraîchissez la page.
            </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><PhoneCall className="mr-2" />Démarrer un Nouvel Appel</CardTitle>
          </CardHeader>
          <CardContent>
            <DialPad onDial={handleDial} disabled={connectionStatus !== 'registered' || hasCameraPermission === false} />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><History className="mr-2" />Appels Récents / Favoris</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[200px] flex flex-col items-center justify-center text-center">
            <ListX size={48} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Aucun appel récent à afficher.</p>
            <p className="text-sm text-muted-foreground">Vos appels récents et contacts favoris apparaîtront ici.</p>
            <Button variant="link" onClick={() => toast({ title: "Info Fonctionnalité", description: "Les appels récents et favoris apparaîtront ici une fois que vous aurez passé/reçu des appels et marqué des contacts comme favoris."})}>En savoir plus</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
