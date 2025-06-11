
"use client";

import { useState, useMemo } from 'react';
import { PageTitle } from "@/components/custom/PageTitle";
import { ContactListItem } from "@/components/custom/ContactListItem";
// ContactForm import removed
import { Button } from "@/components/ui/button"; // Button might still be used for other actions later, or can be removed if not.
import { Input } from "@/components/ui/input";
// Dialog and DialogTrigger removed as ContactForm is removed
import type { Contact } from '@/lib/types';
import { Search, Star, Users, UsersRound, StarOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]); // Contacts will be populated from server in a real app
  // isFormOpen and editingContact states removed
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // handleFormSubmit removed

  // handleEdit would need to be re-thought if contacts are server-managed and read-only locally, or trigger server-side edit.
  // For now, let's assume local edit is not a primary feature if contacts are server-managed.
  const handleEdit = (contact: Contact) => {
    toast({ title: "Info", description: `La modification des contacts se fait via le système central (par exemple, Asterisk). ${contact.name}` });
  };

  // handleDelete would also need to trigger server-side deletion.
  const handleDelete = (contactId: string) => {
    const contactToDelete = contacts.find(c => c.id === contactId);
    // Placeholder for server-side deletion
    // setContacts(prev => prev.filter(c => c.id !== contactId)); 
    if (contactToDelete) {
      toast({ title: "Info", description: `La suppression des contacts se fait via le système central. Tentative de suppression de ${contactToDelete.name} (simulé).`, variant: "default" });
    }
  };
  
  const handleCall = (contact: Contact, type: 'audio' | 'video') => {
    toast({
      title: `Démarrage de l'appel ${type}...`,
      description: `Appel de ${contact.name} (${contact.number})`,
    });
    // Actual call logic would use useSip() context to make a call
  };

  const handleToggleFavorite = (contactId: string) => {
    // Favorite status might be a local preference or synced with server
    setContacts(prev => 
      prev.map(c => 
        c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c
      )
    );
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      toast({ title: contact.isFavorite ? "Retiré des Favoris" : "Ajouté aux Favoris", description: `${contact.name} ${contact.isFavorite ? "n'est plus un" : 'est maintenant un'} favori.` });
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
              placeholder="Rechercher des contacts..." 
              className="pl-10 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* "Ajouter un Contact" button and Dialog removed */}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2"><Users className="h-4 w-4" /> Tous les Contacts ({allContactsSorted.length})</TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2"><Star className="h-4 w-4" /> Favoris ({favoriteContacts.length})</TabsTrigger>
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
              <p>Aucun contact à afficher.</p>
              <p className="text-sm">Les contacts sont gérés de manière centralisée et apparaîtront ici une fois synchronisés ou configurés sur le serveur.</p>
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
              <p>Aucun contact favori pour le moment.</p>
              <p className="text-sm">Marquez des contacts comme favoris, et ils apparaîtront ici.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
