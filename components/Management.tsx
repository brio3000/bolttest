import React, { useState, useMemo, FC, useEffect, useRef, memo, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ManagementTab, UserRole, Employe, EmployeCertificat, Agence, Ville, Entite, Certificat, Groupe, StatutCertificat } from '../types';
import { DownloadIcon, UploadIcon, PlusCircleIcon, PencilIcon, TrashIcon, SearchIcon, MailIcon, ChevronDownIcon, ChevronUpIcon, SwitchVerticalIcon } from './Icons';
import Modal from './Modal';

type ModalState = {
    isOpen: boolean;
    type?: 'EMPLOYE' | 'CERTIFICAT' | 'TYPE_CERTIFICAT' | 'AGENCE' | 'ENTITE' | 'VILLE' | 'GROUPE';
    mode?: 'add' | 'edit';
    data?: any;
}

type SortDirection = 'ascending' | 'descending';
type SortConfig<T> = { key: keyof T | string | null; direction: SortDirection };

// Helper to get nested properties for sorting
const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

interface SortableHeaderProps<T> {
  children: React.ReactNode;
  sortKey: keyof T | string;
  sortConfig: SortConfig<T>;
  onSort: (key: keyof T | string) => void;
  className?: string;
}

const SortableHeader = <T,>({ children, sortKey, sortConfig, onSort, className }: SortableHeaderProps<T>) => {
  const isSorted = sortConfig.key === sortKey;
  const Icon = isSorted
    ? sortConfig.direction === 'ascending'
      ? ChevronUpIcon
      : ChevronDownIcon
    : SwitchVerticalIcon;

  return (
    <th className={`py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider ${className}`}>
      <button className="flex items-center gap-1.5 group" onClick={() => onSort(sortKey)}>
        <span>{children}</span>
        <Icon className={`h-4 w-4 transition-colors ${isSorted ? 'text-gray-800 dark:text-prox-text' : 'text-gray-400 dark:text-prox-text-secondary group-hover:text-gray-600 dark:group-hover:text-prox-text'}`} />
      </button>
    </th>
  );
};


