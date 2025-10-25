import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, UserRole, Ville, Entite, Agence, Certificat, Employe, EmployeCertificat, StatutCertificat, Groupe, Dossier, Document, NotificationSettings } from '../types';
import { settingsService } from '../services/settingsService';
import { dataService } from '../services/dataService';
import { supabase } from '../lib/supabase';

export interface BackgroundConfig {
  type: 'color' | 'image' | 'default';
  value: string;
}

interface AppContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    logoUrl: string | null;
    setLogoUrl: (url: string | null) => void;
    backgroundConfig: BackgroundConfig;
    setBackgroundConfig: (config: BackgroundConfig) => void;

    villes: Ville[];
    entites: Entite[];
    agences: Agence[];
    certificats: Certificat[];
    employes: Employe[];
    employeCertificats: EmployeCertificat[];
    groupes: Groupe[];
    dossiers: Dossier[];
    documents: Document[];

    getFilteredEmployes: () => Employe[];
    getFilteredEmployeCertificats: () => EmployeCertificat[];
    getCertificateStatus: (dateExpiration: string) => StatutCertificat;

    notificationSettings: NotificationSettings;
    setNotificationSettings: (settings: NotificationSettings) => void;

    addVille: (data: Omit<Ville, 'id'>) => void;
    updateVille: (data: Ville) => void;
    deleteVille: (id: number) => void;
    addEntite: (data: Omit<Entite, 'id'>) => void;
    updateEntite: (data: Entite) => void;
    deleteEntite: (id: number) => void;
    addAgence: (data: Omit<Agence, 'id'>) => void;
    updateAgence: (data: Agence) => void;
    deleteAgence: (id: number) => void;
    addCertificat: (data: Omit<Certificat, 'id'>) => void;
    updateCertificat: (data: Certificat) => void;
    deleteCertificat: (id: number) => void;
    addEmploye: (data: Omit<Employe, 'id'>) => void;
    updateEmploye: (data: Employe) => void;
    deleteEmploye: (id: number) => void;
    addEmployeCertificat: (data: Omit<EmployeCertificat, 'id' | 'date_expiration' | 'statut'>) => void;
    updateEmployeCertificat: (data: EmployeCertificat) => void;
    deleteEmployeCertificat: (id: number) => void;
    addGroupe: (data: Omit<Groupe, 'id'>) => void;
    updateGroupe: (data: Groupe) => void;
    deleteGroupe: (id: number) => void;
    addDossier: (data: Omit<Dossier, 'id'>) => void;
    deleteDossier: (id: number) => void;
    addDocument: (data: Omit<Document, 'id'>) => void;
    deleteDocument: (id: number) => void;

    confirmationState: { isOpen: boolean; message: string; onConfirm?: () => void };
    showConfirmation: (message: string, onConfirm: () => void) => void;
    hideConfirmation: () => void;
    confirmAction: () => void;

    backupData: () => void;
    restoreData: (file: File) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialNotificationSettings: NotificationSettings = {
    enabled: true,
    daysBefore: [90, 60, 30],
    senderEmail: 'notifications@pkigest.com',
    smtp: {
        host: 'smtp.votreserveur.com',
        port: 587,
        security: 'starttls',
        username: 'votre.email@domaine.com',
        password: '',
    },
    template: {
        subject: 'Rappel d\'expiration de certificat : {{certificat_nom}}',
        body: `Bonjour {{employe_prenom}} {{employe_nom}},\n\nCeci est un rappel que votre certificat "{{certificat_nom}}" expirera le {{date_expiration}}.\n\nVeuillez prendre les mesures nécessaires pour le renouveler.\n\nCordialement,\nL'équipe PkiGest Pro`,
    },
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>(() => {
        const stored = localStorage.getItem('backgroundConfig');
        if (stored) {
            return JSON.parse(stored) as BackgroundConfig;
        }
        return { type: 'default', value: '' };
    });
    const [villes, setVilles] = useState<Ville[]>([]);
    const [entites, setEntites] = useState<Entite[]>([]);
    const [agences, setAgences] = useState<Agence[]>([]);
    const [certificats, setCertificats] = useState<Certificat[]>([]);
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [employeCertificats, setEmployeCertificats] = useState<EmployeCertificat[]>([]);
    const [groupes, setGroupes] = useState<Groupe[]>([]);
    const [dossiers, setDossiers] = useState<Dossier[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
    const [confirmationState, setConfirmationState] = useState({ isOpen: false, message: '', onConfirm: undefined as (() => void) | undefined });
    const [dataLoaded, setDataLoaded] = useState(false);

    const login = (role: UserRole) => {
        if (role === UserRole.ADMIN) {
            setUser({ nom: 'Admin', role: UserRole.ADMIN });
        } else {
            setUser({ nom: 'Gestionnaire', role: UserRole.GESTIONNAIRE, entiteId: 1 });
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            (async () => {
                if (session?.user) {
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (userData && !error) {
                        setUser({
                            nom: userData.nom,
                            role: userData.role as UserRole,
                            entiteId: userData.entite_id ? parseInt(userData.entite_id.substring(0, 8), 16) : undefined,
                        });
                    }
                } else {
                    setUser(null);
                }
            })();
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const loadAllData = async () => {
            const dbSettings = await settingsService.getSettings();
            if (dbSettings) {
                setLogoUrl(dbSettings.logo_url);
                const notifSettings = settingsService.convertToNotificationSettings(dbSettings);
                setNotificationSettings(notifSettings);
            }

            const [villesData, entitesData, agencesData, certificatsData, employesData, employeCertificatsData, groupesData, dossiersData, documentsData] = await Promise.all([
                dataService.getVilles(),
                dataService.getEntites(),
                dataService.getAgences(),
                dataService.getCertificats(),
                dataService.getEmployes(),
                dataService.getEmployeCertificats(),
                dataService.getGroupes(),
                dataService.getDossiers(),
                dataService.getDocuments(),
            ]);

            setVilles(villesData);
            setEntites(entitesData);
            setAgences(agencesData);
            setCertificats(certificatsData);
            setEmployes(employesData);
            setEmployeCertificats(employeCertificatsData);
            setGroupes(groupesData);
            setDossiers(dossiersData);
            setDocuments(documentsData);
            setDataLoaded(true);
        };
        loadAllData();
    }, []);

    useEffect(() => {
        localStorage.setItem('backgroundConfig', JSON.stringify(backgroundConfig));
        const body = document.body;

        body.style.backgroundImage = '';
        body.style.backgroundColor = '';
        body.style.backgroundSize = '';
        body.style.backgroundPosition = '';
        body.style.backgroundAttachment = '';

        if (backgroundConfig.type === 'color') {
            body.style.backgroundColor = backgroundConfig.value;
        } else if (backgroundConfig.type === 'image') {
            body.style.backgroundImage = `url(${backgroundConfig.value})`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
        }
    }, [backgroundConfig]);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || (storedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }, []);

    const showConfirmation = (message: string, onConfirm: () => void) => {
        setConfirmationState({ isOpen: true, message, onConfirm });
    };
    const hideConfirmation = () => {
        setConfirmationState({ isOpen: false, message: '', onConfirm: undefined });
    };
    const confirmAction = () => {
        if (confirmationState.onConfirm) {
            confirmationState.onConfirm();
        }
        hideConfirmation();
    };

    const getCertificateStatus = useCallback((dateExpiration: string): StatutCertificat => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expirationDate = new Date(dateExpiration);
        const diffTime = expirationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const maxDaysBefore = notificationSettings.daysBefore.length > 0 ? Math.max(...notificationSettings.daysBefore) : 0;

        if (diffDays < 0) return StatutCertificat.EXPIRE;
        if (diffDays <= maxDaysBefore) return StatutCertificat.EXPIRE_BIENTOT;
        return StatutCertificat.VALIDE;
    }, [notificationSettings.daysBefore]);

    const handleSetNotificationSettings = async (settings: NotificationSettings) => {
        setNotificationSettings(settings);
        const dbSettings = settingsService.convertFromNotificationSettings(settings);
        await settingsService.updateSettings(dbSettings);
    };

    const getFilteredEmployes = useCallback(() => {
        if (user?.role === UserRole.ADMIN) {
            return employes;
        }
        if (user?.role === UserRole.GESTIONNAIRE && user.entiteId) {
            return employes.filter(e => e.entiteId === user.entiteId);
        }
        return [];
    }, [user, employes]);

    const getFilteredEmployeCertificats = useCallback(() => {
        const filteredEmployeIds = new Set(getFilteredEmployes().map(e => e.id));
        return employeCertificats.filter(ec => filteredEmployeIds.has(ec.employeId));
    }, [getFilteredEmployes, employeCertificats]);

    const addVille = async (data: Omit<Ville, 'id'>) => {
        const newVille = await dataService.addVille(data);
        if (newVille) {
            setVilles(prev => [...prev, newVille]);
        }
    };

    const updateVille = async (data: Ville) => {
        const success = await dataService.updateVille(data);
        if (success) {
            setVilles(prev => prev.map(item => item.id === data.id ? data : item));
        }
    };

    const deleteVille = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer cette ville ?', async () => {
            const success = await dataService.deleteVille(id);
            if (success) {
                setVilles(prev => prev.filter(item => item.id !== id));
            }
        });
    };

    const addEntite = async (data: Omit<Entite, 'id'>) => {
        const newEntite = await dataService.addEntite(data);
        if (newEntite) {
            setEntites(prev => [...prev, newEntite]);
        }
    };

    const updateEntite = async (data: Entite) => {
        const success = await dataService.updateEntite(data);
        if (success) {
            setEntites(prev => prev.map(item => item.id === data.id ? data : item));
        }
    };

    const deleteEntite = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer cette entité ?', async () => {
            const success = await dataService.deleteEntite(id);
            if (success) {
                setEntites(prev => prev.filter(item => item.id !== id));
            }
        });
    };

    const addAgence = async (data: Omit<Agence, 'id'>) => {
        const newAgence = await dataService.addAgence(data);
        if (newAgence) {
            setAgences(prev => [...prev, newAgence]);
        }
    };

    const updateAgence = async (data: Agence) => {
        const success = await dataService.updateAgence(data);
        if (success) {
            setAgences(prev => prev.map(item => item.id === data.id ? data : item));
        }
    };

    const deleteAgence = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer cette agence ?', async () => {
            const success = await dataService.deleteAgence(id);
            if (success) {
                setAgences(prev => prev.filter(item => item.id !== id));
            }
        });
    };

    const addCertificat = async (data: Omit<Certificat, 'id'>) => {
        const newCertificat = await dataService.addCertificat(data);
        if (newCertificat) {
            setCertificats(prev => [...prev, newCertificat]);
        }
    };

    const updateCertificat = async (data: Certificat) => {
        const success = await dataService.updateCertificat(data);
        if (success) {
            setCertificats(prev => prev.map(item => item.id === data.id ? data : item));
        }
    };

    const deleteCertificat = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer ce type de certificat ?', async () => {
            const success = await dataService.deleteCertificat(id);
            if (success) {
                setCertificats(prev => prev.filter(item => item.id !== id));
            }
        });
    };

    const addEmploye = async (data: Omit<Employe, 'id'>) => {
        const newEmploye = await dataService.addEmploye(data);
        if (newEmploye) {
            setEmployes(prev => [...prev, newEmploye]);
        }
    };

    const updateEmploye = async (data: Employe) => {
        const success = await dataService.updateEmploye(data);
        if (success) {
            setEmployes(prev => prev.map(item => item.id === data.id ? data : item));
        }
    };

    const deleteEmploye = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer cet employé ?', async () => {
            const success = await dataService.deleteEmploye(id);
            if (success) {
                setEmployes(prev => prev.filter(item => item.id !== id));
            }
        });
    };

    const addGroupe = async (data: Omit<Groupe, 'id'>) => {
        const newGroupe = await dataService.addGroupe(data);
        if (newGroupe) {
            setGroupes(prev => [...prev, newGroupe]);
        }
    };

    const updateGroupe = async (data: Groupe) => {
        const success = await dataService.updateGroupe(data);
        if (success) {
            setGroupes(prev => prev.map(item => item.id === data.id ? data : item));
        }
    };

    const deleteGroupe = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer ce groupe ?', async () => {
            const success = await dataService.deleteGroupe(id);
            if (success) {
                setGroupes(prev => prev.filter(item => item.id !== id));
            }
        });
    };

    const addDossier = async (data: Omit<Dossier, 'id'>) => {
        const newDossier = await dataService.addDossier(data);
        if (newDossier) {
            setDossiers(prev => [...prev, newDossier]);
        }
    };

    const deleteDossier = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer ce dossier ?', async () => {
            const success = await dataService.deleteDossier(id);
            if (success) {
                setDossiers(prev => prev.filter(item => item.id !== id));
            }
        });
    };

    const addDocument = async (data: Omit<Document, 'id'>) => {
        const newDocument = await dataService.addDocument(data);
        if (newDocument) {
            setDocuments(prev => [...prev, newDocument]);
        }
    };

    const deleteDocument = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer ce document ?', async () => {
            const success = await dataService.deleteDocument(id);
            if (success) {
                setDocuments(prev => prev.filter(item => item.id !== id));
            }
        });
    };

    const addEmployeCertificat = async (data: Omit<EmployeCertificat, 'id' | 'date_expiration' | 'statut'>) => {
        const certifType = certificats.find(c => c.id === data.certificatId);
        if (!certifType) return;

        const obtentionDate = new Date(data.date_obtention);
        const expirationDate = new Date(obtentionDate.setDate(obtentionDate.getDate() + certifType.duree_validite_jours));
        const date_expiration = expirationDate.toISOString().split('T')[0];
        const statut = getCertificateStatus(date_expiration);

        const newCert: Omit<EmployeCertificat, 'id'> = {
            ...data,
            date_expiration,
            statut,
        };

        const addedCert = await dataService.addEmployeCertificat(newCert);
        if (addedCert) {
            setEmployeCertificats(prev => [...prev, addedCert]);
        }
    };

    const updateEmployeCertificat = async (data: EmployeCertificat) => {
        const certifType = certificats.find(c => c.id === data.certificatId);
        if (!certifType) return;

        const obtentionDate = new Date(data.date_obtention);
        obtentionDate.setDate(obtentionDate.getDate() + certifType.duree_validite_jours);
        const date_expiration = obtentionDate.toISOString().split('T')[0];
        const statut = getCertificateStatus(date_expiration);

        const updatedData = { ...data, date_expiration, statut };
        const success = await dataService.updateEmployeCertificat(updatedData);
        if (success) {
            setEmployeCertificats(prev => prev.map(ec => ec.id === data.id ? updatedData : ec));
        }
    };

    const deleteEmployeCertificat = (id: number) => {
        showConfirmation('Voulez-vous vraiment supprimer ce certificat pour cet employé ?', async () => {
            const success = await dataService.deleteEmployeCertificat(id);
            if (success) {
                setEmployeCertificats(prev => prev.filter(ec => ec.id !== id));
            }
        });
    };

    const backupData = () => {
        const backupObject = {
            villes, entites, agences, certificats, employes, employeCertificats, groupes, dossiers, documents,
            notificationSettings,
            logoUrl, backgroundConfig,
        };
        const jsonString = JSON.stringify(backupObject, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `pkigest-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const restoreData = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                if (!text) throw new Error("Le fichier est vide.");
                const data = JSON.parse(text);

                const requiredKeys = ['villes', 'entites', 'agences', 'certificats', 'employes', 'employeCertificats', 'groupes', 'dossiers', 'documents', 'notificationSettings'];
                for (const key of requiredKeys) {
                    if (!(key in data)) {
                        throw new Error(`Fichier de sauvegarde invalide ou corrompu. Clé manquante : ${key}`);
                    }
                }

                showConfirmation(
                    "Êtes-vous sûr de vouloir restaurer les données ? L'ensemble des données actuelles sera écrasé. Cette action est irréversible.",
                    () => {
                        setVilles(data.villes);
                        setEntites(data.entites);
                        setAgences(data.agences);
                        setCertificats(data.certificats);
                        setEmployes(data.employes);
                        setEmployeCertificats(data.employeCertificats);
                        setGroupes(data.groupes);
                        setDossiers(data.dossiers);
                        setDocuments(data.documents);
                        setNotificationSettings(data.notificationSettings || initialNotificationSettings);
                        setLogoUrl(data.logoUrl || null);
                        setBackgroundConfig(data.backgroundConfig || { type: 'default', value: '' });
                        alert("Restauration terminée avec succès !");
                    }
                );
            } catch (error: any) {
                alert(`Erreur lors de la restauration : ${error.message}`);
            }
        };
        reader.onerror = () => alert("Erreur de lecture du fichier.");
        reader.readAsText(file);
    };

    const value = {
        user, login, logout, theme, toggleTheme, logoUrl, setLogoUrl, backgroundConfig, setBackgroundConfig,
        villes, entites, agences, certificats, employes, employeCertificats, groupes, dossiers, documents,
        getFilteredEmployes, getFilteredEmployeCertificats, getCertificateStatus,
        notificationSettings, setNotificationSettings: handleSetNotificationSettings,
        addVille, updateVille, deleteVille,
        addEntite, updateEntite, deleteEntite,
        addAgence, updateAgence, deleteAgence,
        addCertificat, updateCertificat, deleteCertificat,
        addEmploye, updateEmploye, deleteEmploye,
        addEmployeCertificat, updateEmployeCertificat, deleteEmployeCertificat,
        addGroupe, updateGroupe, deleteGroupe,
        addDossier, deleteDossier,
        addDocument, deleteDocument,
        confirmationState, showConfirmation, hideConfirmation, confirmAction,
        backupData, restoreData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
