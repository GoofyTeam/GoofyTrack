// components/talks/ScheduledTalksList.tsx
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import { ScheduledTalk } from '@/lib/types';

interface ScheduledTalksListProps {
  scheduledTalks: ScheduledTalk[];
}

export default function ScheduledTalksList({ scheduledTalks }: ScheduledTalksListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Talks programmés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scheduledTalks.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center">
            Aucun talk programmé pour le moment
          </div>
        ) : (
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {scheduledTalks.map((scheduledTalk, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{scheduledTalk.talk.title}</h3>
                  <StatusBadge status={scheduledTalk.talk.status} />
                </div>
                <div className="text-muted-foreground text-sm">
                  <p>Date: {format(scheduledTalk.slot.date, 'dd/MM/yyyy')}</p>
                  <p>
                    Horaire: {scheduledTalk.slot.startTime} - {scheduledTalk.slot.endTime}
                  </p>
                  <p>Salle: {scheduledTalk.room.name}</p>
                  <p>Durée: {scheduledTalk.talk.durationMinutes} min</p>
                  <p>Niveau: {scheduledTalk.talk.level}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