const Management: React.FC = memo(() => {
    const { user, getFilteredEmployes, agences, entites, getFilteredEmployeCertificats, certificats, villes, groupes, employes, notificationSettings } = useAppContext();
    const [activeTab, setActiveTab] = useState(ManagementTab.EMPLOYES);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig<any>>({ key: null, direction: 'ascending' });


    const isAdmin = user?.role === UserRole.ADMIN;

    const openModal = (type: ModalState['type'], mode: ModalState['mode'], data: any = null) => {
        setModalState({ isOpen: true, type, mode, data });
    };

    const closeModal = () => {
        setModalState({ isOpen: false });
    };

    const tabs = [
        ManagementTab.EMPLOYES,
        ManagementTab.CERTIFICATS,
        ...(isAdmin ? [
            ManagementTab.GROUPES,
            ManagementTab.TYPES_CERTIFICATS, 
            ManagementTab.AGENCES, 
            ManagementTab.ENTITES, 
            ManagementTab.VILLES,
        ] : [])
    ];
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            alert(`Fichier "${file.name}" sélectionné. La fonctionnalité d'importation est en cours de développement.`);
            event.target.value = ''; 
        }
    };
    
    const handleExport = () => {
        let dataToExport: any[] = [];
        let headers: string[] = [];
        let filename = `${activeTab.replace(/\s/g, '_')}_export.csv`;

        switch(activeTab) {
            case ManagementTab.EMPLOYES:
                headers = ["Prénom", "Nom", "Email", "ID Interne", "GSM"];
                dataToExport = getFilteredEmployes().filter(e => 
                    (`${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    e.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (entityFilter === 'all' || e.entiteId === Number(entityFilter))
                ).map(e => ({
                    "Prénom": e.prenom,
                    "Nom": e.nom,
                    "Email": e.email,
                    "ID Interne": e.id_interne,
                    "GSM": e.gsm,
                }));
                break;
            case ManagementTab.CERTIFICATS:
                 const certData = getFilteredEmployeCertificats().map(ec => ({
                    ...ec,
                    employe: employes.find(e => e.id === ec.employeId),
                    certificat: certificats.find(c => c.id === ec.certificatId)
                }));
                headers = ["ID Employé", "Employé", "Certificat", "Date Obtention", "Date Expiration", "Statut"];
                dataToExport = certData.filter(d => 
                    (`${d.employe?.prenom} ${d.employe?.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.certificat?.nom_certificat.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (entityFilter === 'all' || d.employe?.entiteId === Number(entityFilter)) &&
                    (statusFilter === 'all' || d.statut === statusFilter)
                ).map(ec => ({
                    "ID Employé": ec.employeId,
                    "Employé": `${ec.employe?.prenom} ${ec.employe?.nom}`,
                    "Certificat": ec.certificat?.nom_certificat || '',
                    "Date Obtention": ec.date_obtention,
                    "Date Expiration": ec.date_expiration,
                    "Statut": ec.statut,
                }));
                break;
            default:
                alert("L'exportation pour cet onglet n'est pas encore implémentée.");
                return;
        }

        if (dataToExport.length === 0) {
            alert("Aucune donnée à exporter.");
            return;
        }

        const csvContent = [
            headers.join(','),
            ...dataToExport.map(row => 
                headers.map(header => `"${row[header]}"`).join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    const renderContent = () => {
        switch(activeTab) {
            case ManagementTab.EMPLOYES:
                return <EmployeeTable searchQuery={searchQuery} onEdit={(emp) => openModal('EMPLOYE', 'edit', emp)} onAdd={() => openModal('EMPLOYE', 'add')} entityFilter={entityFilter} sortConfig={sortConfig} setSortConfig={setSortConfig} />;
            case ManagementTab.CERTIFICATS:
                return <EmployeeCertificatTable searchQuery={searchQuery} onEdit={(cert) => openModal('CERTIFICAT', 'edit', cert)} onAdd={() => openModal('CERTIFICAT', 'add')} entityFilter={entityFilter} statusFilter={statusFilter} sortConfig={sortConfig} setSortConfig={setSortConfig} />;
            case ManagementTab.GROUPES:
                return <GroupeTable searchQuery={searchQuery} onEdit={(groupe) => openModal('GROUPE', 'edit', groupe)} onAdd={() => openModal('GROUPE', 'add')} />;
            case ManagementTab.TYPES_CERTIFICATS:
                return <CertificatTable searchQuery={searchQuery} onEdit={(cert) => openModal('TYPE_CERTIFICAT', 'edit', cert)} onAdd={() => openModal('TYPE_CERTIFICAT', 'add')} />;
            case ManagementTab.AGENCES:
                return <AgenceTable searchQuery={searchQuery} onEdit={(agence) => openModal('AGENCE', 'edit', agence)} onAdd={() => openModal('AGENCE', 'add')} />;
            case ManagementTab.ENTITES:
                return <EntiteTable searchQuery={searchQuery} onEdit={(entite) => openModal('ENTITE', 'edit', entite)} onAdd={() => openModal('ENTITE', 'add')} />;
            case ManagementTab.VILLES:
                return <VilleTable searchQuery={searchQuery} onEdit={(ville) => openModal('VILLE', 'edit', ville)} onAdd={() => openModal('VILLE', 'add')} />;
            default:
                return null;
        }
    };
    
    const renderModalContent = () => {
        if (!modalState.isOpen) return null;
        const { type, mode, data } = modalState;

        switch(type) {
            case 'EMPLOYE':
                return <EmployeForm currentData={data} mode={mode!} onClose={closeModal} />;
            case 'CERTIFICAT':
                return <EmployeCertificatForm currentData={data} mode={mode!} onClose={closeModal} />;
            case 'TYPE_CERTIFICAT':
                return <CertificatForm currentData={data} mode={mode!} onClose={closeModal} />;
            case 'AGENCE':
                 return <AgenceForm currentData={data} mode={mode!} onClose={closeModal} />;
            case 'ENTITE':
                 return <EntiteForm currentData={data} mode={mode!} onClose={closeModal} />;
            case 'VILLE':
                 return <VilleForm currentData={data} mode={mode!} onClose={closeModal} />;
            case 'GROUPE':
                return <GroupeForm currentData={data} mode={mode!} onClose={closeModal} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center border-b dark:border-prox-dark-700 pb-4 mb-4 flex-wrap gap-4">
                 <div className="flex items-center space-x-2">
                    <div className="relative">
                        <input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-prox-dark-700 dark:text-prox-text border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-prox-text-secondary"/>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                    <button onClick={handleImportClick} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700">
                        <UploadIcon className="h-5 w-5 mr-2"/> Importer CSV
                    </button>
                    <button onClick={handleExport} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                        <DownloadIcon className="h-5 w-5 mr-2"/> Exporter CSV
                    </button>
                </div>
            </div>
            
            <div className="border-b border-gray-200 dark:border-prox-dark-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => { 
                                setActiveTab(tab); 
                                setSearchQuery('');
                                setEntityFilter('all');
                                setStatusFilter('all');
                                setSortConfig({ key: null, direction: 'ascending' });
                            }}
                            className={`${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-prox-text-secondary dark:hover:text-prox-text dark:hover:border-prox-text-secondary'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-4 flex items-end space-x-4">
                { (activeTab === ManagementTab.EMPLOYES || activeTab === ManagementTab.CERTIFICATS) && (
                    <div className="w-64">
                        <label htmlFor="entity-filter" className="block text-sm font-medium text-gray-700 dark:text-prox-text mb-1">Filtrer par entité</label>
                        <div className="relative">
                            <select id="entity-filter" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-prox-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none transition-all">
                                <option value="all">Toutes les entités</option>
                                {entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-prox-text-secondary pointer-events-none" />
                        </div>
                    </div>
                )}
                { activeTab === ManagementTab.CERTIFICATS && (
                     <div className="w-64">
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-prox-text mb-1">Filtrer par statut</label>
                        <div className="relative">
                            <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-prox-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none transition-all">
                                <option value="all">Tous les statuts</option>
                                {Object.values(StatutCertificat).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-prox-text-secondary pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6">
                {renderContent()}
            </div>
            {renderModalContent()}
        </div>
    );
});
Management.displayName = 'Management';


// TABLE COMPONENTS
const TableHeader: FC<{title: string; onAdd?: () => void; addLabel?: string}> = memo(({title, onAdd, addLabel}) => (
    <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-brand-secondary dark:text-prox-text">{title}</h3>
        {onAdd && addLabel && (
            <button onClick={onAdd} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                {addLabel}
            </button>
        )}
    </div>
));
TableHeader.displayName = 'TableHeader';

const ActionsCell: FC<{onEdit: () => void; onDelete: () => void}> = memo(({onEdit, onDelete}) => (
    <td className="py-4 px-4 whitespace-nowrap space-x-2 text-right">
        <button onClick={onEdit} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"><PencilIcon className="h-5 w-5"/></button>
        <button onClick={onDelete} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
    </td>
));
ActionsCell.displayName = 'ActionsCell';

const EmployeeTable: FC<{searchQuery: string; onAdd: () => void; onEdit: (emp: Employe) => void; entityFilter: string; sortConfig: SortConfig<any>; setSortConfig: (config: SortConfig<any>) => void;}> = memo(({searchQuery, onAdd, onEdit, entityFilter, sortConfig, setSortConfig}) => {
    const { getFilteredEmployes, deleteEmploye } = useAppContext();

    const requestSort = (key: keyof Employe | string) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let data = getFilteredEmployes().filter(e => {
            const matchesSearch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) || e.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesEntity = entityFilter === 'all' || e.entiteId === Number(entityFilter);
            return matchesSearch && matchesEntity;
        });

        if (sortConfig.key) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key! as keyof Employe];
                const bValue = b[sortConfig.key! as keyof Employe];
                 if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return data;
    }, [searchQuery, getFilteredEmployes, entityFilter, sortConfig]);

    return (
      <div>
        <TableHeader title="Liste des Employés" onAdd={onAdd} addLabel="Ajouter Employé" />
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-transparent">
              <thead className="bg-gray-50 dark:bg-prox-dark-900">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">ID</th>
                  {/* FIX: Add explicit generic type to SortableHeader to aid TypeScript's type inference and prevent 'missing children' error. */}
                  <SortableHeader<Employe> sortKey="nom" sortConfig={sortConfig} onSort={requestSort}>Nom Complet</SortableHeader>
                  {/* FIX: Add explicit generic type to SortableHeader to aid TypeScript's type inference and prevent 'missing children' error. */}
                  <SortableHeader<Employe> sortKey="email" sortConfig={sortConfig} onSort={requestSort}>Email</SortableHeader>
                  {/* FIX: Add explicit generic type to SortableHeader to aid TypeScript's type inference and prevent 'missing children' error. */}
                  <SortableHeader<Employe> sortKey="id_interne" sortConfig={sortConfig} onSort={requestSort}>ID Interne</SortableHeader>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Gsm</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-prox-dark-700">
                {processedData.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-prox-dark-700">
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{emp.id}</td>
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900 dark:text-prox-text">{emp.prenom} {emp.nom}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{emp.email}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{emp.id_interne}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{emp.gsm}</td>
                    <ActionsCell onEdit={() => onEdit(emp)} onDelete={() => deleteEmploye(emp.id)} />
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    );
});
EmployeeTable.displayName = 'EmployeeTable';

// FIX: Define a type for the enhanced certificate data used in the table to provide better type safety.
interface FullEmployeCertificat extends EmployeCertificat {
    employe?: Employe;
    certificat?: Certificat;
}

const EmployeeCertificatTable: FC<{searchQuery: string; onAdd: () => void; onEdit: (cert: EmployeCertificat) => void; entityFilter: string; statusFilter: string; sortConfig: SortConfig<any>; setSortConfig: (config: SortConfig<any>) => void;}> = memo(({searchQuery, onAdd, onEdit, entityFilter, statusFilter, sortConfig, setSortConfig}) => {
    const { getFilteredEmployeCertificats, employes, certificats, getCertificateStatus, deleteEmployeCertificat, notificationSettings } = useAppContext();
    const statusColorMap: Record<string, string> = { 
        "Valide": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300", 
        "Expire Bientôt": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300", 
        "Expiré": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" 
    };

    const requestSort = (key: string) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const processedData = useMemo(() => {
        let data = getFilteredEmployeCertificats().map(ec => ({
            ...ec,
            employe: employes.find(e => e.id === ec.employeId),
            certificat: certificats.find(c => c.id === ec.certificatId)
        })).filter(d => {
            const matchesSearch = `${d.employe?.prenom} ${d.employe?.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) || d.certificat?.nom_certificat.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesEntity = entityFilter === 'all' || d.employe?.entiteId === Number(entityFilter);
            const matchesStatus = statusFilter === 'all' || d.statut === statusFilter;
            return matchesSearch && matchesEntity && matchesStatus;
        });

        if (sortConfig.key) {
            data.sort((a, b) => {
                const aValue = getNestedValue(a, sortConfig.key!);
                const bValue = getNestedValue(b, sortConfig.key!);
                
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (sortConfig.key === 'date_expiration') {
                    const dateA = new Date(aValue).getTime();
                    const dateB = new Date(bValue).getTime();
                    return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
                }

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                
                return 0;
            });
        }
        return data;

    }, [searchQuery, getFilteredEmployeCertificats, employes, certificats, entityFilter, statusFilter, sortConfig]);

    return (
        <div>
            <TableHeader title="Certificats des Employés" onAdd={onAdd} addLabel="Affecter Certificat" />
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-transparent">
                    <thead className="bg-gray-50 dark:bg-prox-dark-900">
                        <tr>
                            {/* FIX: Add explicit generic type to SortableHeader to aid TypeScript's type inference and prevent 'missing children' error. */}
                            <SortableHeader<FullEmployeCertificat> sortKey="employe.nom" sortConfig={sortConfig} onSort={requestSort}>Employé</SortableHeader>
                            {/* FIX: Add explicit generic type to SortableHeader to aid TypeScript's type inference and prevent 'missing children' error. */}
                            <SortableHeader<FullEmployeCertificat> sortKey="certificat.nom_certificat" sortConfig={sortConfig} onSort={requestSort}>Certificat</SortableHeader>
                            {/* FIX: Add explicit generic type to SortableHeader to aid TypeScript's type inference and prevent 'missing children' error. */}
                            <SortableHeader<FullEmployeCertificat> sortKey="date_expiration" sortConfig={sortConfig} onSort={requestSort}>Date d'Expiration</SortableHeader>
                            {/* FIX: Add explicit generic type to SortableHeader to aid TypeScript's type inference and prevent 'missing children' error. */}
                            <SortableHeader<FullEmployeCertificat> sortKey="statut" sortConfig={sortConfig} onSort={requestSort}>Statut</SortableHeader>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Document</th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-prox-dark-700">
                        {processedData.map(ec => {
                            const status = getCertificateStatus(ec.date_expiration);
                            const today = new Date(); today.setHours(0,0,0,0);
                            const expDate = new Date(ec.date_expiration);
                            const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const upcomingReminders = notificationSettings.enabled
                                ? notificationSettings.daysBefore.filter(day => diffDays > 0 && diffDays <= day)
                                : [];
                            const shouldNotify = upcomingReminders.length > 0;
                            const mailIconTitle = `Rappels programmés à J-${upcomingReminders.sort((a,b)=>b-a).join(', J-')}.`;

                            return (
                                <tr key={ec.id} className="hover:bg-gray-50 dark:hover:bg-prox-dark-700">
                                    <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900 dark:text-prox-text">{ec.employe?.prenom} {ec.employe?.nom}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{ec.certificat?.nom_certificat}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{new Date(ec.date_expiration).toLocaleDateString()}</td>
                                    <td className="py-4 px-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[status]}`}>
                                                {status}
                                            </span>
                                            {shouldNotify && <MailIcon className="h-4 w-4 text-blue-500" title={mailIconTitle}/>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 whitespace-nowrap">
                                      <button onClick={() => alert(`Téléchargement de ${ec.chemin_pdf}`)} className="text-brand-primary hover:underline">
                                        PDF
                                      </button>
                                    </td>
                                    <ActionsCell onEdit={() => onEdit(ec)} onDelete={() => deleteEmployeCertificat(ec.id)} />
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
EmployeeCertificatTable.displayName = 'EmployeeCertificatTable';

const CertificatTable: FC<{searchQuery: string; onAdd: () => void; onEdit: (cert: Certificat) => void;}> = memo(({searchQuery, onAdd, onEdit}) => {
    const { certificats, deleteCertificat } = useAppContext();
    const filteredData = certificats.filter(c => c.nom_certificat.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
        <div>
            <TableHeader title="Types de Certificats" onAdd={onAdd} addLabel="Ajouter Type" />
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-transparent">
                    <thead className="bg-gray-50 dark:bg-prox-dark-900">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Nom</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Durée (jours)</th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-prox-dark-700">
                        {filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-prox-dark-700">
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.nom_certificat}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.duree_validite_jours}</td>
                                <ActionsCell onEdit={() => onEdit(item)} onDelete={() => deleteCertificat(item.id)} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
CertificatTable.displayName = 'CertificatTable';

const AgenceTable: FC<{searchQuery: string; onAdd: () => void; onEdit: (agence: Agence) => void;}> = memo(({searchQuery, onAdd, onEdit}) => {
    const { agences, villes, entites, deleteAgence } = useAppContext();
    const data = agences.map(a => ({...a, ville: villes.find(v => v.id === a.villeId)?.nom, entite: entites.find(e => e.id === a.entiteId)?.nom}));
    const filteredData = data.filter(item => item.nom.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
         <div>
            <TableHeader title="Agences" onAdd={onAdd} addLabel="Ajouter Agence" />
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-transparent">
                    <thead className="bg-gray-50 dark:bg-prox-dark-900">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Nom</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Ville</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Entité</th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-prox-dark-700">
                        {filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-prox-dark-700">
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.nom}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.ville}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.entite}</td>
                                <ActionsCell onEdit={() => onEdit(item)} onDelete={() => deleteAgence(item.id)} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
AgenceTable.displayName = 'AgenceTable';

const EntiteTable: FC<{searchQuery: string; onAdd: () => void; onEdit: (entite: Entite) => void;}> = memo(({searchQuery, onAdd, onEdit}) => {
    const { entites, deleteEntite } = useAppContext();
    const filteredData = entites.filter(item => item.nom.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
         <div>
            <TableHeader title="Entités" onAdd={onAdd} addLabel="Ajouter Entité" />
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-transparent">
                    <thead className="bg-gray-50 dark:bg-prox-dark-900">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Nom</th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-prox-dark-700">
                        {filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-prox-dark-700">
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.nom}</td>
                                <ActionsCell onEdit={() => onEdit(item)} onDelete={() => deleteEntite(item.id)} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
EntiteTable.displayName = 'EntiteTable';

const VilleTable: FC<{searchQuery: string; onAdd: () => void; onEdit: (ville: Ville) => void;}> = memo(({searchQuery, onAdd, onEdit}) => {
    const { villes, deleteVille } = useAppContext();
    const filteredData = villes.filter(item => item.nom.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
         <div>
            <TableHeader title="Villes" onAdd={onAdd} addLabel="Ajouter Ville" />
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-transparent">
                    <thead className="bg-gray-50 dark:bg-prox-dark-900">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Nom</th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-prox-dark-700">
                        {filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-prox-dark-700">
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.nom}</td>
                                <ActionsCell onEdit={() => onEdit(item)} onDelete={() => deleteVille(item.id)} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
VilleTable.displayName = 'VilleTable';

const GroupeTable: FC<{searchQuery: string; onAdd: () => void; onEdit: (groupe: Groupe) => void;}> = memo(({searchQuery, onAdd, onEdit}) => {
    const { groupes, entites, deleteGroupe } = useAppContext();
    const data = groupes.map(g => ({...g, entite: entites.find(e => e.id === g.entiteId)?.nom}));
    const filteredData = data.filter(item => item.nom.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
         <div>
            <TableHeader title="Groupes d'employés" onAdd={onAdd} addLabel="Ajouter Groupe" />
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-transparent">
                    <thead className="bg-gray-50 dark:bg-prox-dark-900">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Nom du groupe</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Entité</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Membres</th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-prox-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-prox-dark-700">
                        {filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-prox-dark-700">
                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900 dark:text-prox-text">{item.nom}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.entite}</td>
                                <td className="py-4 px-4 whitespace-nowrap text-gray-500 dark:text-prox-text-secondary">{item.employeIds.length}</td>
                                <ActionsCell onEdit={() => onEdit(item)} onDelete={() => deleteGroupe(item.id)} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
GroupeTable.displayName = 'GroupeTable';

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


const EmployeForm: FC<{mode: 'add' | 'edit'; currentData: Employe | null; onClose: () => void}> = ({mode, currentData, onClose}) => {
    const { agences, entites, addEmploye, updateEmploye } = useAppContext();
    const [formData, setFormData] = useState({
        nom: currentData?.nom || '',
        prenom: currentData?.prenom || '',
        id_interne: currentData?.id_interne || '',
        gsm: currentData?.gsm || '',
        email: currentData?.email || '',
        entiteId: currentData?.entiteId || entites[0]?.id || 0,
        agenceId: currentData?.agenceId || agences[0]?.id || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'edit' && currentData) {
            updateEmploye({ ...currentData, ...formData });
        } else {
            addEmploye(formData);
        }
        onClose();
    };
    
    useEffect(() => {
        const availableAgences = agences.filter(a => a.entiteId === formData.entiteId);
        if (availableAgences.length > 0 && !availableAgences.some(a => a.id === formData.agenceId)) {
            setFormData(prev => ({ ...prev, agenceId: availableAgences[0].id }));
        }
    }, [formData.entiteId, agences, formData.agenceId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name.includes('Id') ? Number(value) : value}));
    };

    return (
        <Modal title={mode === 'edit' ? "Modifier l'employé" : "Ajouter un employé"} isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="employeForm"/>}>
            <form onSubmit={handleSubmit} id="employeForm">
                <FormRow label="Prénom"><FormInput name="prenom" value={formData.prenom} onChange={handleChange} required /></FormRow>
                <FormRow label="Nom"><FormInput name="nom" value={formData.nom} onChange={handleChange} required /></FormRow>
                <FormRow label="Email"><FormInput type="email" name="email" value={formData.email} onChange={handleChange} required /></FormRow>
                <FormRow label="Entité">
                    <FormSelect name="entiteId" value={formData.entiteId} onChange={handleChange}>
                        {entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                    </FormSelect>
                </FormRow>
                <FormRow label="Agence">
                    <FormSelect name="agenceId" value={formData.agenceId} onChange={handleChange}>
                        {agences.filter(a => a.entiteId === formData.entiteId).map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                    </FormSelect>
                </FormRow>
                 <FormRow label="ID Interne"><FormInput name="id_interne" value={formData.id_interne} onChange={handleChange} /></FormRow>
                 <FormRow label="GSM"><FormInput name="gsm" value={formData.gsm} onChange={handleChange} /></FormRow>
            </form>
        </Modal>
    )
};

const EmployeCertificatForm: FC<{mode: 'add' | 'edit'; currentData: EmployeCertificat | null; onClose: () => void}> = ({mode, currentData, onClose}) => {
    const { employes, certificats, addEmployeCertificat, updateEmployeCertificat } = useAppContext();
     const [formData, setFormData] = useState({
        employeId: currentData?.employeId || employes[0]?.id || 0,
        certificatId: currentData?.certificatId || certificats[0]?.id || 0,
        date_obtention: currentData?.date_obtention || new Date().toISOString().split('T')[0],
        chemin_pdf: currentData?.chemin_pdf || '/files/new_cert.pdf',
    });
     const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'edit' && currentData) {
            updateEmployeCertificat({ ...currentData, ...formData });
        } else {
            addEmployeCertificat(formData);
        }
        onClose();
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name.includes('Id') ? Number(value) : value}));
    };
    return (
         <Modal title={mode === 'edit' ? "Modifier l'affectation" : "Affecter un certificat"} isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="ecForm"/>}>
            <form onSubmit={handleSubmit} id="ecForm">
                <FormRow label="Employé">
                    <FormSelect name="employeId" value={formData.employeId} onChange={handleChange} disabled={mode==='edit'}>
                        {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                    </FormSelect>
                </FormRow>
                <FormRow label="Type de Certificat">
                    <FormSelect name="certificatId" value={formData.certificatId} onChange={handleChange}>
                        {certificats.map(c => <option key={c.id} value={c.id}>{c.nom_certificat}</option>)}
                    </FormSelect>
                </FormRow>
                <FormRow label="Date d'obtention"><FormInput type="date" name="date_obtention" value={formData.date_obtention} onChange={handleChange} required /></FormRow>
            </form>
        </Modal>
    )
};

const CertificatForm: FC<{mode: 'add' | 'edit'; currentData: Certificat | null; onClose: () => void}> = ({mode, currentData, onClose}) => {
    const { addCertificat, updateCertificat } = useAppContext();
    const [formData, setFormData] = useState({ nom_certificat: currentData?.nom_certificat || '', duree_validite_jours: currentData?.duree_validite_jours || 365 });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'edit' && currentData) { updateCertificat({ ...currentData, ...formData }); } else { addCertificat(formData); }
        onClose();
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name.includes('jours') ? Number(value) : value}));
    };
    return(
        <Modal title={mode==='edit' ? 'Modifier le Type' : 'Ajouter un Type'} isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="certForm"/>}>
             <form onSubmit={handleSubmit} id="certForm">
                <FormRow label="Nom du certificat"><FormInput name="nom_certificat" value={formData.nom_certificat} onChange={handleChange} required/></FormRow>
                <FormRow label="Durée de validité (jours)"><FormInput type="number" name="duree_validite_jours" value={formData.duree_validite_jours} onChange={handleChange} required/></FormRow>
             </form>
        </Modal>
    )
};

const AgenceForm: FC<{mode: 'add' | 'edit'; currentData: Agence | null; onClose: () => void}> = ({mode, currentData, onClose}) => {
    const { villes, entites, addAgence, updateAgence } = useAppContext();
    const [formData, setFormData] = useState({ nom: currentData?.nom || '', villeId: currentData?.villeId || villes[0]?.id || 0, entiteId: currentData?.entiteId || entites[0]?.id || 0 });
     const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'edit' && currentData) { updateAgence({ ...currentData, ...formData }); } else { addAgence(formData); }
        onClose();
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name.includes('Id') ? Number(value) : value}));
    };
    return (
        <Modal title={mode==='edit' ? 'Modifier Agence' : 'Ajouter Agence'} isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="agenceForm"/>}>
             <form onSubmit={handleSubmit} id="agenceForm">
                <FormRow label="Nom de l'agence"><FormInput name="nom" value={formData.nom} onChange={handleChange} required/></FormRow>
                <FormRow label="Ville">
                    <FormSelect name="villeId" value={formData.villeId} onChange={handleChange}>{villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}</FormSelect>
                </FormRow>
                <FormRow label="Entité">
                    <FormSelect name="entiteId" value={formData.entiteId} onChange={handleChange}>{entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}</FormSelect>
                </FormRow>
             </form>
        </Modal>
    );
};

const EntiteForm: FC<{mode: 'add' | 'edit'; currentData: Entite | null; onClose: () => void}> = ({mode, currentData, onClose}) => {
    const { addEntite, updateEntite } = useAppContext();
    const [nom, setNom] = useState(currentData?.nom || '');
     const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'edit' && currentData) { updateEntite({ ...currentData, nom }); } else { addEntite({ nom }); }
        onClose();
    };
    return (
        <Modal title={mode==='edit' ? 'Modifier Entité' : 'Ajouter Entité'} isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="entiteForm"/>}>
            <form onSubmit={handleSubmit} id="entiteForm">
                <FormRow label="Nom de l'entité"><FormInput value={nom} onChange={(e) => setNom(e.target.value)} required /></FormRow>
            </form>
        </Modal>
    );
};

