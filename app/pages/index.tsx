import Header from '@/components/header';
import PendingTalksList from '@/components/talks/PendingTalksList';
import TalksList from '@/components/talks/TalksList';
import TalksSchedule from '@/components/talks/TalksSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Room, ScheduledTalk, Slot, Talk } from '@/lib/types';
import { isOrganizer } from '@/utils/auth.utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TalksPage() {
  const session = useSession();
  const queryClient = useQueryClient();

  // Utiliser React Query pour les appels API
  const {
    data: talksData,
    isLoading: talksLoading,
    error: talksError,
  } = useQuery({
    queryKey: ['talks'],
    queryFn: () => axios.get('/api/talks').then((res) => res.data),
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 secondes
  });

  const {
    data: roomsData,
    isLoading: roomsLoading,
    error: roomsError,
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => axios.get('/api/references/rooms').then((res) => res.data),
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
  });

  const {
    data: slotsData,
    isLoading: slotsLoading,
    error: slotsError,
  } = useQuery({
    queryKey: ['slots'],
    queryFn: () => axios.get('/api/schedules/available-times').then((res) => res.data),
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    error: schedulesError,
  } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => axios.get('/api/schedules').then((res) => res.data),
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // États locaux pour la gestion des données
  const [talks, setTalks] = useState<Talk[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [scheduledTalks, setScheduledTalks] = useState<ScheduledTalk[]>([]);

  // Mettre à jour les états locaux quand les données sont chargées
  useEffect(() => {
    if (talksData) {
      const formattedTalks: Talk[] = talksData.map((talk: any) => ({
        id: talk.id.toString(),
        title: talk.title,
        topic: talk.subjects.name,
        description: talk.description,
        durationMinutes: talk.duration,
        level: talk.level.toLowerCase(),
        status: talk.status.toLowerCase(),
        speakerId: talk.speaker_id.toString(),
      }));
      setTalks(formattedTalks);
    }
  }, [talksData]);

  useEffect(() => {
    if (roomsData) {
      const formattedRooms: Room[] = roomsData.map((room: any) => ({
        id: room.id.toString(),
        name: room.name,
        capacity: room.capacity,
      }));
      setRooms(formattedRooms);
    }
  }, [roomsData]);

  useEffect(() => {
    if (slotsData) {
      const formattedSlots: Slot[] = slotsData.map((slot: any) => ({
        id: slot.id.toString(),
        date: new Date(slot.date),
        startTime: slot.start_time,
        endTime: slot.end_time,
        roomId: slot.room_id.toString(),
        talkId: slot.talk_id ? slot.talk_id.toString() : null,
      }));
      setSlots(formattedSlots);
    }
  }, [slotsData]);

  useEffect(() => {
    if (schedulesData && talks.length > 0 && rooms.length > 0) {
      const formatted: ScheduledTalk[] = schedulesData
        .map((schedule: any) => {
          const talk = talks.find((t) => t.id === schedule.talk_id.toString());
          const room = rooms.find((r) => r.id === schedule.room_id.toString());

          if (!talk || !room) return null;

          const slot: Slot = {
            id: schedule.id.toString(),
            date: new Date(schedule.start_time),
            startTime: new Date(schedule.start_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            endTime: new Date(schedule.end_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            roomId: schedule.room_id.toString(),
            talkId: schedule.talk_id.toString(),
          };

          return { talk, room, slot };
        })
        .filter(Boolean) as ScheduledTalk[];

      setScheduledTalks(formatted);
    }
  }, [schedulesData, talks, rooms]);

  // Gérer les états de chargement et d'erreur
  const isLoading = talksLoading || roomsLoading || slotsLoading || schedulesLoading;
  const isError = talksError || roomsError || slotsError || schedulesError;

  // Mutation pour programmer un talk
  const scheduleMutation = useMutation({
    mutationFn: async ({ talkId, slotId }: { talkId: string; slotId: string }) => {
      // Trouver le talk et le slot sélectionnés
      const talk = talks.find((t) => t.id === talkId);
      const slot = slots.find((s) => s.id === slotId);

      if (!talk || !slot) throw new Error('Talk ou slot non trouvé');

      // Appeler l'API pour programmer le talk
      const scheduleData = {
        talk_id: parseInt(talkId),
        room_id: parseInt(slot.roomId),
        start_time: slot.startTime,
        end_time: slot.endTime,
        date: slot.date,
      };

      // L'API schedules met déjà à jour le statut du talk à 'scheduled'
      const response = await axios.post(`/api/schedules`, scheduleData);
      return response.data;
    },
    onSuccess: () => {
      // Rafraîchir les données après une modification réussie
      queryClient.invalidateQueries({ queryKey: ['talks'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la programmation du talk:', error);
    },
  });

  const scheduleTalk = async (talkId: string, slotId: string) => {
    try {
      await scheduleMutation.mutateAsync({ talkId, slotId });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Mutation pour ajouter un talk
  const addTalkMutation = useMutation({
    mutationFn: async (newTalk: Omit<Talk, 'id'>) => {
      const talkData = {
        title: newTalk.title,
        description: newTalk.description,
        subject_id: parseInt(newTalk.topic), // L'API attend un ID numérique
        duration: newTalk.durationMinutes,
        level: newTalk.level.toUpperCase(),
      };

      const response = await axios.post('/api/talks', talkData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talks'] });
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout du talk:", error);
    },
  });

  const addTalk = async (newTalk: Omit<Talk, 'id'>) => {
    try {
      await addTalkMutation.mutateAsync(newTalk);
    } catch (error) {
      console.error("Erreur lors de l'ajout du talk:", error);
    }
  };

  // Mutation pour mettre à jour un talk
  const updateTalkMutation = useMutation({
    mutationFn: async (updatedTalk: Talk) => {
      const talkData = {
        title: updatedTalk.title,
        description: updatedTalk.description,
        subject_id: parseInt(updatedTalk.topic), // L'API attend un ID numérique
        duration: updatedTalk.durationMinutes,
        level: updatedTalk.level.toUpperCase(),
        status: updatedTalk.status,
      };

      const response = await axios.put(`/api/talks/${updatedTalk.id}`, talkData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talks'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du talk:', error);
    },
  });

  const updateTalk = async (updatedTalk: Talk) => {
    try {
      await updateTalkMutation.mutateAsync(updatedTalk);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du talk:', error);
    }
  };

  // Mutation pour supprimer un talk
  const deleteTalkMutation = useMutation({
    mutationFn: async (talkId: string) => {
      const response = await axios.delete(`/api/talks/${talkId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talks'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du talk:', error);
    },
  });

  const deleteTalk = async (talkId: string) => {
    try {
      await deleteTalkMutation.mutateAsync(talkId);
    } catch (error) {
      console.error('Erreur lors de la suppression du talk:', error);
    }
  };

  // Mutation pour changer le statut d'un talk
  const changeTalkStatusMutation = useMutation({
    mutationFn: async ({ talkId, newStatus }: { talkId: string; newStatus: Talk['status'] }) => {
      // Utiliser l'API appropriée selon le statut
      let response;
      if (newStatus === 'accepted') {
        response = await axios.put(`/api/talks/${talkId}/accept`);
      } else if (newStatus === 'refused') {
        response = await axios.put(`/api/talks/${talkId}/reject`);
      } else {
        response = await axios.put(`/api/talks/${talkId}`, { status: newStatus });
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talks'] });
    },
    onError: (error) => {
      console.error('Erreur lors du changement de statut du talk:', error);
    },
  });

  const changeTalkStatus = async (talkId: string, newStatus: Talk['status']) => {
    try {
      await changeTalkStatusMutation.mutateAsync({ talkId, newStatus });
    } catch (error) {
      console.error('Erreur lors du changement de statut du talk:', error);
    }
  };

  return (
    <div className="container mx-auto space-y-8 p-4">
      <Header />

      <Tabs defaultValue="talks">
        {/* Navigation différente selon le rôle */}
        <TabsList
          className={clsx(
            'grid w-full',
            isOrganizer(session.data?.user?.roleId) ? 'grid-cols-3' : 'grid-cols-1',
          )}
        >
          <TabsTrigger value="talks">Tous les talks</TabsTrigger>
          {isOrganizer(session.data?.user?.roleId) && (
            <>
              <TabsTrigger value="pending">Tous les talks en attente</TabsTrigger>
              <TabsTrigger value="schedule">Planification</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Tab: Liste des talks */}
        <TabsContent value="talks">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Chargement des données...</p>
            </div>
          ) : isError ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-red-500">Erreur lors du chargement des données</p>
            </div>
          ) : (
            <TalksList
              talks={talks}
              onAddTalk={addTalk}
              onDeleteTalk={deleteTalk}
              onUpdateTalk={updateTalk}
            />
          )}
        </TabsContent>

        {/* Tab: Liste des talks */}
        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Chargement des données...</p>
            </div>
          ) : isError ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-red-500">Erreur lors du chargement des données</p>
            </div>
          ) : (
            <PendingTalksList
              isLoading={changeTalkStatusMutation.isLoading}
              talks={talks.filter((talk) => talk.status === 'pending')}
              onAddTalk={addTalk}
              onChangeTalkStatus={changeTalkStatus}
              onDeleteTalk={deleteTalk}
              onUpdateTalk={updateTalk}
            />
          )}
        </TabsContent>

        {/* Tab: Planification */}
        <TabsContent value="schedule">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p>Chargement des données...</p>
            </div>
          ) : isError ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-red-500">Erreur lors du chargement des données</p>
            </div>
          ) : (
            <TalksSchedule
              rooms={rooms}
              scheduledTalks={scheduledTalks}
              slots={slots}
              talks={talks.filter((talk) => talk.status === 'accepted')}
              onScheduleTalk={scheduleTalk}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
