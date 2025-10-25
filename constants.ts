import { Ville, Entite, Agence, Certificat, Employe, EmployeCertificat, StatutCertificat, Groupe, Dossier, Document } from './types';

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const today = new Date();

export const VILLES: Ville[] = [
  { id: 1, nom: 'Paris' },
  { id: 2, nom: 'Lyon' },
  { id: 3, nom: 'Marseille' },
];

export const ENTITES: Entite[] = [
  { id: 1, nom: 'Tech Solutions Inc.' },
  { id: 2, nom: 'Innovate Group' },
];

export const AGENCES: Agence[] = [
  { id: 1, nom: 'Agence Paris Centre', villeId: 1, entiteId: 1 },
  { id: 2, nom: 'Agence Lyon Part-Dieu', villeId: 2, entiteId: 1 },
  { id: 3, nom: 'Agence Marseille Vieux-Port', villeId: 3, entiteId: 2 },
];

export const CERTIFICATS: Certificat[] = [
  { id: 1, nom_certificat: 'Sauveteur Secouriste du Travail (SST)', duree_validite_jours: 730 },
  { id: 2, nom_certificat: 'Habilitation Électrique B1V', duree_validite_jours: 1095 },
  { id: 3, nom_certificat: 'Certification Cloud AWS', duree_validite_jours: 365 },
  { id: 4, nom_certificat: 'Gestion de Projet PMP', duree_validite_jours: 1095 },
];

export const EMPLOYES: Employe[] = [
  { id: 1, nom: 'Dupont', prenom: 'Jean', id_interne: 'TS001', gsm: '0612345678', email: 'jean.dupont@tech.com', entiteId: 1, agenceId: 1 },
  { id: 2, nom: 'Martin', prenom: 'Marie', id_interne: 'TS002', gsm: '0687654321', email: 'marie.martin@tech.com', entiteId: 1, agenceId: 2 },
  { id: 3, nom: 'Bernard', prenom: 'Luc', id_interne: 'IG001', gsm: '0611223344', email: 'luc.bernard@innovate.com', entiteId: 2, agenceId: 3 },
  { id: 4, nom: 'Petit', prenom: 'Sophie', id_interne: 'TS003', gsm: '0655667788', email: 'sophie.petit@tech.com', entiteId: 1, agenceId: 1 },
];

export const EMPLOYE_CERTIFICATS: EmployeCertificat[] = [
  // Valide
  { id: 1, employeId: 1, certificatId: 1, date_obtention: addDays(today, -200).toISOString().split('T')[0], date_expiration: addDays(today, 530).toISOString().split('T')[0], chemin_pdf: '/files/cert1.pdf', statut: StatutCertificat.VALIDE },
  // Expire Bientôt (dans 25 jours)
  { id: 2, employeId: 1, certificatId: 3, date_obtention: addDays(today, -340).toISOString().split('T')[0], date_expiration: addDays(today, 25).toISOString().split('T')[0], chemin_pdf: '/files/cert2.pdf', statut: StatutCertificat.EXPIRE_BIENTOT },
  // Expiré (depuis 50 jours)
  { id: 3, employeId: 2, certificatId: 2, date_obtention: addDays(today, -1145).toISOString().split('T')[0], date_expiration: addDays(today, -50).toISOString().split('T')[0], chemin_pdf: '/files/cert3.pdf', statut: StatutCertificat.EXPIRE },
  // Valide (entité 2)
  { id: 4, employeId: 3, certificatId: 4, date_obtention: addDays(today, -500).toISOString().split('T')[0], date_expiration: addDays(today, 595).toISOString().split('T')[0], chemin_pdf: '/files/cert4.pdf', statut: StatutCertificat.VALIDE },
   // Expire dans 80 jours
  { id: 5, employeId: 4, certificatId: 1, date_obtention: addDays(today, -650).toISOString().split('T')[0], date_expiration: addDays(today, 80).toISOString().split('T')[0], chemin_pdf: '/files/cert5.pdf', statut: StatutCertificat.VALIDE },
   // Expire dans 55 jours
  { id: 6, employeId: 2, certificatId: 4, date_obtention: addDays(today, -1040).toISOString().split('T')[0], date_expiration: addDays(today, 55).toISOString().split('T')[0], chemin_pdf: '/files/cert6.pdf', statut: StatutCertificat.EXPIRE_BIENTOT },
];

export const GROUPES: Groupe[] = [
  { id: 1, nom: 'Équipe SST Paris', entiteId: 1, employeIds: [1, 4] },
  { id: 2, nom: 'Experts Cloud Marseille', entiteId: 2, employeIds: [3] },
];

export const DOSSIERS: Dossier[] = [
    { id: 1, nom: 'Documents RH' },
    { id: 2, nom: 'Contrats de travail' },
    { id: 3, nom: 'Visites Médicales' },
];

export const DOCUMENTS: Document[] = [
    { id: 1, nom: 'Contrat - Jean Dupont.pdf', dossierId: 2, employeId: 1, chemin_pdf: '/docs/contrat_dupont.pdf', date_ajout: '2023-01-15' },
    { id: 2, nom: 'Aptitude - Jean Dupont.pdf', dossierId: 3, employeId: 1, chemin_pdf: '/docs/visite_dupont.pdf', date_ajout: '2023-02-20' },
    { id: 3, nom: 'Contrat - Marie Martin.pdf', dossierId: 2, employeId: 2, chemin_pdf: '/docs/contrat_martin.pdf', date_ajout: '2023-03-10' },
];
