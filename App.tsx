import React, { useState } from 'react';
import { useAppContext } from './hooks/useAppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Management from './components/Management';
import Docs from './components/Docs';
import Settings from './components/Settings';
import { Header } from './components/Header';
import { View } from './types';
import Modal from './components/Modal';
import { TrashIcon } from './components/Icons';

const App: React.FC = () => {
  const { user, confirmationState, hideConfirmation, confirmAction } = useAppContext();
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  if (!user) {
    return <Login />;
  }

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

  return (
    <div className="flex h-screen text-gray-800 dark:text-prox-text">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-prox-dark-900 p-6">
          {renderView()}
        </main>
      </div>
       <Modal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        title="Confirmation de suppression"
        footer={
          <>
            <button type="button" onClick={hideConfirmation} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-prox-dark-700 dark:text-prox-text dark:hover:bg-prox-dark-600">
                Annuler
            </button>
            <button type="button" onClick={confirmAction} className="px-4 py-2 text-sm font-medium text-white bg-status-expired rounded-lg hover:bg-red-700 flex items-center">
                <TrashIcon className="h-4 w-4 mr-2" />
                Confirmer
            </button>
          </>
        }
      >
        <div className="text-gray-600 dark:text-prox-text">
            {confirmationState.message}
        </div>
      </Modal>
    </div>
  );
};

export default App;