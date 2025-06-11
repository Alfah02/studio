
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
      // Ensure audio is enabled by default
      stream.getAudioTracks().forEach(track => track.enabled = true);
      setIsMuted(false);
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
    });

    session.on('failed', (e: any) => { 
      toast({ title: "Call Failed", description: `Call with ${remoteIdentity} failed. ${e?.cause ? `Cause: ${e.cause}` : ''}`, variant: "destructive" });
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
            duration: 15000 
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
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setLocalStream(null);
      setRemoteStream(null);
      setHasCameraPermission(null);
      toast({ title: "SIP Status", description: "Disconnected." });
    }
  }, [ua, toast, localStream]);

  const makeCall = useCallback(async (target: string) => {
    if (!ua || connectionStatus !== 'registered' || !sipConfig) {
      toast({ title: "Call Error", description: "Not registered or SIP config missing.", variant: "destructive"});
      return;
    }
    if (!localStream) { 
      toast({ title: "Media Required", description: "Camera/microphone access is needed. Please grant permission and try again.", variant: "destructive"});
      await requestCameraPermission(); 
      return; 
    }

    const callOptions: JsSIP.UACommonOptions = {
      mediaConstraints: { audio: true, video: isVideoEnabled }, // Use isVideoEnabled state
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
        toast({ title: "Call Error", description: `Failed to initiate call: ${e}`, variant: "destructive" });
    }
  }, [ua, connectionStatus, sipConfig, toast, localStream, setupSessionEventHandlers, requestCameraPermission, isVideoEnabled, isMuted]);


  const answerCall = useCallback(async () => {
    if (activeCall && activeCall.session && activeCall.direction === 'incoming') {
      if (!localStream) {
        toast({title: "Media Required", description: "Camera/microphone access is needed to answer. Please grant permission and try again.", variant: "destructive"});
        await requestCameraPermission();
        return; 
      }
      
      activeCall.session.answer({
        mediaConstraints: { audio: true, video: isVideoEnabled }, // Use isVideoEnabled state
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
         toast({title: "Answer Error", description: "No incoming call to answer.", variant: "destructive"});
    }
  }, [activeCall, localStream, requestCameraPermission, toast, isVideoEnabled, isMuted]);
  
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
        audioTracks.forEach(track => track.enabled = !newIsMuted); // If newIsMuted is true (muted), track.enabled becomes false.
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
        videoTracks.forEach(track => track.enabled = newIsVideoEnabled); // If newIsVideoEnabled is true (video on), track.enabled becomes true.
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

    