import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Room, ScheduledTalk } from '@/lib/types';

interface PlanningOverviewProps {
  rooms: Room[];
  scheduledTalks: ScheduledTalk[];
}

export default function PlanningOverview({ rooms, scheduledTalks }: PlanningOverviewProps) {
  const timeSlots = ['9:00', '10:15', '11:30', '13:30', '14:45', '16:00'];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Vue d'ensemble du planning</CardTitle>
        <CardDescription>
          Visualisez tous les talks programmés par jour et par salle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Salle / Heure</th>
                {timeSlots.map((time, index) => {
                  let endTime;
                  switch (index) {
                    case 0:
                      endTime = '10:00';
                      break;
                    case 1:
                      endTime = '11:15';
                      break;
                    case 2:
                      endTime = '12:30';
                      break;
                    case 3:
                      endTime = '14:30';
                      break;
                    case 4:
                      endTime = '15:45';
                      break;
                    default:
                      endTime = '17:00';
                  }
                  return (
                    <th key={index} className="border p-2">
                      {time} - {endTime}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="border p-2 font-medium">{room.name}</td>
                  {timeSlots.map((time, index) => {
                    // Trouver un talk programmé pour cette salle à ce créneau
                    const startTime = index === 0 ? '09:00' : time;
                    const scheduledTalk = scheduledTalks.find(
                      (st) => st.room.id === room.id && st.slot.startTime === startTime,
                    );

                    return (
                      <td key={index} className="border p-2">
                        {scheduledTalk ? (
                          <div className="rounded bg-blue-50 p-1 text-xs">
                            <div className="font-medium">{scheduledTalk.talk.title}</div>
                            <div className="text-muted-foreground">
                              {scheduledTalk.talk.durationMinutes} min
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-center text-xs">
                            Disponible
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
