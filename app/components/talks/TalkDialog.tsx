// components/talks/TalkDialog.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { topics, levels, durations, emptyTalk } from '@/lib/mock-data';
import { Talk, TalkLevel } from '@/lib/types';
import { useSession } from 'next-auth/react';

interface TalkDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  talk: Talk | null;
  isNew: boolean;
  onSave: (talk: Omit<Talk, 'id'> & { id?: string }) => void;
}

export default function TalkDialog({ isOpen, setIsOpen, talk, isNew, onSave }: TalkDialogProps) {
  const session = useSession();
  const [currentTalk, setCurrentTalk] = useState<Omit<Talk, 'id'> & { id?: string }>(emptyTalk);

  useEffect(() => {
    if (isOpen) {
      if (!session.data?.user.id) throw new Error('User ID is required');

      setCurrentTalk(isNew ? { ...emptyTalk, speakerId: session.data.user.id } : { ...talk! });
    }
  }, [isOpen, isNew, talk]);

  const handleInputChange = (field: keyof Talk, value: string | number | TalkLevel) => {
    setCurrentTalk({
      ...currentTalk,
      [field]: value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(currentTalk);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isNew ? 'Créer un nouveau talk' : 'Modifier le talk'}</DialogTitle>
            <DialogDescription>
              {isNew
                ? 'Remplissez le formulaire pour proposer un nouveau talk.'
                : 'Modifiez les informations du talk.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Titre du talk"
                value={currentTalk.title}
                required
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Sujet</Label>
              <Select
                value={currentTalk.topic}
                required
                onValueChange={(value) => handleInputChange('topic', value)}
              >
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Sélectionner un sujet" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Niveau</Label>
              <Select
                value={currentTalk.level}
                required
                onValueChange={(value) => handleInputChange('level', value as TalkLevel)}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée</Label>
              <Select
                value={currentTalk.durationMinutes.toString()}
                required
                onValueChange={(value) => handleInputChange('durationMinutes', parseInt(value))}
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Sélectionner une durée" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value.toString()}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée du talk"
                rows={4}
                value={currentTalk.description}
                required
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
