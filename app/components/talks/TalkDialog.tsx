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
import { Talk, TalkLevel } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';

const durations = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 heure' },
  { value: 120, label: '2 heures' },
  { value: 180, label: '3 heures' },
  { value: 240, label: '4 heures' },
  { value: 300, label: '5 heures' },
  { value: 360, label: '6 heures' },
  { value: 420, label: '7 heures' },
  { value: 480, label: '8 heures' },
  { value: 540, label: '9 heures' },
  { value: 600, label: '10 heures' },
  { value: 660, label: '11 heures' },
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
  const emptyTalk = {
    id: 0,
    title: '',
    description: '',
    topic: '',
    duration: 30,
    level: 'beginner',
    speakerId: 0,
  };
  const [currentTalk, setCurrentTalk] = useState(emptyTalk);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<{ value: TalkLevel; label: string }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (!session?.user?.id) throw new Error('User ID is required');
    if (isNew) {
      setCurrentTalk({ ...emptyTalk, speakerId: Number(session.user.id) });
    } else if (talk) {
      setCurrentTalk({
        id: talk.id,
        title: talk.title,
        description: talk.description,
        topic: talk.subjects?.name || '',
        duration: talk.duration,
        level: talk.level,
        speakerId: talk.speakerId,
      });
    } else {
      setCurrentTalk(emptyTalk);
    }

    // Fetch subjects
    fetch('/api/references/subjects')
      .then((res) => res.json())
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => setSubjects([]));
    // Fetch levels
    fetch('/api/references/talkLevels')
      .then((res) => res.json())
      .then((data) => setLevels(Array.isArray(data) ? data : []))
      .catch(() => setLevels([]));
  }, [isOpen, isNew, talk, session]);

  const handleInputChange = (field: string, value: string | number | TalkLevel) => {
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
