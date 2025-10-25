export enum UserRole {
  ADMIN = 'Administrateur',
  GESTIONNAIRE = 'Gestionnaire',
}

export enum View {
  DASHBOARD = 'Tableau de Bord',
  MANAGEMENT = 'Gestion',
  DOCS = 'Docs',
  SETTINGS = 'Paramètres',
}

export enum ManagementTab {
    EMPLOYES = 'Employés',
    CERTIFICATS = 'Certificats',
    GROUPES = 'Groupes',
    TYPES_CERTIFICATS = 'Types de Certificats',
    AGENCES = 'Agences',
    ENTITES = 'Entités',
    VILLES = 'Villes',
}

export enum StatutCertificat {
  VALIDE = 'Valide',
  EXPIRE_BIENTOT = 'Expire Bientôt',
  EXPIRE = 'Expiré',
}

export interface User {
  nom: string;
  role: UserRole;
  entiteId?: number; // Gestionnaire might be tied to an entity
}

export interface Ville {
  id: number;
  nom: string;
}

export interface Entite {
  id: number;
  nom: string;
}

export interface Agence {
  id: number;
  nom: string;
  villeId: number;
  entiteId: number;
}

export interface Certificat {
  id: number;
  nom_certificat: string;
  duree_validite_jours: number;
}

export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  id_interne: string;
  gsm: string;
  email: string;
  entiteId: number;
  agenceId: number;
}

export interface EmployeCertificat {
  id: number;
  employeId: number;
  certificatId: number;
  date_obtention: string;
  date_expiration: string;
  chemin_pdf: string;
  statut: StatutCertificat;
}

export interface Groupe {
    id: number;
    nom: string;
    entiteId: number;
    employeIds: number[];
}

export interface Dossier {
    id: number;
    nom: string;
}

export interface Document {
    id: number;
    nom: string;
    dossierId: number;
    employeId: number;
    chemin_pdf: string;
    date_ajout: string;
}

export interface SmtpSettings {
    host: string;
    port: number;
    security: 'none' | 'ssl_tls' | 'starttls';
    username?: string;
    password?: string;
}

export interface EmailTemplate {
    subject: string;
    body: string;
}

export interface NotificationSettings {
    enabled: boolean;
    daysBefore: number[];
    senderEmail: string;
    smtp: SmtpSettings;
    template: EmailTemplate;
}