
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type * as JsSIP from 'jssip';
import type { SipConfig, SipConnectionStatus, SipCall } from '@/lib/sip/types';
import { useToast } from "@/hooks/use-toast";

// Dynamically import jssip only on the client side
let JsSIPInstance: typeof JsSIP | null = null;
if (typeof window !== 'undefined') {
  import('jssip').then(module => {
    JsSIPInstance = module;
    // JsSIP.debug.enable('JsSIP:*'); // Enable for debugging
  }).catch(err => console.error("Failed to load JsSIP", err));
}

interface SipContextState {
  ua: JsSIP.UA | null;
  connectionStatus: SipConnectionStatus;
  sipConfig: SipConfig | null;
  activeCall: SipCall | null; 
}

interface SipContextValue extends SipContextState {
  connectSip: (config: SipConfig) => Promise<void>;
  disconnectSip: () => void;
  makeCall: (target: string, options?: JsSIP.UACommonOptions) => void;
  answerCall: () => void;
  hangupCall: () => void;
}

const SipContext = createContext<SipContextValue | undefined>(undefined);

export const SipProvider = ({ children }: { children: ReactNode }) => {
  const [ua, setUa] = useState<JsSIP.UA | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<SipConnectionStatus>('disconnected');
  const [sipConfig, setSipConfig] = useState<SipConfig | null>(null);
  const [activeCall, setActiveCall] = useState<SipCall | null>(null);
  const { toast } = useToast();

  const handleConnectionEvents = useCallback((newUserAgent: JsSIP.UA) => {
    newUserAgent.on('connecting', () => {
      setConnectionStatus('connecting');
      toast({ title: 'SIP Status', description: 'Connecting to SIP server...' });
    });
    newUserAgent.on('connected', () => {
      setConnectionStatus('connected');
      toast({ title: 'SIP Status', description: 'Connected to WebSocket server. Registering...' });
    });
    newUserAgent.on('disconnected', () => {
      setConnectionStatus('disconnected');
      toast({ title: 'SIP Status', description: 'Disconnected from SIP server.', variant: 'destructive' });
    });
    newUserAgent.on('registered', () => {
      setConnectionStatus('registered');
      toast({ title: 'SIP Status', description: 'Successfully registered with SIP server.', variant: 'default' });
    });
    newUserAgent.on('unregistered', (e) => {
      setConnectionStatus('unregistered');
       toast({ title: 'SIP Status', description: `Unregistered. ${e?.cause ? `Cause: ${e.cause}`: ''}`, variant: 'destructive' });
    });
    newUserAgent.on('registrationFailed', (e) => {
      setConnectionStatus('registration_failed');
      toast({ title: 'SIP Status', description: `Registration failed. ${e?.cause ? `Cause: ${e.cause}`: ''}`, variant: 'destructive' });
    });

    newUserAgent.on('newRTCSession', (data: JsSIP.UserAgentNewRtcSessionEvent) => {
      const session = data.session;
      if (!session) return;
      
      const callId = session.id;
      const remoteIdentity = session.remote_identity?.uri.toString() || 'Unknown';

      if (session.direction === 'incoming') {
        setActiveCall({ 
          id: callId, 
          direction: 'incoming', 
          remoteIdentity, 
          status: 'ringing' 
        });
        toast({ title: "Incoming Call", description: `Call from ${remoteIdentity}`});
        // Handle incoming call UI update
      }

      session.on('progress', () => {
         setActiveCall(prev => prev && prev.id === callId ? {...prev, status: 'ringing'} : prev);
      });
      session.on('accepted', () => {
        setActiveCall(prev => prev && prev.id === callId ? {...prev, status: 'answered'} : prev);
        toast({ title: "Call Accepted", description: `Call with ${remoteIdentity} started.`});
      });
      session.on('ended', () => {
        setActiveCall(null);
        toast({ title: "Call Ended", description: `Call with ${remoteIdentity} has ended.`});
      });
      session.on('failed', (e) => {
        setActiveCall(null);
        toast({ title: "Call Failed", description: `Call with ${remoteIdentity} failed. ${e?.cause ? `Cause: ${e.cause}` : ''}`, variant: "destructive"});
      });
    });

  }, [toast]);

  const connectSip = useCallback(async (config: SipConfig) => {
    if (!JsSIPInstance) {
      toast({ title: "Error", description: "JsSIP library not loaded yet.", variant: "destructive"});
      setConnectionStatus("error");
      return;
    }
    if (ua) {
      ua.stop();
    }
    setConnectionStatus('connecting');
    setSipConfig(config);

    try {
      const socket = new JsSIPInstance.WebSocketInterface(config.server);
      const fullSipUri = `sip:${config.username}@${new URL(config.server).hostname}`; // Guess domain from server URI
      
      const configuration: JsSIP.UAConfiguration = {
        sockets: [socket],
        uri: fullSipUri, // Correct SIP URI format
        password: config.password,
        display_name: config.username, // Use username as display name or make it configurable
        registrar_server: config.server.startsWith('wss://') || config.server.startsWith('ws://') ? undefined : config.server, // If server is not a WS URI, assume it's registrar
        contact_uri: undefined, 
        authorization_user: config.username,
        no_answer_timeout: 60,
        session_timers: true,
        register: true, // Attempt to register
        // Add more JsSIP configuration options as needed
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
      toast({ title: "SIP Status", description: "Disconnected." });
    }
  }, [ua, toast]);

  const makeCall = useCallback((target: string, options?: JsSIP.UACommonOptions) => {
    if (ua && connectionStatus === 'registered' && sipConfig) {
      const eventHandlers = {
        'progress': (e: any) => { console.log('call is in progress'); },
        'failed': (e: any) => { 
          toast({ title: "Call Failed", description: `Failed to call ${target}. Cause: ${e.cause}`, variant: "destructive"});
          setActiveCall(null);
        },
        'ended': (e: any) => { 
          toast({ title: "Call Ended", description: `Call with ${target} ended.` });
          setActiveCall(null);
        },
        'confirmed': (e: any) => { 
          toast({ title: "Call Confirmed", description: `Call with ${target} is active.` });
        }
      };
      const callOptions = {
        'eventHandlers'   : eventHandlers,
        'mediaConstraints': { 'audio': true, 'video': true }, // Adjust as needed
        ...options
      };
      
      const session = ua.call(`sip:${target}@${new URL(sipConfig.server).hostname}`, callOptions);
      if (session) {
         setActiveCall({
            id: session.id,
            direction: 'outgoing',
            remoteIdentity: target,
            status: 'initiating'
        });
      }
    } else {
      toast({ title: "SIP Error", description: "Not registered or UA not available.", variant: "destructive"});
    }
  }, [ua, connectionStatus, toast, sipConfig]);

  const answerCall = useCallback(() => {
    if (activeCall && activeCall.direction === 'incoming' && ua) {
      const session = ua.sessions[activeCall.id];
      if (session) {
        session.answer({ 'mediaConstraints': { 'audio': true, 'video': true } });
      }
    }
  }, [activeCall, ua]);
  
  const hangupCall = useCallback(() => {
    if (activeCall && ua) {
      const session = ua.sessions[activeCall.id];
      if (session && !session.isEnded()) {
        session.terminate();
      } else if (activeCall.direction === 'incoming' && activeCall.status === 'ringing' && session) {
        // For an incoming call that is ringing but not yet answered by us
        session.terminate({ status_code: 486, reason_phrase: 'Busy Here' });
      }
       setActiveCall(null); // Clear active call UI immediately
    }
  }, [activeCall, ua]);


  useEffect(() => {
    return () => {
      if (ua) {
        ua.stop();
      }
    };
  }, [ua]);

  return (
    <SipContext.Provider value={{ ua, connectionStatus, sipConfig, activeCall, connectSip, disconnectSip, makeCall, answerCall, hangupCall }}>
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
