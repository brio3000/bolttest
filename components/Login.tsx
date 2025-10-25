import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole } from '../types';
import { BriefcaseIcon, ShieldCheckIcon } from './Icons';

const Login: React.FC = () => {
  const { login, logoUrl } = useAppContext();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-prox-dark-800 shadow-2xl rounded-xl overflow-hidden md:grid md:grid-cols-2">
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-brand-primary to-blue-700 text-white">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="mx-auto h-40 object-contain" />
          ) : (
            <BriefcaseIcon className="mx-auto h-32 w-auto" />
          )}
          <h1 className="text-3xl font-bold mt-6">Bienvenue</h1>
          <p className="text-center text-blue-100 mt-2">Gérez vos certifications avec efficacité et simplicité.</p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          {/* Mobile Header */}
          <div className="md:hidden text-center mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="mx-auto h-28 object-contain" />
            ) : (
              <BriefcaseIcon className="mx-auto h-24 w-auto text-brand-primary" />
            )}
             <h2 className="text-2xl font-bold mt-4 text-brand-secondary dark:text-prox-text">Connectez-vous</h2>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => login(UserRole.GESTIONNAIRE)}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 duration-300"
            >
              <BriefcaseIcon className="h-6 w-6 mr-3" />
              Espace Gestionnaire
            </button>
            <button
              onClick={() => login(UserRole.ADMIN)}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-prox-dark-700 rounded-lg shadow-sm text-lg font-medium text-brand-secondary bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-transform transform hover:scale-105 duration-300 dark:bg-prox-dark-700 dark:text-prox-text dark:hover:bg-prox-dark-600"
            >
              <ShieldCheckIcon className="h-6 w-6 mr-3" />
              Espace Administrateur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
