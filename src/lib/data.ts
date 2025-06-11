import type { Contact, CallRecord } from './types';

export const dummyContacts: Contact[] = [];

export const dummyCallHistory: CallRecord[] = [
  { id: '1', contactName: 'Alice Wonderland', contactNumber: '+1-555-0100', type: 'video', direction: 'outgoing', outcome: 'répondu', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), duration: '5m 32s' },
  { id: '2', contactName: 'Bob The Builder', contactNumber: '+1-555-0101', type: 'audio', direction: 'incoming', outcome: 'manqué', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), duration: '0m 0s' },
  { id: '3', contactName: 'Charlie Brown', contactNumber: '+1-555-0102', type: 'audio', direction: 'outgoing', outcome: 'répondu', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), duration: '12m 10s' },
  { id: '4', contactName: 'Unknown Caller', contactNumber: '+1-555-0199', type: 'audio', direction: 'incoming', outcome: 'refusé', date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), duration: '0m 0s' },
  { id: '5', contactName: 'Diana Prince', contactNumber: '+1-555-0103', type: 'video', direction: 'incoming', outcome: 'répondu', date: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(), duration: '22m 45s' },
];
