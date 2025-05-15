import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

function DarkModeButton() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // On mount, check localStorage or system preference
    const stored = localStorage.getItem('theme');
    if (
      stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Button aria-label="Toggle dark mode" size="icon" variant="ghost" onClick={toggleDark}>
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

export default function Header() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Goofy Talk</h1>
      <div className="flex items-center gap-2">
        <DarkModeButton />
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
