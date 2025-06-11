
"use client";

import { useState, useMemo } from 'react';
import { PageTitle } from "@/components/custom/PageTitle";
import { ContactListItem } from "@/components/custom/ContactListItem";
import { ContactForm } from "@/components/custom/ContactForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { dummyContacts } from "@/lib/data";
import type { Contact } from '@/lib/types';
import { PlusCircle, Search, Star, Users, UsersRound, StarOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(dummyContacts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleFormSubmit = (data: Omit<Contact, 'id' | 'isFavorite'>) => {
    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...editingContact, ...data } : c));
      toast({ title: "Contact Updated", description: `${data.name} has been updated.` });
    } else {
      const newContact: Contact = { ...data, id: Date.now().toString(), isFavorite: false };
      setContacts(prev => [newContact, ...prev]);
      toast({ title: "Contact Added", description: `${data.name} has been added.` });
    }
    setIsFormOpen(false);
    setEditingContact(undefined);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDelete = (contactId: string) => {
    const contactToDelete = contacts.find(c => c.id === contactId);
    setContacts(prev => prev.filter(c => c.id !== contactId));
    if (contactToDelete) {
      toast({ title: "Contact Deleted", description: `${contactToDelete.name} has been deleted.`, variant: "destructive" });
    }
  };
  
  const handleCall = (contact: Contact, type: 'audio' | 'video') => {
    toast({
      title: `Starting ${type} call...`,
      description: `Calling ${contact.name} (${contact.number})`,
    });
    // In a real app, you'd initiate the call here.
    // Potentially redirect to calls page or open a call modal.
  };

  const handleToggleFavorite = (contactId: string) => {
    setContacts(prev => 
      prev.map(c => 
        c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c
      )
    );
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      toast({ title: contact.isFavorite ? "Removed from Favorites" : "Added to Favorites", description: `${contact.name} is ${contact.isFavorite ? 'no longer a' : 'now a'} favorite.` });
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.number.includes(searchTerm)
    );
  }, [contacts, searchTerm]);

  const favoriteContacts = useMemo(() => filteredContacts.filter(c => c.isFavorite), [filteredContacts]);
  const allContactsSorted = useMemo(() => 
    [...filteredContacts].sort((a,b) => a.name.localeCompare(b.name)), 
  [filteredContacts]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <PageTitle className="mb-0">Contacts</PageTitle>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search contacts..." 
              className="pl-10 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isFormOpen} onOpenChange={ (open) => { setIsFormOpen(open); if(!open) setEditingContact(undefined); }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingContact(undefined); setIsFormOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Contact
              </Button>
            </DialogTrigger>
            {isFormOpen && <ContactForm onSubmit={handleFormSubmit} initialData={editingContact} onClose={() => { setIsFormOpen(false); setEditingContact(undefined); }} />}
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2"><Users className="h-4 w-4" /> All Contacts ({allContactsSorted.length})</TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2"><Star className="h-4 w-4" /> Favorites ({favoriteContacts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {allContactsSorted.length > 0 ? (
            <div className="space-y-3">
              {allContactsSorted.map(contact => (
                <ContactListItem 
                  key={contact.id} 
                  contact={contact} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onCall={handleCall}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
              <UsersRound size={48} />
              <p>No contacts found. Add new contacts to get started!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="favorites">
          {favoriteContacts.length > 0 ? (
            <div className="space-y-3">
              {favoriteContacts.map(contact => (
                <ContactListItem 
                  key={contact.id} 
                  contact={contact} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onCall={handleCall}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
             <div className="text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
              <StarOff size={48} />
              <p>No favorite contacts yet. Mark some contacts as favorites!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
