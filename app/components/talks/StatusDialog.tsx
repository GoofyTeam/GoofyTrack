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
import { Talk, TalkStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

interface StatusDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  talk: Talk | null;
  onChangeTalkStatus: (talkId: string, newStatus: TalkStatus) => void;
}

export default function StatusDialog({
  isOpen,
  setIsOpen,
  talk,
  onChangeTalkStatus,
}: StatusDialogProps) {
  // const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  // const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
  // const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<TalkStatus>('pending');

  const handleStatusChange = (status: TalkStatus) => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    if (talk) {
      onChangeTalkStatus(String(talk.id), selectedStatus);
      setIsOpen(false);
      // Reset state
      // setSelectedStartDate(undefined);
      // setSelectedEndDate(undefined);
      // setSelectedRoom('');
      setSelectedStatus('pending');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Changer le statut du talk</DialogTitle>
          <DialogDescription>{talk?.title}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              className={cn(selectedStatus === 'accepted' && 'bg-green-600 hover:bg-green-700')}
              variant={selectedStatus === 'accepted' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('accepted')}
            >
              <Check className="mr-2 h-4 w-4" /> Accepter
            </Button>
            <Button
              className={cn(selectedStatus === 'rejected' && 'bg-red-600 hover:bg-red-700')}
              variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('rejected')}
            >
              <X className="mr-2 h-4 w-4" /> Refuser
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Valider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
