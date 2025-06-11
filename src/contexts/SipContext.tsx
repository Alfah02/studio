
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
  makeCall: (target: string) => void;
  answerCall: () => void;
  hangupCall: () => void;
  toggleMute: () => boolean; // Returns new mute state
  toggleVideo: () => boolean; // Returns new video state
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
      toast({ title: 'Camera Error', description: 'getUserMedia not supported in this browser.', variant: 'destructive' });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setHasCameraPermission(true);
      // Ensure video is enabled by default if permission is granted
      stream.getVideoTracks().forEach(track => track.enabled = true);
      setIsVideoEnabled(true);
    } catch (error) {
      console.error('Error accessing camera/mic:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Device Access Denied',
        description: 'Please enable camera and microphone permissions in your browser settings.',
      });
    }
  }, [toast]);
  

  const setupSessionEventHandlers = useCallback((session: JsSIP.RTCSession) => {
    const callId = session.id;
    const remoteIdentity = session.remote_identity?.uri.toString() || 'Unknown';

    session.on('progress', () => {
      setActiveCall(prev => prev && prev.id === callId ? { ...prev, status: 'progress' } : prev);
      toast({ title: "Call Progress", description: `Calling ${remoteIdentity}...` });
    });

    session.on('accepted', () => {
      setActiveCall(prev => prev && prev.id === callId ? { ...prev, status: 'answered', localStream } : prev);
      toast({ title: "Call Accepted", description: `Call with ${remoteIdentity} started.` });
    });

    session.on('ended', () => {
      toast({ title: "Call Ended", description: `Call with ${remoteIdentity} has ended.` });
      setActiveCall(null);
      setRemoteStream(null);
      // Don't stop local stream here, user might want to start another call
    });

    session.on('failed', (e: any) => { // Use any for JsSIP event data if specific type is unknown
      toast({ title: "Call Failed", description: `Call with ${remoteIdentity} failed. ${e?.cause ? `Cause: ${e.cause}` : ''}`, variant: "destructive" });
      setActiveCall(null);
      setRemoteStream(null);
    });
    
    // Handle media streams
    if (session.connection) { // RTCPeerConnection
      session.connection.ontrack = (event: RTCTrackEvent) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
           setActiveCall(prev => prev && prev.id === callId ? { ...prev, remoteStream: event.streams[0] } : prev);
        }
      };
    }
    // For outgoing calls, add local stream tracks
    if (session.direction === 'outgoing' && localStream) {
        localStream.getTracks().forEach(track => {
            if (session.connection) {
                session.connection.addTrack(track, localStream);
            }
        });
    }

  }, [toast, localStream]);


  const handleConnectionEvents = useCallback((newUserAgent: JsSIP.UA) => {
    newUserAgent.on('connecting', () => setConnectionStatus('connecting'));
    newUserAgent.on('connected', () => {
        setConnectionStatus('connected');
        toast({ title: 'SIP Status', description: 'Connected to WebSocket. Registering...' });
    });
    newUserAgent.on('disconnected', () => {
        setConnectionStatus('disconnected');
        toast({ title: 'SIP Status', description: 'Disconnected from SIP server.', variant: 'destructive' });
    });
    newUserAgent.on('registered', () => {
        setConnectionStatus('registered');
        toast({ title: 'SIP Status', description: 'Successfully registered.', variant: 'default' });
    });
    newUserAgent.on('unregistered', (e) => {
        setConnectionStatus('unregistered');
        toast({ title: 'SIP Status', description: `Unregistered. ${e?.cause || ''}`, variant: 'destructive' });
    });
    newUserAgent.on('registrationFailed', (e) => {
        setConnectionStatus('registration_failed');
        toast({ title: 'SIP Status', description: `Registration failed. ${e?.cause || ''}`, variant: 'destructive' });
    });

    newUserAgent.on('newRTCSession', (data: JsSIP.UserAgentNewRtcSessionEvent) => {
      const session = data.session;
      if (!session) return;
      
      const callData: SipCall = {
        id: session.id,
        session: session,
        direction: session.direction as 'incoming' | 'outgoing',
        remoteIdentity: session.remote_identity?.uri.toString() || 'Unknown',
        status: session.direction === 'incoming' ? 'ringing' : 'initiating',
        localStream: session.direction === 'outgoing' ? localStream : undefined,
      };
      setActiveCall(callData);
      setupSessionEventHandlers(session);

      if (session.direction === 'incoming') {
        toast({ 
            title: "Incoming Call", 
            description: `Call from ${callData.remoteIdentity}. Go to Calls page to answer.`,
            duration: 15000 // Longer duration for incoming call toast
        });
      }
    });

  }, [toast, setupSessionEventHandlers, localStream]);

  const connectSip = useCallback(async (config: SipConfig) => {
    if (!JsSIPInstance) {
      toast({ title: "Error", description: "JsSIP library not loaded.", variant: "destructive"});
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
        session_timers: false, // Disabling session timers can sometimes help with compatibility
        registrar_server: undefined, // Usually not needed if uri domain matches server
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
      toast({ title: "SIP Error", description: `Failed to initialize SIP client: ${error instanceof Error ? error.message : String(error)}`, variant: "destructive" });
    }
  }, [ua, toast, handleConnectionEvents]);

  const disconnectSip = useCallback(() => {
    if (ua) {
      ua.stop();
      setUa(null);
      setConnectionStatus('disconnected');
      setSipConfig(null);
      setActiveCall(null);
      setLocalStream(null);
      setRemoteStream(null);
      setHasCameraPermission(null);
      toast({ title: "SIP Status", description: "Disconnected." });
    }
  }, [ua, toast]);

  const makeCall = useCallback(async (target: string) => {
    if (!ua || connectionStatus !== 'registered' || !sipConfig || !localStream) {
      toast({ title: "Call Error", description: "Not registered, SIP config missing, or no local media.", variant: "destructive"});
      if(!localStream) await requestCameraPermission(); // Try to get permission if missing
      return;
    }

    const callOptions: JsSIP.UACommonOptions = {
      mediaConstraints: { audio: true, video: true },
      pcConfig: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }, // Example STUN server
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

            // Add local tracks to the session's peer connection
            if (localStream && session.connection) {
                localStream.getTracks().forEach(track => {
                    session.connection.addTrack(track, localStream);
                });
            }
        }
    } catch (e) {
        toast({ title: "Call Error", description: `Failed to initiate call: ${e}`, variant: "destructive" });
    }
  }, [ua, connectionStatus, sipConfig, toast, localStream, setupSessionEventHandlers, requestCameraPermission]);


  const answerCall = useCallback(() => {
    if (activeCall && activeCall.session && activeCall.direction === 'incoming' && localStream) {
      activeCall.session.answer({
        mediaConstraints: { audio: true, video: true },
        pcConfig: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
         // Add local tracks to the session's peer connection
        extraHeaders: [], // Add any extra headers if needed
        rtcOfferConstraints: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        },
      });
      // Add local tracks after answering
       if (localStream && activeCall.session.connection) {
           localStream.getTracks().forEach(track => {
               activeCall.session.connection.addTrack(track, localStream);
           });
       }
       setActiveCall(prev => prev ? {...prev, status: 'answered', localStream } : null);
    } else {
         if(!localStream) requestCameraPermission();
         toast({title: "Answer Error", description: "No incoming call or local media stream not ready.", variant: "destructive"});
    }
  }, [activeCall, localStream, requestCameraPermission, toast]);
  
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
        const newMutedState = !audioTracks[0].enabled;
        audioTracks[0].enabled = !newMutedState; // This seems reversed, should be audioTracks[0].enabled = newMutedState ? false : true;
        setIsMuted(newMutedState);
        return newMutedState;
      }
    }
    return isMuted;
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const newVideoState = !videoTracks[0].enabled;
        videoTracks[0].enabled = newVideoState; // Correct logic: enable if newVideoState is true
        setIsVideoEnabled(newVideoState); 
        return newVideoState;
      }
    }
    return isVideoEnabled;
  }, [localStream, isVideoEnabled]);


  useEffect(() => { // Cleanup local stream on unmount or when disconnecting
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
