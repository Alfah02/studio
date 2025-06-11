
"use client";

import { useState, useMemo } from 'react';
import { PageTitle } from "@/components/custom/PageTitle";
import { CallHistoryListItem } from "@/components/custom/CallHistoryListItem";
// import { dummyCallHistory } from "@/lib/data"; // No longer importing dummy data
import type { CallRecord } from '@/lib/types';
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ListX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const [history, setHistory] = useState<CallRecord[]>([]); // Initialize with empty array
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'video'>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'answered' | 'missed' | 'outgoing'>('all');
  const { toast } = useToast();

  // In a real application, you would fetch call history from a backend or SipContext
  // useEffect(() => {
  //   // Example: fetchHistory().then(data => setHistory(data));
  // }, []);

  const handleCall = (record: CallRecord) => {
    toast({
      title: `Appel de ${record.contactName}...`,
      description: `Composition du ${record.contactNumber} via appel ${record.type}.`,
    });
    // Implement actual call logic here, possibly using useSip() context
  };

  const handleDelete = (recordId: string) => {
    // In a real app, this would also call a backend to delete the record
    setHistory(prev => prev.filter(r => r.id !== recordId));
    toast({ title: "Enregistrement d'appel supprimé.", variant: "destructive" });
  };
  
  const filteredHistory = useMemo(() => {
    return history
      .filter(record => 
        record.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.contactNumber.includes(searchTerm)
      )
      .filter(record => filterType === 'all' || record.type === filterType)
      .filter(record => {
        if (filterOutcome === 'all') return true;
        if (filterOutcome === 'outgoing') return record.direction === 'outgoing';
        // Ensure outcome matches, French terms were in dummy data, English in type
        const outcomeLc = record.outcome.toLowerCase();
        const filterOutcomeLc = filterOutcome.toLowerCase();
        if (filterOutcomeLc === 'answered' && (outcomeLc === 'answered' || outcomeLc === 'répondu')) return true;
        if (filterOutcomeLc === 'missed' && (outcomeLc === 'missed' || outcomeLc === 'manqué')) return true;
        return outcomeLc === filterOutcomeLc;
      })
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, searchTerm, filterType, filterOutcome]);

  return (
    <div className="space-y-6">
      <PageTitle>Historique des Appels</PageTitle>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg shadow">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Rechercher dans l'historique..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Select value={filterType} onValueChange={(value: 'all' | 'audio' | 'video') => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Type d'Appel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les Types</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="video">Vidéo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterOutcome} onValueChange={(value: 'all' | 'answered' | 'missed' | 'outgoing') => setFilterOutcome(value)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Résultat de l'Appel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les Résultats</SelectItem>
              <SelectItem value="answered">Répondu</SelectItem>
              <SelectItem value="missed">Manqué</SelectItem>
              <SelectItem value="outgoing">Sortant</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => toast({title:"Info Fonctionnalité", description:"Des options de filtrage avancées seront disponibles ici."})}>
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Plus de Filtres
          </Button>
        </div>
      </div>

      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map(record => (
            <CallHistoryListItem 
              key={record.id} 
              record={record} 
              onCall={handleCall}
              onDelete={handleDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-16 flex flex-col items-center gap-3">
          <ListX size={48} />
          <p className="text-lg">Aucun historique d'appel pour le moment.</p>
          <p className="text-sm">Vos appels passés et reçus apparaîtront ici.</p>
        </div>
      )}
    </div>
  );
}
