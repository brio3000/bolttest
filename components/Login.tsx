import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BriefcaseIcon } from './Icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // ✅ Check for existing session (on first load)
  useEffect(() => {
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erreur de session:', error);
      }
      if (data?.session) {
        console.log('✅ Session existante, redirection vers Dashboard');
        window.location.replace('/Dashboard');
      }
      setCheckingSession(false);
    };

    // Wait a bit for Supabase local session to load
    setTimeout(initSession, 400);

    // ✅ Listen for auth state changes (after login/signup)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        console.log('✅ Connecté, redirection vers Dashboard');
        window.location.replace('/Dashboard');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Handle login or signup
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Create user directly without email confirmation
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: undefined },
        });
        if (signUpError) throw signUpError;

        // Auto-login after signup
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      } else {
        // Regular login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // 🕒 While checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-prox-dark-900">
        <p className="text-gray-700 dark:text-prox-text">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-prox-dark-900">
      <div className="max-w-md w-full bg-white dark:bg-prox-dark-800 shadow-2xl rounded-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <BriefcaseIcon className="mx-auto h-24 w-auto text-brand-primary" />
            <h2 className="text-3xl font-bold mt-4 text-brand-secondary dark:text-prox-text">
              PkiGest Pro
            </h2>
            <p className="text-gray-600 dark:text-prox-text-secondary mt-2">
              {isSignUp ? 'Créer un nouveau compte' : 'Connectez-vous à votre compte'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-prox-text mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-prox-dark-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-prox-dark-700 dark:text-prox-text"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-prox-text mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-prox-dark-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-prox-dark-700 dark:text-prox-text"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-primary hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Chargement...'
                : isSignUp
                ? 'Créer le compte'
                : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-brand-primary hover:underline"
            >
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : 'Première connexion ? Créer un compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;