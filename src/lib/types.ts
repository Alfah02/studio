export interface Contact {
  id: string;
  name: string;
  number: string;
  email?: string;
  avatarUrl?: string;
  isFavorite?: boolean;
}

export type CallType = 'audio' | 'video';
export type CallDirection = 'incoming' | 'outgoing';
export type CallOutcome = 'answered' | 'missed' | 'declined' | 'busy' | 'failed';

export interface CallRecord {
  id: string;
  contactName: string;
  contactNumber: string;
  type: CallType;
  direction: CallDirection;
  outcome: CallOutcome;
  date: string; 
  duration: string; 
}
