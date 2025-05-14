'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Room, ScheduledTalk, Slot, Talk } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isOrganizer } from '@/utils/auth.utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import PlanningOverview from './PlanningOverview';
import ScheduledTalksList from './ScheduledTalksList';

interface TalksScheduleProps {
  talks: Talk[];
  scheduledTalks: ScheduledTalk[];
  rooms: Room[];
  slots: Slot[];
  onScheduleTalk: (talkId: string, slotId: string) => void;
}

export default function TalksSchedule({
  talks,
  scheduledTalks,
  rooms,
  slots,
  onScheduleTalk,
}: TalksScheduleProps) {
  const session = useSession();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedTalk, setSelectedTalk] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  // Helper pour simplifier le placeholder du select des slots
  const getSlotPlaceholder = (date: Date | null, roomId: string, slots: Slot[]): string => {
    if (!date || !roomId) {
      return "Sélectionnez d'abord une date et une salle";
    }

    if (slots.length === 0) {
      return 'Aucun créneau disponible';
    }

    return 'Sélectionner un créneau';
  };

  // Filtrer les slots disponibles en fonction de la date et de la salle
  useEffect(() => {
    if (selectedDate && selectedRoom) {
      const filteredSlots = slots.filter(
        (slot) =>
          slot.roomId === selectedRoom &&
          slot.date.toDateString() === selectedDate.toDateString() &&
          !slot.talkId,
      );
      setAvailableSlots(filteredSlots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedRoom, slots]);

  const handleScheduleTalk = () => {
    if (!selectedTalk || !selectedSlot) return;

    onScheduleTalk(selectedTalk, selectedSlot);

    // Réinitialiser les sélections
    setSelectedTalk('');
    setSelectedSlot('');

    // Afficher un message de confirmation
    const talk = talks.find((t) => t.id === selectedTalk);
    const slot = slots.find((s) => s.id === selectedSlot);
    if (!talk || !slot) return;

    const room = rooms.find((r) => r.id === slot.roomId);
    if (!room) return;

    alert(
      `Talk "${talk.title}" programmé le ${format(slot.date, 'dd/MM/yyyy')} de ${slot.startTime} à ${slot.endTime} dans la ${room.name}`,
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Planification des talks</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Programmer un Talk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection du talk */}
            <div className="space-y-2">
              <Label htmlFor="talk">Talk à programmer</Label>
              <Select value={selectedTalk} onValueChange={setSelectedTalk}>
                <SelectTrigger id="talk">
                  <SelectValue placeholder="Sélectionner un talk" />
                </SelectTrigger>
                <SelectContent>
                  {talks.map((talk) => (
                    <SelectItem key={talk.id} value={talk.id}>
                      {talk.title} ({talk.durationMinutes} min) - {talk.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isOrganizer(session.data?.user.roleId) && (
              <>
                {/* Sélection de la date */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, 'PPP', { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        initialFocus
                        onSelect={(date) => date && setSelectedDate(date)}
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

            {/* Sélection du créneau */}
            <div className="space-y-2">
              <Label htmlFor="slot">Créneau horaire</Label>
              <Select
                disabled={!selectedDate || !selectedRoom || availableSlots.length === 0}
                value={selectedSlot}
                onValueChange={setSelectedSlot}
              >
                <SelectTrigger id="slot">
                  <SelectValue
                    placeholder={getSlotPlaceholder(selectedDate, selectedRoom, availableSlots)}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.startTime} - {slot.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              disabled={!selectedTalk || !selectedSlot}
              onClick={handleScheduleTalk}
            >
              Programmer le talk
            </Button>
          </CardContent>
        </Card>

        <ScheduledTalksList scheduledTalks={scheduledTalks} />
      </div>

      {/* Vue d'ensemble du planning */}
      <PlanningOverview rooms={rooms} scheduledTalks={scheduledTalks} />
    </div>
  );
}
