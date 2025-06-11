import type { CallRecord, CallDirection, CallOutcome, CallType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CallHistoryListItemProps {
  record: CallRecord;
  onCall: (record: CallRecord) => void;
  onDelete: (recordId: string) => void;
}

const CallStatusIcon = ({ direction, outcome, type }: { direction: CallDirection, outcome: CallOutcome, type: CallType }) => {
  let IconComponent = PhoneMissed;
  let color = "text-muted-foreground";

  if (direction === 'incoming') {
    IconComponent = PhoneIncoming;
    if (outcome === 'answered' || outcome === 'répondu') color = "text-green-500";
    else if (outcome === 'missed' || outcome === 'manqué') color = "text-red-500";
    else if (outcome === 'declined' || outcome === 'refusé') color = "text-yellow-500";
  } else { // outgoing
    IconComponent = PhoneOutgoing;
    if (outcome === 'answered' || outcome === 'répondu') color = "text-blue-500";
    else if (outcome === 'failed' || outcome === 'échoué' || outcome === 'busy') color = "text-red-500";
  }
  
  return <IconComponent className={`h-5 w-5 ${color}`} />;
};

const CallOutcomeIndicator = ({ outcome }: { outcome: CallOutcome }) => {
  if (outcome === 'answered' || outcome === 'répondu') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (outcome === 'missed' || outcome === 'manqué') return <PhoneMissed className="h-4 w-4 text-red-500" />;
  if (outcome === 'declined' || outcome === 'refusé') return <XCircle className="h-4 w-4 text-yellow-500" />;
  if (outcome === 'busy') return <AlertTriangle className="h-4 w-4 text-orange-500" />; // 'occupé' if translated
  if (outcome === 'failed' || outcome === 'échoué') return <AlertTriangle className="h-4 w-4 text-red-600" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
};


export function CallHistoryListItem({ record, onCall, onDelete }: CallHistoryListItemProps) {
  const fallbackName = record.contactName.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const callTimeAgo = formatDistanceToNowStrict(parseISO(record.date), { addSuffix: true, locale: fr });
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <CallStatusIcon direction={record.direction} outcome={record.outcome} type={record.type} />
          {record.type === 'video' ? <Video className="h-5 w-5 text-blue-400"/> : <Phone className="h-5 w-5 text-green-400"/>}
        </div>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-secondary text-secondary-foreground">{fallbackName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h3 className="text-md font-semibold text-foreground">{record.contactName}</h3>
          <p className="text-xs text-muted-foreground">{record.contactNumber}</p>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <CallOutcomeIndicator outcome={record.outcome} />
            <span className="ml-1 capitalize">{record.outcome} &middot; {callTimeAgo}</span>
          </div>
        </div>
        <div className="text-right">
            <p className="text-sm text-muted-foreground">{record.duration}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onCall(record)} aria-label={`Rappeler ${record.contactName}`}>
          Rappeler
        </Button>
      </CardContent>
    </Card>
  );
}
