import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Talk, TalkStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Check, X } from 'lucide-react';
import { useState } from 'react';

interface StatusDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  talk: Talk | null;
  onChangeTalkStatus: (
    talkId: string,
    newStatus: TalkStatus,
    details?: {
      startDate?: Date;
      endDate?: Date;
      roomId?: string;
    },
  ) => void;
  rooms: { id: string; name: string; capacity: number }[];
}

export default function StatusDialog({
  isOpen,
  setIsOpen,
  talk,
  onChangeTalkStatus,
  rooms,
}: StatusDialogProps) {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<TalkStatus>('pending');

  const handleStatusChange = (status: TalkStatus) => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    if (talk) {
      onChangeTalkStatus(talk.id, selectedStatus, {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        roomId: selectedRoom,
      });
      setIsOpen(false);
      // Reset state
      setSelectedStartDate(undefined);
      setSelectedEndDate(undefined);
      setSelectedRoom('');
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
              className={cn(selectedStatus === 'refused' && 'bg-red-600 hover:bg-red-700')}
              variant={selectedStatus === 'refused' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('refused')}
            >
              <X className="mr-2 h-4 w-4" /> Refuser
            </Button>
          </div>

          {selectedStatus === 'accepted' && (
            <>
              {/* Sélection de la date de début */}
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedStartDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedStartDate ? (
                        format(selectedStartDate, 'PPP', { locale: fr })
                      ) : (
                        <span>Choisir une date de début</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedStartDate}
                      initialFocus
                      onSelect={(date) => date && setSelectedStartDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Sélection de la date de fin */}
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedEndDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedEndDate ? (
                        format(selectedEndDate, 'PPP', { locale: fr })
                      ) : (
                        <span>Choisir une date de fin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      disabled={(date) => (selectedStartDate ? date < selectedStartDate : false)}
                      mode="single"
                      selected={selectedEndDate}
                      initialFocus
                      onSelect={(date) => date && setSelectedEndDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Sélection de la salle */}
              <div className="space-y-2">
                <Label htmlFor="room">Salle</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Sélectionner une salle" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} (capacité: {room.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
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
