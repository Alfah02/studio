
"use client";

import { useState, useMemo } from 'react';
import { PageTitle } from "@/components/custom/PageTitle";
import { CallHistoryListItem } from "@/components/custom/CallHistoryListItem";
import { dummyCallHistory } from "@/lib/data";
import type { CallRecord } from '@/lib/types';
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ListX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const [history, setHistory] = useState<CallRecord[]>(dummyCallHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'video'>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'answered' | 'missed' | 'outgoing'>('all'); // Added 'outgoing'
  const { toast } = useToast();

  const handleCall = (record: CallRecord) => {
    toast({
      title: `Calling ${record.contactName}...`,
      description: `Dialing ${record.contactNumber} via ${record.type} call.`,
    });
    // Implement call logic, possibly redirecting to /calls or opening a call modal
  };

  const handleDelete = (recordId: string) => {
    setHistory(prev => prev.filter(r => r.id !== recordId));
    toast({ title: "Call record deleted.", variant: "destructive" });
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
        return record.outcome === filterOutcome;
      })
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, searchTerm, filterType, filterOutcome]);

  return (
    <div className="space-y-6">
      <PageTitle>Call History</PageTitle>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg shadow">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search history..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Select value={filterType} onValueChange={(value: 'all' | 'audio' | 'video') => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Call Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterOutcome} onValueChange={(value: 'all' | 'answered' | 'missed' | 'outgoing') => setFilterOutcome(value)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Call Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="outgoing">Outgoing</SelectItem> {/* Added 'outgoing' filter option */}
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> More Filters
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
        <div className="text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
          <ListX size={48} />
          <p>No call history records match your filters, or your history is empty.</p>
        </div>
      )}
    </div>
  );
}
