'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOrganizer } from '@/utils/auth.utils';
import type { Talk } from '@/lib/types';
import PlanningOverview from './PlanningOverview';

//
// Define the shape coming back from /api/rooms/availability
//
export interface RoomWithSlots {
  roomId: number;
  name: string;
  capacity: number;
  availableSlots: Array<{
    slotId: number;
    startTime: string; // ISO string
    endTime: string; // ISO string
  }>;
}

interface Slot {
  slotId: string;
  roomId: string;
  date: string; // e.g. "Fri May 16 2025"
  startTime: string; // ISO
  endTime: string; // ISO
  // talkId?: string; // won’t be set here, these are all free slots
}

interface TalksScheduleProps {
  talks: Talk[];
  onScheduleTalk: (talkId: string, slotId: string) => void;
}

// interface ScheduledSlot {
//   id: number;
//   roomId: number;
//   startTime: string;
//   endTime: string;
//   talk: Talk;
// }

export default function TalksSchedule({ talks, onScheduleTalk }: TalksScheduleProps) {
  const session = useSession();

  // — your existing selects & flags —
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedTalk, setSelectedTalk] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  // const [scheduledSlots, setScheduledSlots] = useState<ScheduledSlot[]>([]);

  // — new state —
  const [rooms, setRooms] = useState<RoomWithSlots[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const [dateParam] = selectedDate.toISOString().split('T');
    Promise.all([
      fetch(`/api/rooms/availability?date=${dateParam}`).then((r) => r.json()),
      fetch(`/api/schedules?date=${dateParam}`).then((r) => r.json()),
      // .then((data: { schedules: ScheduledSlot[] }) => setScheduledSlots(data.schedules)),
    ]).catch((err) => {
      console.error(err);
      alert('Erreur de chargement');
    });
  }, [selectedDate]);

  // 1️⃣ Fetch rooms+slots once on mount
  useEffect(() => {
    const [dateParam] = selectedDate.toISOString().split('T'); // "2025-05-16"
    fetch(`/api/rooms/availability?date=${dateParam}`)
      .then((res) => {
        if (!res.ok) throw new Error('Impossible de charger les salles');
        return res.json();
      })
      .then((data: { rooms: RoomWithSlots[] }) => {
        setRooms(data.rooms);

        // Flatten into a single slots array for filtering
        const flat: Slot[] = data.rooms.flatMap((room) =>
          room.availableSlots.map((s) => ({
            slotId: s.slotId.toString(),
            roomId: room.roomId.toString(),
            date: new Date(s.startTime).toDateString(),
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        );
        setSlots(flat);
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
      });
  }, [selectedDate]);

  // 2️⃣ Compute availableSlots whenever date/room/slots change
  useEffect(() => {
    if (selectedDate && selectedRoom) {
      setAvailableSlots(
        slots.filter((s) => s.roomId === selectedRoom && s.date === selectedDate.toDateString()),
      );
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedRoom, slots]);

  const getSlotPlaceholder = (date: Date | null, roomId: string, slotsList: Slot[]): string => {
    if (!date || !roomId) {
      return "Sélectionnez d'abord une date et une salle";
    }
    return slotsList.length === 0 ? 'Aucun créneau disponible' : 'Sélectionner un créneau';
  };

  // 3️⃣ Schedule handler unchanged, except room lookup from our new rooms state
  const handleScheduleTalk = async () => {
    if (!selectedTalk || !selectedSlot) return;

    setIsScheduling(true);
    try {
      // find the slot object for its roomId, start/end
      const slot = availableSlots.find((s) => s.slotId === selectedSlot)!;
      const res = await fetch(`/api/talks/${selectedTalk}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: parseInt(slot.roomId, 10),
          startTime: slot.startTime,
          endTime: slot.endTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de la planification');
      }

      onScheduleTalk(selectedTalk, selectedSlot);

      const talk = talks.find((t) => t.id.toString() === selectedTalk)!;
      const room = rooms.find((r) => r.roomId === data.slot.roomId)!;

      alert(
        `Talk "${talk.title}" programmé le ${format(
          new Date(data.slot.startTime),
          'dd/MM/yyyy',
        )} de ${format(new Date(data.slot.startTime), 'HH:mm')} à ${format(
          new Date(data.slot.endTime),
          'HH:mm',
        )} dans ${room.name}`,
      );

      setSelectedTalk('');
      setSelectedSlot('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsScheduling(false);
    }
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
            {/* Talk select */}
            <div className="space-y-2">
              <Label htmlFor="talk">Talk à programmer</Label>
              <Select value={selectedTalk} onValueChange={setSelectedTalk}>
                <SelectTrigger id="talk">
                  <SelectValue placeholder="Sélectionner un talk" />
                </SelectTrigger>
                <SelectContent>
                  {talks.map((talk) => (
                    <SelectItem key={talk.id} value={talk.id.toString()}>
                      {talk.title} ({talk.durationMinutes} min) – {talk.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isOrganizer(session.data?.user.roleId) && (
              <>
                {/* Date picker */}
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
                        {format(selectedDate, 'PPP', { locale: fr })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => d && setSelectedDate(d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Room select */}
                <div className="space-y-2">
                  <Label htmlFor="room">Salle</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger id="room">
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.roomId} value={room.roomId.toString()}>
                          {room.name} (capacité : {room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Slot select */}
            <div className="space-y-2">
              <Label htmlFor="slot">Créneau horaire</Label>
              <Select
                value={selectedSlot}
                disabled={
                  !selectedDate || !selectedRoom || availableSlots.length === 0 || isScheduling
                }
                onValueChange={setSelectedSlot}
              >
                <SelectTrigger id="slot">
                  <SelectValue
                    placeholder={getSlotPlaceholder(selectedDate, selectedRoom, availableSlots)}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.slotId} value={slot.slotId}>
                      {format(new Date(slot.startTime), 'HH:mm')} –{' '}
                      {format(new Date(slot.endTime), 'HH:mm')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              disabled={!selectedTalk || !selectedSlot || isScheduling}
              onClick={handleScheduleTalk}
            >
              {isScheduling ? 'Programmation…' : 'Programmer le talk'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <PlanningOverview
        date={selectedDate}
        rooms={rooms.map(({ roomId, name }) => ({ roomId, name }))}
      />
    </div>
  );
}
