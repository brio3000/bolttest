import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserIcon, LogoutIcon, SunIcon, MoonIcon } from './Icons';

export const Header: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useAppContext();

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b dark:bg-prox-dark-800 dark:border-prox-dark-700">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-brand-secondary dark:text-prox-text">Bienvenue, {user?.nom}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
            <UserIcon className="h-5 w-5 text-gray-500 dark:text-prox-text-secondary" />
            <span className="font-medium text-gray-700 dark:text-prox-text-secondary">{user?.role}</span>
        </div>
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-prox-text-secondary dark:hover:bg-prox-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          </button>
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/80"
        >
          <LogoutIcon className="h-5 w-5 mr-2" />
          Déconnexion
        </button>
      </div>
    </header>
  );
};