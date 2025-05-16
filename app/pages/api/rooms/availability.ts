// pages/api/rooms/availability.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

// type Slot = {
//   id: number;
//   start_time: Date;
//   end_time: Date;
// };

// type RoomWithBookings = {
//   id: number;
//   name: string;
//   capacity: number;
//   schedules: Slot[];
// };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | {
        rooms: {
          roomId: number;
          name: string;
          capacity: number;
          availableSlots: {
            slotId: number;
            startTime: Date;
            endTime: Date;
          }[];
        }[];
      }
    | { error: string }
  >,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // ─── AUTHORIZATION ────────────────────────────────────────────────────────────
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id, 10) },
    include: { roles: true },
  });
  if (!user || user.roles.name !== 'organizer') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // ─── PARSE DATE PARAM ─────────────────────────────────────────────────────────
  // if ?date=YYYY-MM-DD is provided, use it; otherwise default to today
  const dateParam = typeof req.query.date === 'string' ? req.query.date : null;
  const day = dateParam ? new Date(dateParam) : new Date();
  // reset to midnight
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  // define your conference hours on *that* day
  const SLOT_START = new Date(day);
  SLOT_START.setHours(9, 0, 0, 0);
  const SLOT_END = new Date(day);
  SLOT_END.setHours(18, 0, 0, 0);

  // ─── FETCH BOOKINGS FOR THAT DAY ──────────────────────────────────────────────
  const roomsWithBookings = await prisma.rooms.findMany({
    select: {
      id: true,
      name: true,
      capacity: true,
      schedules: {
        where: {
          start_time: { gte: dayStart, lt: dayEnd },
        },
        select: { id: true, start_time: true, end_time: true },
        orderBy: { start_time: 'asc' },
      },
    },
  });

  // ─── BUILD EXACTLY 9 × 1-HOUR SLOTS (09–10, 10–11 … 17–18) ────────────────────
  const result = roomsWithBookings.map((room) => {
    const freeSlots: { slotId: number; startTime: Date; endTime: Date }[] = [];

    for (let i = 0; i < 9; i++) {
      const startTime = new Date(SLOT_START);
      startTime.setHours(9 + i);
      const endTime = new Date(SLOT_START);
      endTime.setHours(10 + i);

      // check overlap with any existing booking
      const occupied = room.schedules.some(
        (booking) => booking.start_time < endTime && booking.end_time > startTime,
      );

      if (!occupied) {
        freeSlots.push({
          slotId: i + 1, // 1..9 within each room
          startTime,
          endTime,
        });
      }
    }

    return {
      roomId: room.id,
      name: room.name,
      capacity: room.capacity,
      availableSlots: freeSlots,
    };
  });

  return res.status(200).json({ rooms: result });
}
