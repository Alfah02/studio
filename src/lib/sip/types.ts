
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
  direction: 'incoming' | 'outgoing';
  remoteIdentity: string; // SIP URI of the other party
  status: 'initiating' | 'ringing' | 'answered' | 'held' | 'resumed' | 'ended' | 'failed';
  // Add more call properties as needed (e.g., media streams)
}
