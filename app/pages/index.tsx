import { useEffect, useState } from 'react';
import Header from '@/components/header';
import PendingTalksList from '@/components/talks/PendingTalksList';
import TalksList from '@/components/talks/TalksList';
import TalksSchedule from '@/components/talks/TalksSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Talk, TalkStatus } from '@/lib/types';
import { isOrganizer, isSpeaker } from '@/utils/auth.utils';
import { useSession } from 'next-auth/react';

export default function TalksPage() {
  const { data: session, status } = useSession();
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // wait until Next-Auth has resolved
    if (status === 'loading') return;

    const fetchTalks = async () => {
      setLoading(true);
      setError(null);

      let endpoint = '/api/talks';
      if (isSpeaker(session?.user.roleId) || isOrganizer(session?.user.roleId)) {
        endpoint = '/api/talks/me';
      }

      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const { talks: fetched } = await res.json();
        setTalks(fetched);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err);
          setError(err.message);
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTalks();
  }, [status, session?.user.roleId]);

  // Fonction pour programmer un talk
  const scheduleTalk = (talkId: string) => {
    const talk = talks.find((t) => String(t.id) === talkId);

    if (!talk) return;

    const updatedTalk = { ...talk, status: 'scheduled' as const };

    setTalks((prev) => prev.map((t) => (t.id === talk.id ? updatedTalk : t)));
  };

  // Fonctions pour gérer les talks
  const addTalk = (newTalk: Omit<Talk, 'id'>) => {
    const talkWithId = {
      ...newTalk,
      id: Date.now(),
    } as Talk;
    setTalks((prev) => [...prev, talkWithId]);
  };

  const updateTalk = (updatedTalk: Talk) => {
    setTalks((prev) => prev.map((t) => (t.id === updatedTalk.id ? updatedTalk : t)));
  };

  const deleteTalk = async (talkId: string) => {
    const res = await fetch(`/api/talks/${talkId}`, { method: 'DELETE' });
    if (res.ok) {
      setTalks((prev) => prev.filter((t) => String(t.id) !== talkId));
    } else {
      const err = await res.json();
      console.error('Failed to delete talk:', err.error);
    }
  };

  async function changeTalkStatus(talkId: string, newStatus: TalkStatus) {
    const res = await fetch(`/api/talks/${talkId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error('Failed to change talk status:', error.error);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto space-y-8 p-4">
        <Header />
        <div className="flex h-96 items-center justify-center">
          <div>Loading talks...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto space-y-8 p-4">
        <Header />
        <div className="flex h-96 items-center justify-center">
          <div>Error loading talks: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 p-4">
      <Header />

      <Tabs defaultValue="talks">
        {isOrganizer(session?.user?.roleId) && (
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="talks">Tous les talks</TabsTrigger>
            <TabsTrigger value="pending">Tous les talks en attente</TabsTrigger>
            <TabsTrigger value="schedule">
              Planification
              <span
                className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  talks.filter((talk) => talk.status === 'accepted').length === 0
                    ? 'bg-gray-400 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {talks.filter((talk) => talk.status === 'accepted').length}
              </span>
            </TabsTrigger>
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

        {/* Tab: Liste des talks en attente */}
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
            talks={talks.filter((talk) => talk.status === 'accepted')}
            onScheduleTalk={scheduleTalk}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
