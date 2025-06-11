import type { Contact, CallRecord } from './types';

export const dummyContacts: Contact[] = [
  { id: '1', name: 'Alice Wonderland', number: '+1-555-0100', email: 'alice@vidapp.com', avatarUrl: 'https://placehold.co/40x40.png', isFavorite: true },
  { id: '2', name: 'Bob The Builder', number: '+1-555-0101', email: 'bob@vidapp.org', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Charlie Brown', number: '+1-555-0102', email: 'charlie@vidapp.com', isFavorite: true },
  { id: '4', name: 'Diana Prince', number: '+1-555-0103', email: 'diana@vidapp.org', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: '5', name: 'Edward Scissorhands', number: '+1-555-0104', email: 'edward@vidapp.com' },
];

export const dummyCallHistory: CallRecord[] = [
  { id: '1', contactName: 'Alice Wonderland', contactNumber: '+1-555-0100', type: 'video', direction: 'outgoing', outcome: 'answered', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), duration: '5m 32s' },
  { id: '2', contactName: 'Bob The Builder', contactNumber: '+1-555-0101', type: 'audio', direction: 'incoming', outcome: 'missed', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), duration: '0m 0s' },
  { id: '3', contactName: 'Charlie Brown', contactNumber: '+1-555-0102', type: 'audio', direction: 'outgoing', outcome: 'answered', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), duration: '12m 10s' },
  { id: '4', contactName: 'Unknown Caller', contactNumber: '+1-555-0199', type: 'audio', direction: 'incoming', outcome: 'declined', date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), duration: '0m 0s' },
  { id: '5', contactName: 'Diana Prince', contactNumber: '+1-555-0103', type: 'video', direction: 'incoming', outcome: 'answered', date: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(), duration: '22m 45s' },
];