const VilleForm: FC<{mode: 'add' | 'edit'; currentData: Ville | null; onClose: () => void}> = ({mode, currentData, onClose}) => {
    const { addVille, updateVille } = useAppContext();
    const [nom, setNom] = useState(currentData?.nom || '');
     const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'edit' && currentData) { updateVille({ ...currentData, nom }); } else { addVille({ nom }); }
        onClose();
    };
    return (
        <Modal title={mode==='edit' ? 'Modifier Ville' : 'Ajouter Ville'} isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="villeForm"/>}>
            <form onSubmit={handleSubmit} id="villeForm">
                <FormRow label="Nom de la ville"><FormInput value={nom} onChange={(e) => setNom(e.target.value)} required /></FormRow>
            </form>
        </Modal>
    );
};

const GroupeForm: FC<{mode: 'add' | 'edit'; currentData: Groupe | null; onClose: () => void}> = ({mode, currentData, onClose}) => {
    const { entites, employes, addGroupe, updateGroupe } = useAppContext();
    const [nom, setNom] = useState(currentData?.nom || '');
    const [entiteId, setEntiteId] = useState(currentData?.entiteId || entites[0]?.id || 0);
    const [selectedEmployeIds, setSelectedEmployeIds] = useState<Set<number>>(new Set(currentData?.employeIds || []));

    const availableEmployes = useMemo(() => employes.filter(e => e.entiteId === entiteId), [employes, entiteId]);

    useEffect(() => {
        const newSelection = new Set<number>();
        const availableIds = new Set(availableEmployes.map(e => e.id));
        selectedEmployeIds.forEach(id => {
            if (availableIds.has(id)) {
                newSelection.add(id);
            }
        });
        setSelectedEmployeIds(newSelection);
    }, [entiteId, availableEmployes, selectedEmployeIds]);


    const handleEmployeToggle = (employeId: number) => {
        setSelectedEmployeIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeId)) {
                newSet.delete(employeId);
            } else {
                newSet.add(employeId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = { nom, entiteId, employeIds: [...selectedEmployeIds] };
        if (mode === 'edit' && currentData) {
            updateGroupe({ id: currentData.id, ...submissionData });
        } else {
            addGroupe(submissionData);
        }
        onClose();
    };

    return (
        <Modal title={mode === 'edit' ? 'Modifier le Groupe' : 'Ajouter un Groupe'} isOpen={true} onClose={onClose} footer={<FormFooter onClose={onClose} formId="groupeForm"/>}>
            <form onSubmit={handleSubmit} id="groupeForm">
                <FormRow label="Nom du groupe"><FormInput value={nom} onChange={e => setNom(e.target.value)} required /></FormRow>
                <FormRow label="Entité">
                    <FormSelect value={entiteId} onChange={e => setEntiteId(Number(e.target.value))}>
                        {entites.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                    </FormSelect>
                </FormRow>
                <FormRow label="Membres du groupe">
                    <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-2 bg-gray-50 dark:bg-prox-dark-900 dark:border-gray-600">
                        {availableEmployes.length > 0 ? availableEmployes.map(emp => (
                            <label key={emp.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-prox-dark-700 cursor-pointer">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary dark:border-gray-500"
                                    checked={selectedEmployeIds.has(emp.id)}
                                    onChange={() => handleEmployeToggle(emp.id)}
                                />
                                <span className="ml-3 text-sm text-gray-800 dark:text-prox-text">{emp.prenom} {emp.nom}</span>
                            </label>
                        )) : <p className="text-sm text-gray-500 p-2">Aucun employé dans cette entité.</p>}
                    </div>
                </FormRow>
            </form>
        </Modal>
    );
};


export default Management;