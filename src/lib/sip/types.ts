
import type * as JsSIP from 'jssip';

export interface SipConfig {
  uri: string;
  password?: string;
  server: string; // WebSocket server URI e.g. wss://asterisk.example.com:8089/ws
  username: string; 
}

export type SipConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected' // Connected to WebSocket server
  | 'registered' // Registered with SIP server
  | 'unregistered'
  | 'registration_failed'
  | 'error';

export interface SipCall {
  id: string; // JsSIP session ID
  session: JsSIP.RTCSession; // The actual JsSIP session
  direction: 'incoming' | 'outgoing';
  remoteIdentity: string; // SIP URI of the other party
  status: 'initiating' | 'ringing' | 'answered' | 'progress' | 'held' | 'resumed' | 'ended' | 'failed';
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}
