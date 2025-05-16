// components/talks/PendingTalksList.tsx
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
import { Talk, TalkStatus } from '@/lib/types';
import { isOrganizer, isSpeaker } from '@/utils/auth.utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import DeleteDialog from './DeleteDialog';
import StatusBadge from './StatusBadge';
import StatusDialog from './StatusDialog';
import TalkDialog from './TalkDialog';

interface PendingTalksListProps {
  talks: Talk[];
  onAddTalk: (talk: Omit<Talk, 'id'>) => void;
  onUpdateTalk: (talk: Talk) => void;
  onDeleteTalk: (talkId: string) => void;
  onChangeTalkStatus: (
    talkId: string,
    newStatus: TalkStatus,
    details?: {
      startDate?: Date;
      endDate?: Date;
      roomId?: string;
    },
  ) => void;
}

export default function PendingTalksList({
  talks,
  onAddTalk,
  onUpdateTalk,
  onDeleteTalk,
  onChangeTalkStatus,
}: PendingTalksListProps) {
  const session = useSession();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [currentTalk, setCurrentTalk] = useState<Talk | null>(null);
  const [talkToDelete, setTalkToDelete] = useState<Talk | null>(null);
  const [talkToChangeStatus, setTalkToChangeStatus] = useState<Talk | null>(null);
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

  const handleChangeStatus = (talk: Talk) => {
    setTalkToChangeStatus(talk);
    setIsStatusDialogOpen(true);
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
      // Remove id for onAddTalk, as it expects Omit<Talk, 'id'>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...talkWithoutId } = talk;
      onAddTalk(talkWithoutId);
    } else {
      onUpdateTalk(talk);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tous les talks en attente</h2>
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
            .filter((talk) => talk.status === 'pending')
            .map((talk) => (
              <Card key={talk.id} className="flex h-full flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{talk.title}</CardTitle>
                    <StatusBadge status={talk.status} />
                  </div>
                  <CardDescription className="text-muted-foreground flex space-x-2 text-sm">
                    <span>{talk.subjects?.name}</span>
                    <span>•</span>
                    <span>{talk.level}</span>
                    <span>•</span>
                    <span>{talk.duration} min</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3 text-sm">{talk.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex space-x-2">
                    {session.status === 'authenticated' &&
                      String(session.data?.user.id) === String(talk.speakerId) && (
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

                  {/* Bouton pour ouvrir la modale de changement de statut - sans condition */}
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    size="sm"
                    variant="default"
                    onClick={() => handleChangeStatus(talk)}
                  >
                    Changer le statut
                  </Button>
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

      {/* Dialog for status change */}
      <StatusDialog
        isOpen={isStatusDialogOpen}
        setIsOpen={setIsStatusDialogOpen}
        talk={talkToChangeStatus}
        onChangeTalkStatus={onChangeTalkStatus}
      />
    </div>
  );
}
