import type { Contact } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Video, Edit3, Trash2, Star, Mail } from 'lucide-react';

interface ContactListItemProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onCall: (contact: Contact, type: 'audio' | 'video') => void;
  onToggleFavorite: (contactId: string) => void;
}

export function ContactListItem({ contact, onEdit, onDelete, onCall, onToggleFavorite }: ContactListItemProps) {
  const fallbackName = contact.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="avatar personne" />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">{fallbackName}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-foreground">{contact.name}</h3>
          <p className="text-sm text-muted-foreground">{contact.number}</p>
          {contact.email && <p className="text-xs text-muted-foreground flex items-center"><Mail className="w-3 h-3 mr-1" />{contact.email}</p>}
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(contact.id)} aria-label={contact.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
            <Star className={cn("h-5 w-5", contact.isFavorite ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground hover:text-yellow-500")} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onCall(contact, 'audio')} aria-label={`Appel audio ${contact.name}`}>
            <Phone className="h-5 w-5 text-green-500" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onCall(contact, 'video')} aria-label={`Appel vidéo ${contact.name}`}>
            <Video className="h-5 w-5 text-blue-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(contact)} aria-label={`Modifier ${contact.name}`}>
            <Edit3 className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(contact.id)} aria-label={`Supprimer ${contact.name}`}>
            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper cn function if not globally available
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');
