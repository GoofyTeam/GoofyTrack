// components/talks/DeleteDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Talk } from '@/lib/types';

interface DeleteDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  talk: Talk | null;
  onConfirm: () => void;
}

export default function DeleteDialog({ isOpen, setIsOpen, talk, onConfirm }: DeleteDialogProps) {
  if (!talk) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le talk "{talk?.title}" ? Cette action ne peut pas
            être annulée.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
