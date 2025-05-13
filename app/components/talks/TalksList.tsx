// components/talks/TalksList.tsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TalkDialog from './TalkDialog';
import DeleteDialog from './DeleteDialog';
import StatusBadge from './StatusBadge';
import { levels } from '@/lib/mock-data';
import { Talk, TalkStatus } from '@/lib/types';

interface TalksListProps {
  talks: Talk[];
  onAddTalk: (talk: Omit<Talk, 'id'>) => void;
  onUpdateTalk: (talk: Talk) => void;
  onDeleteTalk: (talkId: string) => void;
  onChangeTalkStatus: (talkId: string, newStatus: TalkStatus) => void;
}

export default function TalksList({
  talks,
  onAddTalk,
  onUpdateTalk,
  onDeleteTalk,
  onChangeTalkStatus,
}: TalksListProps) {
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
        <Button onClick={handleCreateTalk}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Talk
        </Button>
      </div>

      {talks.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Aucun talk n'a été créé. Commencez par ajouter un nouveau talk.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {talks.map((talk) => (
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
                  <Button size="sm" variant="outline" onClick={() => handleEditTalk(talk)}>
                    <Pencil className="mr-1 h-4 w-4" /> Modifier
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteTalk(talk)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                  </Button>
                </div>

                {talk.status === 'pending' && (
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
