import React, { useState, lazy, Suspense } from 'react';
import { useAppContext } from './hooks/useAppContext';
import Sidebar from './components/Sidebar';
import { Header } from './components/Header';
import { View } from './types';
import Modal from './components/Modal';
import { TrashIcon } from './components/Icons';

// Lazy-loaded screens
const Dashboard = lazy(() => import('./components/Dashboard'));
const Management = lazy(() => import('./components/Management'));
const Docs = lazy(() => import('./components/Docs'));
const Settings = lazy(() => import('./components/Settings'));

const App: React.FC = () => {
  // 👇 We no longer check for any "user"
  const { confirmationState, hideConfirmation, confirmAction } = useAppContext();
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD); // Dashboard by default

  // 👇 Determines which view to show
  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.MANAGEMENT:
        return <Management />;
      case View.DOCS:
        return <Docs />;
      case View.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // 👇 Loading placeholder when switching views
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-lg text-gray-600 dark:text-prox-text-secondary">Chargement...</div>
    </div>
  );

  // 👇 Full layout of the app
  return (
    <div className="flex h-screen text-gray-800 dark:text-prox-text">
      {/* Sidebar and navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-prox-dark-900 p-6">
          <Suspense fallback={<LoadingFallback />}>
            {renderView()}
          </Suspense>
        </main>
      </div>

      {/* Confirmation modal */}
      <Modal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        title="Confirmation de suppression"
        footer={
          <>
            <button
              type="button"
              onClick={hideConfirmation}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-prox-dark-700 dark:text-prox-text dark:hover:bg-prox-dark-600"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirmAction}
              className="px-4 py-2 text-sm font-medium text-white bg-status-expired rounded-lg hover:bg-red-700 flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Confirmer
            </button>
          </>
        }
      >
        <div className="text-gray-600 dark:text-prox-text">{confirmationState.message}</div>
      </Modal>
    </div>
  );
};

export default App;
