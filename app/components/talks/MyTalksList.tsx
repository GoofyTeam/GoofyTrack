// components/talks/MyTalksList.tsx
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
import { Talk, Room } from '@/lib/types';
import { Pencil, Plus, Trash2, CalendarPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useMemo } from 'react';
import DeleteDialog from './DeleteDialog';
import StatusBadge from './StatusBadge';
import TalkDialog from './TalkDialog';

interface MyTalksListProps {
  talks: Talk[];
  onAddTalk: (talk: Omit<Talk, 'id'>) => void;
  onUpdateTalk: (talk: Talk) => void;
  onDeleteTalk: (talkId: string) => void;
}

// Helper to generate Google Calendar event link
function getGoogleCalendarUrl(talk: Talk) {
  // For demo, use current date/time as start, and add duration
  const start = new Date();
  const end = new Date(start.getTime() + (talk.duration || 30) * 60000);

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

export default function MyTalksList({
  talks,
  onAddTalk,
  onUpdateTalk,
  onDeleteTalk,
}: MyTalksListProps) {
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

  const filteredScheduledTalks = useMemo(() => {
    return talks.filter((talk) => {
      let ok = true;
      if (filterTopic && talk.subjects?.name !== filterTopic) ok = false;
      if (filterDuration && String(talk.duration) !== filterDuration) ok = false;
      if (filterLevel && talk.level !== filterLevel) ok = false;
      return ok;
    });
    // }, [scheduledTalks, filterTopic, filterDuration, filterLevel, filterRoom, filterDate]);
  }, [talks, filterTopic, filterDuration, filterLevel, filterRoom]);

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
      onDeleteTalk(talkToDelete.id.toString());
      setIsDeleteDialogOpen(false);
      setTalkToDelete(null);
    }
  };

  const saveTalk = (talk: Talk) => {
    if (isNewTalk) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...talkWithoutId } = talk;
      onAddTalk(talkWithoutId);
    } else {
      onUpdateTalk(talk);
    }
    setIsDialogOpen(false);
  };

  const [levels, rooms, topics] = useMemo(() => {
    const uniqueLevels = Array.from(new Set(talks.map((talk) => talk.level)));
    const uniqueTopics = Array.from(new Set(talks.map((talk) => talk.subjects?.name)));

    const allSchedules = talks.flatMap((talk) => talk.schedules || []);
    const uniqueRoomIds = new Set<number>();
    allSchedules.forEach((schedule) => {
      if (schedule.room_id) {
        uniqueRoomIds.add(schedule.room_id);
      }
    });
    const uniqueRooms = Array.from(uniqueRoomIds);

    return [uniqueLevels, uniqueRooms, uniqueTopics];
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tous mes talks</h2>
        <Button onClick={handleCreateTalk}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Talk
        </Button>
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
          {[...new Set(talks.map((talk) => talk.duration))].map((d) => (
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
            <option key={l} value={l}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
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
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
      </div>

      {filteredScheduledTalks.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Aucun talk ne correspond aux filtres.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredScheduledTalks.map((talk) => (
            <Card key={talk.id} className="flex h-full flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{talk.title}</CardTitle>
                  <StatusBadge status={talk.status} />
                </div>
                <CardDescription className="text-muted-foreground flex space-x-2 text-sm">
                  <span>{talk.subjects?.name}</span>
                  <span>•</span>
                  <span>{talk.level.charAt(0).toUpperCase() + talk.level.slice(1)}</span>
                  <span>•</span>
                  <span>{talk.duration} min</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3 text-sm">{talk.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                {talk.speakerId.toString() === session.data?.user.id && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditTalk(talk)}>
                      <Pencil className="mr-1 h-4 w-4" /> Modifier
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteTalk(talk)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                )}
                {talk.status === 'scheduled' && (
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
