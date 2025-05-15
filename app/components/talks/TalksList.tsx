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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { levels } from '@/lib/mock-data';
import { Talk, TalkStatus } from '@/lib/types';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import DeleteDialog from './DeleteDialog';
import StatusBadge from './StatusBadge';
import TalkDialog from './TalkDialog';

type UserRole = 'USER' | 'SPEAKER' | 'ADMIN';

interface TalksListProps {
  talks: Talk[];
  onAddTalk: (talk: Omit<Talk, 'id'>) => void;
  onUpdateTalk: (talk: Talk) => void;
  onDeleteTalk: (talkId: string) => void;
  onChangeTalkStatus: (talkId: string, newStatus: TalkStatus) => void;
}

const isAdmin = (role?: UserRole) => role === 'ADMIN';
const isSpeaker = (role?: UserRole) => role === 'SPEAKER';

export default function TalksList({
  talks,
  onAddTalk,
  onUpdateTalk,
  onDeleteTalk,
  onChangeTalkStatus,
}: TalksListProps) {
  const session = useSession();
  const userRole = session.data?.user?.role as UserRole | undefined;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTalk, setCurrentTalk] = useState<Talk | null>(null);
  const [talkToDelete, setTalkToDelete] = useState<Talk | null>(null);
  const [isNewTalk, setIsNewTalk] = useState(true);

  /* ---------- handlers ---------- */
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tous les talks</h2>
        {session.status === 'authenticated' &&
          session.data?.user &&
          (isAdmin(userRole) || isSpeaker(userRole)) && (
            <Button onClick={handleCreateTalk}>
              <Plus className="mr-2 h-4 w-4" /> Nouveau talk
            </Button>
          )}
        <Button onClick={handleCreateTalk}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau talk
        </Button>
      </div>

      {talks.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Aucun talk n&apos;a été créé. Commencez par ajouter un nouveau talk.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {talks
            .filter((talk) => {
              if (session.status !== 'authenticated') {
                return talk.status === 'accepted';
              }

              if (isAdmin(userRole) || session.data?.user.id === talk.speakerId) {
                return true; // admins see everything, speakers see their own
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

                  {session.status === 'authenticated' &&
                    talk.status === 'pending' &&
                    isAdmin(userRole) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="secondary">
                            Statut
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onChangeTalkStatus(talk.id, 'accepted')}>
                            <Check className="mr-2 h-4 w-4" /> Accepter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onChangeTalkStatus(talk.id, 'refused')}>
                            <X className="mr-2 h-4 w-4" /> Refuser
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
