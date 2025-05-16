'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { durations, emptyTalk, levels } from '@/lib/mock-data';
import { Talk, TalkLevel } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';

// form subjects (must match your DB subjects.name)
export const subjects = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Prisma',
  'GraphQL',
  'DevOps',
  'Architecture',
  'UX/UI',
  'Mobile',
  'Security',
  'Testing',
  'Performance',
  'Accessibility',
];

interface TalkDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  talk: Talk | null;
  isNew: boolean;
  onSave: (talk: Talk) => void;
}

export default function TalkDialog({ isOpen, setIsOpen, talk, isNew, onSave }: TalkDialogProps) {
  const { data: session } = useSession();
  const [currentTalk, setCurrentTalk] = useState<Omit<Talk, 'id'>>(emptyTalk);

  useEffect(() => {
    if (!isOpen) return;
    if (!session?.user?.id) throw new Error('User ID is required');
    setCurrentTalk(
      isNew ? { ...emptyTalk, speakerId: Number(session.user.id) } : { ...(talk as Talk) },
    );
  }, [isOpen, isNew, talk, session]);

  const handleInputChange = (field: keyof Omit<Talk, 'id'>, value: string | number | TalkLevel) => {
    setCurrentTalk({ ...currentTalk, [field]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      title: currentTalk.title,
      description: currentTalk.description,
      topic: currentTalk.topic,
      durationMinutes: currentTalk.duration,
      level: currentTalk.level,
    };

    // Choose POST for new, PUT for existing
    const url = isNew ? '/api/talks' : `/api/talks/${talk?.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Unknown error');
      }
      const saved = await response.json();
      onSave(saved);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to save talk:', err);
    }
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
              <Label htmlFor="subject">Sujet</Label>
              <Select
                value={currentTalk.topic}
                required
                onValueChange={(v) => handleInputChange('topic', v)}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Sélectionner un sujet" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
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
                onValueChange={(v) => handleInputChange('level', v as TalkLevel)}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée</Label>
              <Select
                value={currentTalk.duration != null ? currentTalk.duration.toString() : ''}
                required
                onValueChange={(v) => handleInputChange('duration', parseInt(v, 10))}
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Sélectionner une durée" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.label}
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
