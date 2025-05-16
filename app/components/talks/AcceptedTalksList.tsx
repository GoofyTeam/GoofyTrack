// components/talks/AcceptedTalksList.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { levels } from '@/lib/mock-data';
import { Talk, Room } from '@/lib/types';
import { isOrganizer, isSpeaker } from '@/utils/auth.utils';
import { Pencil, Plus, Trash2, CalendarPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useMemo } from 'react';
import DeleteDialog from './DeleteDialog';
import StatusBadge from './StatusBadge';
import TalkDialog from './TalkDialog';

interface AcceptedTalksListProps {
  talks: Talk[];
  onAddTalk: (talk: Omit<Talk, 'id'>) => void;
  onUpdateTalk: (talk: Talk) => void;
  onDeleteTalk: (talkId: string) => void;
  // scheduledTalks: ScheduledTalk[];
  rooms?: Room[];
  // topics: string[];
}

// Helper to generate Google Calendar event link
function getGoogleCalendarUrl(talk: Talk) {
  // For demo, use current date/time as start, and add duration
  const start = new Date();
  const end = new Date(start.getTime() + (talk.durationMinutes || 30) * 60000);

  function formatDate(d: Date) {
    // YYYYMMDDTHHmmssZ
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: talk.title,
    details: talk.description || '',
    location: 'Goofy Talk',
    dates: `${formatDate(start)}/${formatDate(end)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function AcceptedTalksList({
  talks,
  onAddTalk,
  onUpdateTalk,
  onDeleteTalk,
  // scheduledTalks,
  rooms = [],
  // topics,
}: AcceptedTalksListProps) {
  const session = useSession();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTalk, setCurrentTalk] = useState<Talk | null>(null);
  const [talkToDelete, setTalkToDelete] = useState<Talk | null>(null);
  const [isNewTalk, setIsNewTalk] = useState(true);

  const [filterTopic, setFilterTopic] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredScheduledTalks = useMemo(() => {
    // return scheduledTalks.filtæer((st) => {
    //   const { talk } = st;
    //   const { slot } = st;
    //   const { room } = st;
    //   let ok = true;
    //   if (filterTopic && talk.topic !== filterTopic) ok = false;
    //   if (filterDuration && String(talk.durationMinutes) !== filterDuration) ok = false;
    //   if (filterLevel && talk.level !== filterLevel) ok = false;
    //   if (filterRoom && room.id !== filterRoom) ok = false;
    //   if (filterDate && slot.date.toISOString().slice(0, 10) !== filterDate) ok = false;
    //   return ok;
    // });
    return talks.filter((talk) => {
      let ok = true;
      if (filterTopic && talk.topic !== filterTopic) ok = false;
      if (filterDuration && String(talk.durationMinutes) !== filterDuration) ok = false;
      if (filterLevel && talk.level !== filterLevel) ok = false;
      return ok;
    });
    // }, [scheduledTalks, filterTopic, filterDuration, filterLevel, filterRoom, filterDate]);
  }, [talks, filterTopic, filterDuration, filterLevel, filterRoom, filterDate]);

  const topics = useMemo(() => {
    const allTopics = talks.map((talk) => talk.topic);
    const uniqueTopics = Array.from(new Set(allTopics));

    return uniqueTopics;
  }, [talks]);

  const handleCreateTalk = () => {
    setIsNewTalk(true);
    setCurrentTalk(null);
    setIsDialogOpen(true);
  };

  const handleEditTalk = (talk: Talk) => {
    setCurrentTalk(talk);
    setIsNewTalk(false);
    setIsDialogOpen(true);
  };

  const handleDeleteTalk = (talk: Talk) => {
    setTalkToDelete(talk);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTalk = () => {
    if (talkToDelete) {
      onDeleteTalk(talkToDelete.id);
      setIsDeleteDialogOpen(false);
      setTalkToDelete(null);
    }
  };

  const saveTalk = (talk: Omit<Talk, 'id'> & { id?: string }) => {
    if (isNewTalk) {
      onAddTalk(talk);
    } else {
      onUpdateTalk(talk as Talk);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Talks acceptés</h2>

      </div>

      <div className="mb-2 flex flex-wrap gap-4">
        <select
          className="rounded border px-2 py-1"
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
        >
          <option value="">Sujet</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <select
          className="rounded border px-2 py-1"
          value={filterDuration}
          onChange={(e) => setFilterDuration(e.target.value)}
        >
          <option value="">Durée</option>
          {[...new Set(talks.map((talk) => talk.durationMinutes))].map((d) => (
            <option key={d} value={d}>
              {d} min
            </option>
          ))}
        </select>
        <select
          className="rounded border px-2 py-1"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="">Niveau</option>
          {levels.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <select
          className="rounded border px-2 py-1"
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
        >
          <option value="">Salle</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <input
          className="rounded border px-2 py-1"
          min={new Date().toISOString().slice(0, 10)}
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {filteredScheduledTalks.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Aucun talk ne correspond aux filtres.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredScheduledTalks
            // .filter((st) => {
            //   const { talk } = st;
            .filter((talk) => {
              // const { talk } = st;
              if (session.data?.user.id === talk.speakerId) {
                return true;
              }
              return talk.status === 'accepted';
            })
            // .map(({ talk }) => (
            .map((talk) => (
              <Card key={talk.id} className="flex h-full flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{talk.title}</CardTitle>
                    <StatusBadge status={talk.status} />
                  </div>
                  <CardDescription className="text-muted-foreground flex space-x-2 text-sm">
                    <span>{talk.topic}</span>
                    <span>•</span>
                    <span>{levels.find((l) => l.value === talk.level)?.label}</span>
                    <span>•</span>
                    <span>{talk.durationMinutes} min</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3 text-sm">{talk.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex space-x-2">
                    {session.status === 'authenticated' &&
                      session.data?.user.id === talk.speakerId && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditTalk(talk)}>
                            <Pencil className="mr-1 h-4 w-4" /> Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTalk(talk)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                          </Button>
                        </>
                      )}
                  </div>
                  {talk.status === 'accepted' && (
                    <a href={getGoogleCalendarUrl(talk)} rel="noopener noreferrer" target="_blank">
                      <Button size="sm" variant="outline">
                        <CalendarPlus className="mr-1 h-4 w-4" /> Ajouter à Google Calendar
                      </Button>
                    </a>
                  )}
                </CardFooter>
              </Card>
            ))}
        </div>
      )}

      <TalkDialog
        isNew={isNewTalk}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        talk={currentTalk}
        onSave={saveTalk}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        talk={talkToDelete}
        onConfirm={confirmDeleteTalk}
      />
    </div>
  );
}
