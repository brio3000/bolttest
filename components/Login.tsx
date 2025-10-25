import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BriefcaseIcon } from './Icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-prox-dark-900">
      <div className="max-w-md w-full bg-white dark:bg-prox-dark-800 shadow-2xl rounded-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <BriefcaseIcon className="mx-auto h-24 w-auto text-brand-primary" />
            <h2 className="text-3xl font-bold mt-4 text-brand-secondary dark:text-prox-text">PkiGest Pro</h2>
            <p className="text-gray-600 dark:text-prox-text-secondary mt-2">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-prox-text mb-2">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-prox-text mb-2">
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
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-prox-text-secondary">
              Première connexion ? Contactez votre administrateur pour créer un compte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
