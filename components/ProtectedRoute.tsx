import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        if (data?.session) {
          setSession(data.session);
        } else {
          window.location.replace('/login');
        }
        setIsLoading(false);
      }
    };

    // short delay to let Supabase restore from localStorage
    setTimeout(init, 400);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.replace('/login');
      else setSession(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-prox-dark-900">
        <p className="text-gray-700 dark:text-prox-text">Chargement...</p>
      </div>
    );
  }

  // ✅ When session ready, show the dashboard
  return <>{children}</>;
}
