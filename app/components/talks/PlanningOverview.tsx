import React, { useState, useEffect, useMemo } from 'react';

// Define types for schedule and nested room
export interface Room {
  id: number;
  name: string;
  capacity: number;
  description: string;
  created_at: string;
}

export interface ScheduledSlot {
  id: number;
  talk_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  rooms: Room;
}

const PlanningTable: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scheduledSlots, setScheduledSlots] = useState<ScheduledSlot[]>([]);

  // Fetch rooms on mount
  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => {
        if (!res.ok) throw new Error('Impossible de charger les salles');
        return res.json();
      })
      .then((data: { rooms: Room[] }) => {
        setRooms(data.rooms);
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
      });
  }, []);

  // Fetch schedules whenever the date changes
  useEffect(() => {
    const dateParam = date.toISOString().slice(0, 10);
    fetch(`/api/schedules?date=${dateParam}`)
      .then((res) => {
        if (!res.ok) throw new Error('Impossible de charger le planning');
        return res.json();
      })
      .then((data: { schedules: ScheduledSlot[] }) => {
        setScheduledSlots(data.schedules);
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
      });
  }, [date]);

  // Build all possible timeslots from 09:00 to 19:00
  const timeSlots = useMemo(() => {
    const slots: { start: Date; end: Date; label: string }[] = [];
    const day = date.toISOString().slice(0, 10);
    for (let hour = 9; hour < 19; hour++) {
      const start = new Date(`${day}T${String(hour).padStart(2, '0')}:00:00`);
      const end = new Date(`${day}T${String(hour + 1).padStart(2, '0')}:00:00`);
      const startLabel = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
      const endLabel = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      const label = `${startLabel} - ${endLabel}`;
      slots.push({ start, end, label });
    }
    return slots;
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(new Date(e.target.value));
  };

  return (
    <div className="p-4 overflow-auto">
      <div className="mb-4">
        <label htmlFor="schedule-date" className="mr-2 font-medium">Date:</label>
        <input
          id="schedule-date"
          type="date"
          value={date.toISOString().slice(0, 10)}
          onChange={handleDateChange}
          className="border rounded px-2 py-1"
        />
      </div>

      <table className="border min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Salle</th>
            {timeSlots.map((slot) => (
              <th key={slot.label} className="px-4 py-2 text-xs font-medium uppercase tracking-wider">
                {slot.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{room.name}</td>
              {timeSlots.map((slot) => {
                const match = scheduledSlots.find((s) => {
                  const slotStart = new Date(s.start_time);
                  return (
                    s.room_id === room.id &&
                    slotStart.getFullYear() === slot.start.getFullYear() &&
                    slotStart.getMonth() === slot.start.getMonth() &&
                    slotStart.getDate() === slot.start.getDate() &&
                    slotStart.getHours() === slot.start.getHours()
                  );
                });
                return (
                  <td key={`${room.id}-${slot.label}`} className="px-4 py-2 whitespace-nowrap text-sm">
                    {match ? match.talk_id : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanningTable;
