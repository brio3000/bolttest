import React from 'react';
import { UserRole, View } from '../types';
import { PkiGestIcon, ChartPieIcon, CogIcon, FolderIcon, UsersIcon } from './Icons';
import { useAppContext } from '../hooks/useAppContext';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { user, logoUrl } = useAppContext();
  const isAdmin = user?.role === UserRole.ADMIN;

  const navItems = [
    { view: View.DASHBOARD, label: 'Tableau de Bord', icon: ChartPieIcon, roles: [UserRole.ADMIN, UserRole.GESTIONNAIRE] },
    { view: View.MANAGEMENT, label: 'Gestion', icon: UsersIcon, roles: [UserRole.ADMIN, UserRole.GESTIONNAIRE] },
    { view: View.DOCS, label: 'Docs', icon: FolderIcon, roles: [UserRole.ADMIN, UserRole.GESTIONNAIRE] },
    { view: View.SETTINGS, label: 'Paramètres', icon: CogIcon, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="flex flex-col w-64 bg-brand-secondary text-gray-100 dark:bg-prox-dark-800 dark:text-prox-text border-r border-transparent dark:border-prox-dark-700">
      <div className="flex flex-col items-center justify-center h-36 border-b border-gray-700 dark:border-prox-dark-700 px-4 space-y-4">
        {logoUrl ? (
            <img src={logoUrl} alt="Logo PkiGest" className="h-28 max-w-full object-contain" />
        ) : (
            <>
                <PkiGestIcon className="h-20 w-20 text-white" />
                <h1 className="text-3xl font-bold">PkiGest</h1>
            </>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          item.roles.includes(user!.role) && (
            <a
              key={item.view}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView(item.view);
              }}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                currentView === item.view
                  ? 'bg-brand-primary text-white dark:bg-prox-dark-600'
                  : 'hover:bg-gray-700/50 hover:text-white dark:hover:bg-prox-dark-700'
              }`}
            >
              <item.icon className="h-6 w-6 mr-3" />
              <span className="font-medium">{item.label}</span>
            </a>
          )
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;