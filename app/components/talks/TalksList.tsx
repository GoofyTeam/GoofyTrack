// components/talks/TalksList.tsx
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
import { Talk } from '@/lib/types';
import { isOrganizer, isSpeaker } from '@/utils/auth.utils';
import { Pencil, Plus, Trash2, CalendarPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import DeleteDialog from './DeleteDialog';
import StatusBadge from './StatusBadge';
import TalkDialog from './TalkDialog';

interface TalksListProps {
  talks: Talk[];
  onAddTalk: (talk: Omit<Talk, 'id'>) => void;
  onUpdateTalk: (talk: Talk) => void;
  onDeleteTalk: (talkId: string) => void;
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

export default function TalksList({
  talks,
  onAddTalk,
  onUpdateTalk,
  onDeleteTalk,
}: TalksListProps) {
  const session = useSession();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTalk, setCurrentTalk] = useState<Talk | null>(null);
  const [talkToDelete, setTalkToDelete] = useState<Talk | null>(null);
  const [isNewTalk, setIsNewTalk] = useState(true);

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
        <h2 className="text-xl font-semibold">Tous les talks</h2>
        {session.data?.user &&
          (isOrganizer(session.data.user.roleId) || isSpeaker(session.data.user.roleId)) && (
            <Button onClick={handleCreateTalk}>
              <Plus className="mr-2 h-4 w-4" /> Nouveau Talk
            </Button>
          )}
      </div>

      {talks.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Aucun talk n'a été créé. Commencez par ajouter un nouveau talk.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {talks
            .filter((talk) => {
              if (session.data?.user.id === talk.speakerId) {
                return true;
              }

              return talk.status === 'accepted';
            })
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

      {/* Dialog for create/edit */}
      <TalkDialog
        isNew={isNewTalk}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        talk={currentTalk}
        onSave={saveTalk}
      />

      {/* Dialog for delete confirmation */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        talk={talkToDelete}
        onConfirm={confirmDeleteTalk}
      />
    </div>
  );
}
