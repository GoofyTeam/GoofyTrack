import Header from '@/components/header';
import PendingTalksList from '@/components/talks/PendingTalksList';
import TalksList from '@/components/talks/TalksList';
import TalksSchedule from '@/components/talks/TalksSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockData } from '@/lib/mock-data';
import { ScheduledTalk, Talk } from '@/lib/types';
import { isOrganizer } from '@/utils/auth.utils';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TalksPage() {
  const session = useSession();

  const [talks, setTalks] = useState<Talk[]>(mockData.talks);
  const [scheduledTalks, setScheduledTalks] = useState<ScheduledTalk[]>([]);

  // Fonction pour programmer un talk
  const scheduleTalk = (talkId: string, slotId: string) => {
    // Trouver le talk et le slot sélectionnés
    const talk = talks.find((t) => t.id === talkId);
    const slot = mockData.slots.find((s) => s.id === slotId);

    if (!talk || !slot) return;

    // Pour le MVP, on met à jour localement
    const updatedTalk = { ...talk, status: 'scheduled' as const };
    const updatedSlot = { ...slot, talkId: talk.id };

    // Mettre à jour les états locaux
    setTalks(talks.map((t) => (t.id === talk.id ? updatedTalk : t)));
    setScheduledTalks([
      ...scheduledTalks,
      {
        talk: updatedTalk,
        slot: updatedSlot,
        room: mockData.rooms.find((r) => r.id === slot.roomId)!,
      },
    ]);

    return { updatedTalk, updatedSlot };
  };

  // Fonctions pour gérer les talks
  const addTalk = (newTalk: Omit<Talk, 'id'>) => {
    const talkWithId = {
      ...newTalk,
      id: Date.now().toString(),
    } as Talk;

    setTalks([...talks, talkWithId]);
  };

  const updateTalk = (updatedTalk: Talk) => {
    setTalks(talks.map((t) => (t.id === updatedTalk.id ? updatedTalk : t)));
  };

  const deleteTalk = (talkId: string) => {
    setTalks(talks.filter((t) => t.id !== talkId));
  };

  const changeTalkStatus = (talkId: string, newStatus: Talk['status']) => {
    setTalks(talks.map((t) => (t.id === talkId ? { ...t, status: newStatus } : t)));
  };

  return (
    <div className="container mx-auto space-y-8 p-4">
      <Header />

      <Tabs defaultValue="talks">
        {isOrganizer(session.data?.user?.roleId) && (
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="talks">Tous les talks</TabsTrigger>
            <TabsTrigger value="pending">Tous les talks en attente</TabsTrigger>
            <TabsTrigger value="schedule">Planification</TabsTrigger>
          </TabsList>
        )}

        {/* Tab: Liste des talks */}
        <TabsContent value="talks">
          <TalksList
            talks={talks}
            onAddTalk={addTalk}
            onDeleteTalk={deleteTalk}
            onUpdateTalk={updateTalk}
          />
        </TabsContent>

        {/* Tab: Liste des talks */}
        <TabsContent value="pending">
          <PendingTalksList
            talks={talks}
            onAddTalk={addTalk}
            onChangeTalkStatus={changeTalkStatus}
            onDeleteTalk={deleteTalk}
            onUpdateTalk={updateTalk}
          />
        </TabsContent>

        {/* Tab: Planification */}
        <TabsContent value="schedule">
          <TalksSchedule
            rooms={mockData.rooms}
            scheduledTalks={scheduledTalks}
            slots={mockData.slots}
            talks={talks.filter((talk) => talk.status === 'accepted')}
            onScheduleTalk={scheduleTalk}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
