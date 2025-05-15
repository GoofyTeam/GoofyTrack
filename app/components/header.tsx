import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Goofy Talk</h1>
      <div className="flex gap-2">
        {status === 'unauthenticated' ? (
          <Button
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Login
          </Button>
        ) : (
          <>
            {session?.user && (
              <span className="mr-4 flex items-center">
                {session.user.name || session.user.email}
              </span>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
