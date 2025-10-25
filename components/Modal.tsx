import React, { ReactNode, useEffect } from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white dark:bg-prox-dark-800 rounded-xl shadow-2xl p-0 w-full max-w-lg relative animate-fade-in-up flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b dark:border-prox-dark-700 p-4">
          <h3 className="text-xl font-bold text-brand-secondary dark:text-prox-text">{title}</h3>
          <button onClick={onClose} className="text-gray-400 rounded-full p-1 hover:bg-gray-200 hover:text-gray-700 transition-colors dark:text-prox-text-secondary dark:hover:bg-prox-dark-700 dark:hover:text-prox-text" aria-label="Close modal">
            <CloseIcon className="h-6 w-6"/>
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
            <div className="border-t dark:border-prox-dark-700 p-4 flex justify-end space-x-3 bg-gray-50 dark:bg-prox-dark-900 rounded-b-xl">
                {footer}
            </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;