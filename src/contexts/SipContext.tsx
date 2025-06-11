
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type * as JsSIP from 'jssip';
import type { SipConfig, SipConnectionStatus, SipCall } from '@/lib/sip/types';
import { useToast } from "@/hooks/use-toast";

let JsSIPInstance: typeof JsSIP | null = null;
if (typeof window !== 'undefined') {
  import('jssip').then(module => {
    JsSIPInstance = module;
    // JsSIPInstance?.debug.enable('JsSIP:*'); 
  }).catch(err => console.error("Failed to load JsSIP", err));
}

interface SipContextState {
  ua: JsSIP.UA | null;
  connectionStatus: SipConnectionStatus;
  sipConfig: SipConfig | null;
  activeCall: SipCall | null; 
  hasCameraPermission: boolean | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

interface SipContextValue extends SipContextState {
  connectSip: (config: SipConfig) => Promise<void>;
  disconnectSip: () => void;
  makeCall: (target: string) => Promise<void>;
  answerCall: () => Promise<void>;
  hangupCall: () => void;
  toggleMute: () => boolean; 
  toggleVideo: () => boolean; 
  isMuted: boolean;
  isVideoEnabled: boolean;
  requestCameraPermission: () => Promise<void>;
}

const SipContext = createContext<SipContextValue | undefined>(undefined);

export const SipProvider = ({ children }: { children: ReactNode }) => {
  const [ua, setUa] = useState<JsSIP.UA | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<SipConnectionStatus>('disconnected');
  const [sipConfig, setSipConfig] = useState<SipConfig | null>(null);
  const [activeCall, setActiveCall] = useState<SipCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const { toast } = useToast();

  const requestCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ title: 'Erreur Caméra', description: "getUserMedia n'est pas supporté par ce navigateur.", variant: 'destructive' });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setHasCameraPermission(true);
      // Ensure tracks are enabled by default, can be toggled later
      stream.getVideoTracks().forEach(track => track.enabled = true); // isVideoEnabled will control this
      setIsVideoEnabled(true);
      stream.getAudioTracks().forEach(track => track.enabled = true); // isMuted will control this
      setIsMuted(false);
    } catch (error) {
      console.error('Error accessing camera/mic:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Accès aux Périphériques Refusé',
        description: 'Veuillez activer les permissions pour la caméra et le microphone dans les paramètres de votre navigateur.',
      });
    }
  }, [toast]);
  

  const setupSessionEventHandlers = useCallback((session: JsSIP.RTCSession) => {
    const callId = session.id;
    const remoteIdentity = session.remote_identity?.uri.toString() || 'Inconnu';

    session.on('progress', () => {
      setActiveCall(prev => prev && prev.id === callId ? { ...prev, status: 'progress' } : prev);
      toast({ title: "Appel en Cours", description: `Appel de ${remoteIdentity}...` });
    });

    session.on('accepted', () => {
      setActiveCall(prev => prev && prev.id === callId ? { ...prev, status: 'answered', localStream } : prev);
      toast({ title: "Appel Accepté", description: `L'appel avec ${remoteIdentity} a commencé.` });
    });

    session.on('ended', () => {
      toast({ title: "Appel Terminé", description: `L'appel avec ${remoteIdentity} est terminé.` });
      setActiveCall(null);
      setRemoteStream(null);
    });

    session.on('failed', (e: any) => { 
      toast({ title: "Échec de l'Appel", description: `L'appel avec ${remoteIdentity} a échoué. ${e?.cause ? `Cause : ${e.cause}` : ''}`, variant: "destructive" });
      setActiveCall(null);
      setRemoteStream(null);
    });
    
    if (session.connection) { 
      session.connection.ontrack = (event: RTCTrackEvent) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
           setActiveCall(prev => prev && prev.id === callId ? { ...prev, remoteStream: event.streams[0] } : prev);
        }
      };
    }
  }, [toast, localStream]);


  const handleConnectionEvents = useCallback((newUserAgent: JsSIP.UA) => {
    newUserAgent.on('connecting', () => setConnectionStatus('connecting'));
    newUserAgent.on('connected', () => {
        setConnectionStatus('connected');
        toast({ title: 'Statut SIP', description: 'Connecté au WebSocket. Enregistrement en cours...' });
    });
    newUserAgent.on('disconnected', (e) => {
        // Only set to disconnected if not intentionally stopping (ua.stop())
        if (e && e.data && e.data.code !== 1000) { // 1000 is normal closure
             toast({ title: 'Statut SIP', description: `Déconnecté du serveur SIP. ${e.data.reason || ''}`, variant: 'destructive' });
        }
        setConnectionStatus('disconnected');
    });
    newUserAgent.on('registered', () => {
        setConnectionStatus('registered');
        toast({ title: 'Statut SIP', description: 'Enregistrement réussi.', variant: 'default' });
    });
    newUserAgent.on('unregistered', (e) => {
        setConnectionStatus('unregistered');
        // Avoid toast if it's part of a clean disconnect
        if (e && e.cause !== JsSIPInstance?.C.causes.USER_DENIED_MEDIA_ACCESS && e.cause !== JsSIPInstance?.C.causes.BYE && e.cause !== 'Terminated') {
            toast({ title: 'Statut SIP', description: `Désenregistré. ${e?.cause || ''}`, variant: 'destructive' });
        }
    });
    newUserAgent.on('registrationFailed', (e) => {
        setConnectionStatus('registration_failed');
        toast({ title: 'Statut SIP', description: `Échec de l'enregistrement. ${e?.cause || ''}`, variant: 'destructive' });
    });

    newUserAgent.on('newRTCSession', (data: JsSIP.UserAgentNewRtcSessionEvent) => {
      const session = data.session;
      if (!session) return;
      
      const callData: SipCall = {
        id: session.id,
        session: session,
        direction: session.direction as 'incoming' | 'outgoing',
        remoteIdentity: session.remote_identity?.uri.toString() || 'Inconnu',
        status: session.direction === 'incoming' ? 'ringing' : 'initiating',
        localStream: session.direction === 'outgoing' ? localStream : undefined,
      };
      setActiveCall(callData);
      setupSessionEventHandlers(session);

      if (session.direction === 'incoming') {
        toast({ 
            title: "Appel Entrant", 
            description: `Appel de ${callData.remoteIdentity}. Allez à la page Appels pour répondre.`,
            duration: 15000 
        });
      }
    });

  }, [toast, setupSessionEventHandlers, localStream]);

  const connectSip = useCallback(async (config: SipConfig) => {
    if (!JsSIPInstance) {
      toast({ title: "Erreur", description: "La librairie JsSIP n'est pas chargée.", variant: "destructive"});
      setConnectionStatus("error");
      throw new Error("JsSIP not loaded");
    }
    
    // If there's an existing UA, stop it first before creating a new one
    if (ua) {
      console.log("Stopping existing UA before new connection");
      ua.stop();
      setUa(null); // Clear old UA instance
      // Give a brief moment for resources to release if needed
      await new Promise(resolve => setTimeout(resolve, 100)); 
    }
    
    setSipConfig(config); // Set config immediately for UI reflection
    setConnectionStatus('connecting');

    try {
      const socket = new JsSIPInstance.WebSocketInterface(config.server);
      const configuration: JsSIP.UAConfiguration = {
        sockets: [socket],
        uri: config.uri, // Use the pre-formatted URI from login/settings
        password: config.password,
        display_name: config.username,
        register: true,
        session_timers: false, 
        registrar_server: undefined, 
        contact_uri: undefined, // Let JsSIP manage this
        authorization_user: config.username,
        no_answer_timeout: 60,
        // user_agent: `VidApp Connect/1.0.0`, // Example custom header
      };
      
      const newUserAgent = new JsSIPInstance.UA(configuration);
      handleConnectionEvents(newUserAgent);
      newUserAgent.start();
      setUa(newUserAgent);
    } catch (error) {
      console.error("SIP Connection Error:", error);
      setConnectionStatus("error");
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: "Erreur SIP", description: `Échec de l'initialisation du client SIP : ${errorMessage}`, variant: "destructive" });
      throw error; // Re-throw to be caught by login page
    }
  }, [ua, toast, handleConnectionEvents]);

  const disconnectSip = useCallback(() => {
    if (ua) {
      console.log("Disconnecting SIP...");
      ua.stop(); // This should trigger 'unregistered' and then 'disconnected'
      setUa(null);
    }
    // Clear related states, some might be cleared by UA events too
    setConnectionStatus('disconnected');
    setSipConfig(null); 
    setActiveCall(null);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    // setHasCameraPermission(null); // Keep camera permission status unless explicitly revoked
    // Don't toast here if called from login page or settings to avoid double toast
  }, [ua, localStream]);

  const makeCall = useCallback(async (target: string) => {
    if (!ua || connectionStatus !== 'registered' || !sipConfig) {
      toast({ title: "Erreur d'Appel", description: "Non enregistré ou configuration SIP manquante.", variant: "destructive"});
      return;
    }
    if (!localStream) { 
      toast({ title: "Média Requis", description: "L'accès à la caméra/microphone est nécessaire. Veuillez accorder la permission et réessayer.", variant: "destructive"});
      await requestCameraPermission(); 
      if (!localStream) return; 
    }

    const callOptions: JsSIP.UACommonOptions = {
      mediaConstraints: { audio: true, video: isVideoEnabled },
      pcConfig: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }, 
      rtcOfferConstraints: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
      },
      // extraHeaders: [ 'X-VidApp-Call: true' ], // Example custom header
    };

    try {
        const session = ua.call(`sip:${target}@${new URL(sipConfig.server).hostname}`, callOptions);
        if (session) {
            const callData: SipCall = {
                id: session.id,
                session: session,
                direction: 'outgoing',
                remoteIdentity: target,
                status: 'initiating',
                localStream: localStream,
            };
            setActiveCall(callData);
            setupSessionEventHandlers(session);

            if (localStream && session.connection) {
                localStream.getTracks().forEach(track => {
                    if (session.connection && typeof session.connection.addTrack === 'function') {
                         session.connection.addTrack(track, localStream);
                    }
                });
            }
        }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      toast({ title: "Erreur d'Appel", description: `Échec de l'initiation de l'appel : ${errorMsg}`, variant: "destructive" });
    }
  }, [ua, connectionStatus, sipConfig, toast, localStream, setupSessionEventHandlers, requestCameraPermission, isVideoEnabled]);


  const answerCall = useCallback(async () => {
    if (activeCall && activeCall.session && activeCall.direction === 'incoming') {
      if (!localStream) {
        toast({title: "Média Requis", description: "L'accès à la caméra/microphone est nécessaire pour répondre. Veuillez accorder la permission et réessayer.", variant: "destructive"});
        await requestCameraPermission();
        if(!localStream) return; 
      }
      
      activeCall.session.answer({
        mediaConstraints: { audio: true, video: isVideoEnabled },
        pcConfig: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
        rtcOfferConstraints: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        },
      });

       if (localStream && activeCall.session.connection) {
           localStream.getTracks().forEach(track => {
               if (activeCall.session.connection && typeof activeCall.session.connection.addTrack === 'function') {
                    activeCall.session.connection.addTrack(track, localStream);
               }
           });
       }
       setActiveCall(prev => prev ? {...prev, status: 'answered', localStream } : null);
    } else {
         toast({title: "Erreur de Réponse", description: "Aucun appel entrant à répondre.", variant: "destructive"});
    }
  }, [activeCall, localStream, requestCameraPermission, toast, isVideoEnabled]);
  
  const hangupCall = useCallback(() => {
    if (activeCall && activeCall.session) {
      if (!activeCall.session.isEnded()) {
        activeCall.session.terminate();
      }
      setActiveCall(null);
      setRemoteStream(null);
    }
  }, [activeCall]);

 const toggleMute = useCallback(() => {
    const newIsMuted = !isMuted;
    setIsMuted(newIsMuted);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newIsMuted;
      });
    }
    if (activeCall?.session) {
      if (newIsMuted) activeCall.session.mute({ audio: true });
      else activeCall.session.unmute({ audio: true });
    }
    return newIsMuted;
  }, [isMuted, localStream, activeCall]);

  const toggleVideo = useCallback(() => {
    const newIsVideoEnabled = !isVideoEnabled;
    setIsVideoEnabled(newIsVideoEnabled);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = newIsVideoEnabled;
      });
    }
     if (activeCall?.session) {
      if (!newIsVideoEnabled) activeCall.session.mute({ video: true }); // Mute video means video is off
      else activeCall.session.unmute({ video: true }); // Unmute video means video is on
    }
    return newIsVideoEnabled;
  }, [isVideoEnabled, localStream, activeCall]);


  useEffect(() => { 
    return () => {
      if (ua) {
        console.log("SipProvider unmounting, stopping UA.");
        ua.stop();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [ua, localStream]);

  return (
    <SipContext.Provider value={{ 
      ua, connectionStatus, sipConfig, activeCall, 
      localStream, remoteStream, hasCameraPermission,
      isMuted, isVideoEnabled,
      connectSip, disconnectSip, makeCall, answerCall, hangupCall, 
      toggleMute, toggleVideo, requestCameraPermission
    }}>
      {children}
    </SipContext.Provider>
  );
};

export const useSip = (): SipContextValue => {
  const context = useContext(SipContext);
  if (context === undefined) {
    throw new Error('useSip must be used within a SipProvider');
  }
  return context;
};
