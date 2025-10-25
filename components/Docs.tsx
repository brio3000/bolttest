import React, { useState, FC } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Dossier, Document as DocType, Employe } from '../types';
import { FolderIcon, PlusCircleIcon, UploadIcon, FileTextIcon, PencilIcon, TrashIcon, ChevronRightIcon, DownloadIcon } from './Icons';
import Modal from './Modal';

type ModalState = {
    isOpen: boolean;
    type?: 'DOSSIER' | 'DOCUMENT';
    mode?: 'add' | 'edit';
    data?: any;
}

const Docs: React.FC = () => {
    const { dossiers, documents, employes, addDossier, deleteDossier, addDocument, deleteDocument } = useAppContext();
    const [currentDossier, setCurrentDossier] = useState<Dossier | null>(null);
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

    const openModal = (type: ModalState['type'], mode: ModalState['mode'], data: any = null) => {
        setModalState({ isOpen: true, type, mode, data });
    };
    const closeModal = () => setModalState({ isOpen: false });

    const breadcrumbs = [{ id: null, nom: 'Documents' }];
    if (currentDossier) {
        breadcrumbs.push(currentDossier);
    }
    
    const handleBreadcrumbClick = (dossierId: number | null) => {
        if (dossierId === null) {
            setCurrentDossier(null);
        } else {
            setCurrentDossier(dossiers.find(d => d.id === dossierId) || null);
        }
    }

    const renderModalContent = () => {
        if (!modalState.isOpen) return null;
        switch(modalState.type) {
            case 'DOSSIER':
                return <DossierForm onClose={closeModal} />;
            case 'DOCUMENT':
                return <DocumentForm onClose={closeModal} dossierId={currentDossier!.id} />;
            default: return null;
        }
    };
    
    return (
        <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-lg shadow-md space-y-6">
            <header className="flex justify-between items-center">
                <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-prox-text-secondary" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id || 'root'} className="flex items-center">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleBreadcrumbClick(crumb.id); }} className="hover:text-brand-primary">
                                {crumb.nom}
                            </a>
                            {index < breadcrumbs.length - 1 && <ChevronRightIcon className="h-5 w-5 text-gray-400 mx-1" />}
                        </div>
                    ))}
                </nav>
                 <div className="flex space-x-2">
                    <button onClick={() => openModal('DOSSIER', 'add')} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-blue-700">
                        <PlusCircleIcon className="h-5 w-5 mr-2"/> Ajouter un dossier
                    </button>
                    {currentDossier && (
                        <button onClick={() => openModal('DOCUMENT', 'add')} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                            <UploadIcon className="h-5 w-5 mr-2"/> Téléverser un document
                        </button>
                    )}
                </div>
            </header>
            
            <div>
                {!currentDossier ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {dossiers.map(dossier => (
                            <div key={dossier.id} className="group relative">
                                <div onClick={() => setCurrentDossier(dossier)}
                                    className="flex flex-col items-center justify-center p-4 border dark:border-prox-dark-700 rounded-lg hover:shadow-lg hover:border-brand-primary transition-all cursor-pointer h-36">
                                    <FolderIcon className="h-16 w-16 text-gray-400 dark:text-prox-text-secondary group-hover:text-brand-primary transition-colors"/>
                                    <span className="mt-2 text-sm font-semibold text-center text-gray-700 dark:text-prox-text">{dossier.nom}</span>
                                </div>
                                <button onClick={() => deleteDossier(dossier.id)}
                                        className="absolute top-2 right-2 p-1 bg-white dark:bg-prox-dark-800 rounded-full text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-all">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <DocumentTable dossierId={currentDossier.id} />
                )}
            </div>
            {renderModalContent()}
        </div>
    );
};

const DocumentTable: FC<{dossierId: number}> = ({ dossierId }) => {
    const { documents, employes, deleteDocument } = useAppContext();
    const filteredDocs = documents.filter(d => d.dossierId === dossierId).map(d => ({
        ...d,
        employe: employes.find(e => e.id === d.employeId)
    }));
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-transparent">
                <thead className="bg-gray-50 dark:bg-prox-dark-900">
                    <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Nom du document</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Employé Associé</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Date d'ajout</th>
                        <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-prox-dark-700">
                    {filteredDocs.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-prox-dark-700">
                            <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900 dark:text-prox-text flex items-center">
                                <FileTextIcon className="h-5 w-5 mr-3 text-brand-secondary dark:text-prox-text"/>
                                {doc.nom}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{doc.employe ? `${doc.employe.prenom} ${doc.employe.nom}` : 'N/A'}</td>
                            <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{new Date(doc.date_ajout).toLocaleDateString()}</td>
                            <td className="py-4 px-4 whitespace-nowrap space-x-2 text-right">
                                <button onClick={() => alert(`Téléchargement de ${doc.chemin_pdf}`)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"><DownloadIcon className="h-5 w-5"/></button>
                                <button onClick={() => deleteDocument(doc.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// FORM COMPONENTS
const FormRow: FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-prox-text mb-1">{label}</label>
        {children}
    </div>
);
const FormInput: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white disabled:bg-gray-200 dark:bg-prox-dark-700 dark:border-prox-dark-600 dark:text-prox-text dark:placeholder-prox-text-secondary dark:disabled:bg-gray-600" />
);
const FormSelect: FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white disabled:bg-gray-200 dark:bg-prox-dark-700 dark:border-prox-dark-600 dark:disabled:bg-gray-600" />
);
const FormFooter: FC<{onClose: () => void; formId: string;}> = ({onClose, formId}) => (
    <>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-prox-dark-700 dark:text-prox-text dark:hover:bg-prox-dark-600">Annuler</button>
        <button type="submit" form={formId} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-blue-700">Sauvegarder</button>
    </>
);


const DossierForm: FC<{onClose: () => void}> = ({ onClose }) => {
    const { addDossier } = useAppContext();
    const [nom, setNom] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addDossier({ nom });
        onClose();
    };

    return (
        <Modal title="Ajouter un dossier" isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="dossierForm"/>}>
            <form onSubmit={handleSubmit} id="dossierForm">
                <FormRow label="Nom du dossier">
                    <FormInput value={nom} onChange={e => setNom(e.target.value)} required autoFocus/>
                </FormRow>
            </form>
        </Modal>
    );
};

const DocumentForm: FC<{onClose: () => void; dossierId: number}> = ({ onClose, dossierId }) => {
    const { addDocument, getFilteredEmployes } = useAppContext();
    const employes = getFilteredEmployes();
    const [nom, setNom] = useState('');
    const [employeId, setEmployeId] = useState(employes[0]?.id || 0);
    const [fileName, setFileName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addDocument({
            nom: nom || fileName || 'Nouveau document.pdf',
            dossierId,
            employeId,
            chemin_pdf: `/docs/${fileName || 'new_doc.pdf'}`,
            date_ajout: new Date().toISOString().split('T')[0],
        });
        onClose();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <Modal title="Téléverser un document" isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="docForm"/>}>
            <form onSubmit={handleSubmit} id="docForm" className="space-y-4">
                <FormRow label="Fichier (fictif)">
                    <FormInput type="file" onChange={handleFileChange} />
                </FormRow>
                <FormRow label="Nom du document (optionnel)">
                    <FormInput value={nom} onChange={e => setNom(e.target.value)} placeholder={fileName || "Ex: Contrat de travail.pdf"} />
                </FormRow>
                <FormRow label="Associer à un employé">
                    <FormSelect value={employeId} onChange={e => setEmployeId(Number(e.target.value))}>
                        {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                    </FormSelect>
                </FormRow>
            </form>
        </Modal>
    );
}

export default Docs;