'use client';

import { useEffect, useState } from 'react';
import type { Talk } from '@/lib/types';

interface Room {
  roomId: number;
  name: string;
}

interface ScheduledSlot {
  id: number;
  roomId: number;
  startTime: string;
  endTime: string;
  talk: Talk;
}

interface PlanningOverviewProps {
  rooms: Room[];
  date: Date;
}

export default function PlanningOverview({ rooms, date }: PlanningOverviewProps) {
  const [scheduledSlots, setScheduledSlots] = useState<ScheduledSlot[]>([]);
  const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // 09–10 … 17–18

  useEffect(() => {
    const dateParam = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
    fetch(`/api/schedules?date=${dateParam}`)
      .then((res) => {
        if (!res.ok) throw new Error('Impossible de charger le planning');
        return res.json();
      })
      .then((data: { schedules: ScheduledSlot[] }) => {
        // console.log('schedules from API:', data.schedules);
        setScheduledSlots(data.schedules);
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
      });
  }, [date]);

  return (
    <div className="mt-6 overflow-auto">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className="border bg-gray-100 p-2">Salle / Heure</th>
            {hours.map((h) => (
              <th key={h} className="border bg-gray-100 p-2 text-center">
                {`${h}:00–${h + 1}:00`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.roomId}>
              <td className="border p-2 font-medium">{room.name}</td>
              {hours.map((h) => {
                const slot = scheduledSlots.find(
                  (s) => s.roomId === room.roomId && new Date(s.startTime).getHours() === h,
                );
                return (
                  <td key={h} className="h-16 border p-1 align-top">
                    {slot ? (
                      <div className="rounded bg-blue-50 p-1 text-sm">
                        <strong className="block truncate">{slot.talk.title}</strong>
                        <span className="text-xs">Speaker #{slot.talk.speakerId}</span>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
