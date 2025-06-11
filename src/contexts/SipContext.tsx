
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
      stream.getVideoTracks().forEach(track => track.enabled = true);
      setIsVideoEnabled(true);
      stream.getAudioTracks().forEach(track => track.enabled = true);
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
    newUserAgent.on('disconnected', () => {
        setConnectionStatus('disconnected');
        toast({ title: 'Statut SIP', description: 'Déconnecté du serveur SIP.', variant: 'destructive' });
    });
    newUserAgent.on('registered', () => {
        setConnectionStatus('registered');
        toast({ title: 'Statut SIP', description: 'Enregistrement réussi.', variant: 'default' });
    });
    newUserAgent.on('unregistered', (e) => {
        setConnectionStatus('unregistered');
        toast({ title: 'Statut SIP', description: `Désenregistré. ${e?.cause || ''}`, variant: 'destructive' });
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
      return;
    }
    if (ua) ua.stop();
    
    setSipConfig(config);
    setConnectionStatus('connecting');

    try {
      const socket = new JsSIPInstance.WebSocketInterface(config.server);
      const configuration: JsSIP.UAConfiguration = {
        sockets: [socket],
        uri: `sip:${config.username}@${new URL(config.server).hostname}`,
        password: config.password,
        display_name: config.username,
        register: true,
        session_timers: false, 
        registrar_server: undefined, 
        contact_uri: undefined,
        authorization_user: config.username,
        no_answer_timeout: 60,
      };
      
      const newUserAgent = new JsSIPInstance.UA(configuration);
      handleConnectionEvents(newUserAgent);
      newUserAgent.start();
      setUa(newUserAgent);
    } catch (error) {
      console.error("SIP Connection Error:", error);
      setConnectionStatus("error");
      toast({ title: "Erreur SIP", description: `Échec de l'initialisation du client SIP : ${error instanceof Error ? error.message : String(error)}`, variant: "destructive" });
    }
  }, [ua, toast, handleConnectionEvents]);

  const disconnectSip = useCallback(() => {
    if (ua) {
      ua.stop();
      setUa(null);
      setConnectionStatus('disconnected');
      setSipConfig(null);
      setActiveCall(null);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setLocalStream(null);
      setRemoteStream(null);
      setHasCameraPermission(null);
      toast({ title: "Statut SIP", description: "Déconnecté." });
    }
  }, [ua, toast, localStream]);

  const makeCall = useCallback(async (target: string) => {
    if (!ua || connectionStatus !== 'registered' || !sipConfig) {
      toast({ title: "Erreur d'Appel", description: "Non enregistré ou configuration SIP manquante.", variant: "destructive"});
      return;
    }
    if (!localStream) { 
      toast({ title: "Média Requis", description: "L'accès à la caméra/microphone est nécessaire. Veuillez accorder la permission et réessayer.", variant: "destructive"});
      await requestCameraPermission(); 
      if (!localStream) return; // Re-check after attempting to get permission
    }

    const callOptions: JsSIP.UACommonOptions = {
      mediaConstraints: { audio: true, video: isVideoEnabled },
      pcConfig: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }, 
      rtcOfferConstraints: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
      },
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
                    session.connection.addTrack(track, localStream);
                });
            }
        }
    } catch (e) {
        toast({ title: "Erreur d'Appel", description: `Échec de l'initiation de l'appel : ${e}`, variant: "destructive" });
    }
  }, [ua, connectionStatus, sipConfig, toast, localStream, setupSessionEventHandlers, requestCameraPermission, isVideoEnabled]);


  const answerCall = useCallback(async () => {
    if (activeCall && activeCall.session && activeCall.direction === 'incoming') {
      if (!localStream) {
        toast({title: "Média Requis", description: "L'accès à la caméra/microphone est nécessaire pour répondre. Veuillez accorder la permission et réessayer.", variant: "destructive"});
        await requestCameraPermission();
        if(!localStream) return; // Re-check
      }
      
      activeCall.session.answer({
        mediaConstraints: { audio: true, video: isVideoEnabled },
        pcConfig: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
        extraHeaders: [], 
        rtcOfferConstraints: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        },
      });

       if (localStream && activeCall.session.connection) {
           localStream.getTracks().forEach(track => {
               activeCall.session.connection.addTrack(track, localStream);
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
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const newIsMuted = !isMuted;
        audioTracks.forEach(track => track.enabled = !newIsMuted);
        setIsMuted(newIsMuted);
        
        if (activeCall?.session) {
          if (newIsMuted) {
            activeCall.session.mute({audio: true});
          } else {
            activeCall.session.unmute({audio: true});
          }
        }
        return newIsMuted;
      }
    }
    return isMuted;
  }, [localStream, activeCall, isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const newIsVideoEnabled = !isVideoEnabled;
        videoTracks.forEach(track => track.enabled = newIsVideoEnabled);
        setIsVideoEnabled(newIsVideoEnabled);
        
        if (activeCall?.session) {
          if (!newIsVideoEnabled) { 
            activeCall.session.mute({video: true});
          } else { 
            activeCall.session.unmute({video: true});
          }
        }
        return newIsVideoEnabled;
      }
    }
    return isVideoEnabled;
  }, [localStream, activeCall, isVideoEnabled]);


  useEffect(() => { 
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (ua) {
        ua.stop();
      }
    };
  }, [localStream, ua]);

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
