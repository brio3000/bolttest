import { supabase } from '../lib/supabase';
import {
  Ville,
  Entite,
  Agence,
  Certificat,
  Employe,
  EmployeCertificat,
  Groupe,
  Dossier,
  Document,
} from '../types';

interface DbRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
}

interface DbVille extends DbRecord {
  nom: string;
}

interface DbEntite extends DbRecord {
  nom: string;
}

interface DbAgence extends DbRecord {
  nom: string;
  ville_id: string;
  entite_id: string;
}

interface DbCertificat extends DbRecord {
  nom_certificat: string;
  duree_validite_jours: number;
}

interface DbEmploye extends DbRecord {
  nom: string;
  prenom: string;
  id_interne: string;
  gsm: string;
  email: string;
  entite_id: string;
  agence_id: string;
}

interface DbEmployeCertificat extends DbRecord {
  employe_id: string;
  certificat_id: string;
  date_obtention: string;
  date_expiration: string;
  chemin_pdf: string;
  statut: string;
}

interface DbGroupe extends DbRecord {
  nom: string;
  entite_id: string;
}

interface DbGroupeEmploye extends DbRecord {
  groupe_id: string;
  employe_id: string;
}

interface DbDossier extends DbRecord {
  nom: string;
}

interface DbDocument extends DbRecord {
  nom: string;
  dossier_id: string;
  employe_id: string;
  chemin_pdf: string;
  date_ajout: string;
}

const uuidToNumber = (uuid: string): number => {
  return parseInt(uuid.substring(0, 8), 16);
};

const numberToUuid = (num: number): string => {
  return num.toString(16).padStart(8, '0') + '-0000-0000-0000-000000000000';
};

export const dataService = {
  async getVilles(): Promise<Ville[]> {
    const { data, error } = await supabase
      .from('villes')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Error fetching villes:', error);
      return [];
    }

    return (data as DbVille[]).map((v) => ({
      id: uuidToNumber(v.id),
      nom: v.nom,
    }));
  },

  async addVille(ville: Omit<Ville, 'id'>): Promise<Ville | null> {
    const { data, error } = await supabase
      .from('villes')
      .insert({ nom: ville.nom })
      .select()
      .single();

    if (error) {
      console.error('Error adding ville:', error);
      return null;
    }

    const dbVille = data as DbVille;
    return {
      id: uuidToNumber(dbVille.id),
      nom: dbVille.nom,
    };
  },

  async updateVille(ville: Ville): Promise<boolean> {
    const { error } = await supabase
      .from('villes')
      .update({ nom: ville.nom })
      .eq('id', numberToUuid(ville.id));

    if (error) {
      console.error('Error updating ville:', error);
      return false;
    }

    return true;
  },

  async deleteVille(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('villes')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting ville:', error);
      return false;
    }

    return true;
  },

  async getEntites(): Promise<Entite[]> {
    const { data, error } = await supabase
      .from('entites')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Error fetching entites:', error);
      return [];
    }

    return (data as DbEntite[]).map((e) => ({
      id: uuidToNumber(e.id),
      nom: e.nom,
    }));
  },

  async addEntite(entite: Omit<Entite, 'id'>): Promise<Entite | null> {
    const { data, error } = await supabase
      .from('entites')
      .insert({ nom: entite.nom })
      .select()
      .single();

    if (error) {
      console.error('Error adding entite:', error);
      return null;
    }

    const dbEntite = data as DbEntite;
    return {
      id: uuidToNumber(dbEntite.id),
      nom: dbEntite.nom,
    };
  },

  async updateEntite(entite: Entite): Promise<boolean> {
    const { error } = await supabase
      .from('entites')
      .update({ nom: entite.nom })
      .eq('id', numberToUuid(entite.id));

    if (error) {
      console.error('Error updating entite:', error);
      return false;
    }

    return true;
  },

  async deleteEntite(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('entites')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting entite:', error);
      return false;
    }

    return true;
  },

  async getAgences(): Promise<Agence[]> {
    const { data, error } = await supabase
      .from('agences')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Error fetching agences:', error);
      return [];
    }

    return (data as DbAgence[]).map((a) => ({
      id: uuidToNumber(a.id),
      nom: a.nom,
      villeId: uuidToNumber(a.ville_id),
      entiteId: uuidToNumber(a.entite_id),
    }));
  },

  async addAgence(agence: Omit<Agence, 'id'>): Promise<Agence | null> {
    const { data, error } = await supabase
      .from('agences')
      .insert({
        nom: agence.nom,
        ville_id: numberToUuid(agence.villeId),
        entite_id: numberToUuid(agence.entiteId),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding agence:', error);
      return null;
    }

    const dbAgence = data as DbAgence;
    return {
      id: uuidToNumber(dbAgence.id),
      nom: dbAgence.nom,
      villeId: uuidToNumber(dbAgence.ville_id),
      entiteId: uuidToNumber(dbAgence.entite_id),
    };
  },

  async updateAgence(agence: Agence): Promise<boolean> {
    const { error } = await supabase
      .from('agences')
      .update({
        nom: agence.nom,
        ville_id: numberToUuid(agence.villeId),
        entite_id: numberToUuid(agence.entiteId),
      })
      .eq('id', numberToUuid(agence.id));

    if (error) {
      console.error('Error updating agence:', error);
      return false;
    }

    return true;
  },

  async deleteAgence(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('agences')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting agence:', error);
      return false;
    }

    return true;
  },

  async getCertificats(): Promise<Certificat[]> {
    const { data, error } = await supabase
      .from('certificats')
      .select('*')
      .order('nom_certificat');

    if (error) {
      console.error('Error fetching certificats:', error);
      return [];
    }

    return (data as DbCertificat[]).map((c) => ({
      id: uuidToNumber(c.id),
      nom_certificat: c.nom_certificat,
      duree_validite_jours: c.duree_validite_jours,
    }));
  },

  async addCertificat(certificat: Omit<Certificat, 'id'>): Promise<Certificat | null> {
    const { data, error } = await supabase
      .from('certificats')
      .insert({
        nom_certificat: certificat.nom_certificat,
        duree_validite_jours: certificat.duree_validite_jours,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding certificat:', error);
      return null;
    }

    const dbCertificat = data as DbCertificat;
    return {
      id: uuidToNumber(dbCertificat.id),
      nom_certificat: dbCertificat.nom_certificat,
      duree_validite_jours: dbCertificat.duree_validite_jours,
    };
  },

  async updateCertificat(certificat: Certificat): Promise<boolean> {
    const { error } = await supabase
      .from('certificats')
      .update({
        nom_certificat: certificat.nom_certificat,
        duree_validite_jours: certificat.duree_validite_jours,
      })
      .eq('id', numberToUuid(certificat.id));

    if (error) {
      console.error('Error updating certificat:', error);
      return false;
    }

    return true;
  },

  async deleteCertificat(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('certificats')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting certificat:', error);
      return false;
    }

    return true;
  },

  async getEmployes(): Promise<Employe[]> {
    const { data, error } = await supabase
      .from('employes')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Error fetching employes:', error);
      return [];
    }

    return (data as DbEmploye[]).map((e) => ({
      id: uuidToNumber(e.id),
      nom: e.nom,
      prenom: e.prenom,
      id_interne: e.id_interne,
      gsm: e.gsm,
      email: e.email,
      entiteId: uuidToNumber(e.entite_id),
      agenceId: uuidToNumber(e.agence_id),
    }));
  },

  async addEmploye(employe: Omit<Employe, 'id'>): Promise<Employe | null> {
    const { data, error } = await supabase
      .from('employes')
      .insert({
        nom: employe.nom,
        prenom: employe.prenom,
        id_interne: employe.id_interne,
        gsm: employe.gsm,
        email: employe.email,
        entite_id: numberToUuid(employe.entiteId),
        agence_id: numberToUuid(employe.agenceId),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding employe:', error);
      return null;
    }

    const dbEmploye = data as DbEmploye;
    return {
      id: uuidToNumber(dbEmploye.id),
      nom: dbEmploye.nom,
      prenom: dbEmploye.prenom,
      id_interne: dbEmploye.id_interne,
      gsm: dbEmploye.gsm,
      email: dbEmploye.email,
      entiteId: uuidToNumber(dbEmploye.entite_id),
      agenceId: uuidToNumber(dbEmploye.agence_id),
    };
  },

  async updateEmploye(employe: Employe): Promise<boolean> {
    const { error } = await supabase
      .from('employes')
      .update({
        nom: employe.nom,
        prenom: employe.prenom,
        id_interne: employe.id_interne,
        gsm: employe.gsm,
        email: employe.email,
        entite_id: numberToUuid(employe.entiteId),
        agence_id: numberToUuid(employe.agenceId),
      })
      .eq('id', numberToUuid(employe.id));

    if (error) {
      console.error('Error updating employe:', error);
      return false;
    }

    return true;
  },

  async deleteEmploye(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('employes')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting employe:', error);
      return false;
    }

    return true;
  },

  async getEmployeCertificats(): Promise<EmployeCertificat[]> {
    const { data, error } = await supabase
      .from('employe_certificats')
      .select('*')
      .order('date_expiration');

    if (error) {
      console.error('Error fetching employe_certificats:', error);
      return [];
    }

    return (data as DbEmployeCertificat[]).map((ec) => ({
      id: uuidToNumber(ec.id),
      employeId: uuidToNumber(ec.employe_id),
      certificatId: uuidToNumber(ec.certificat_id),
      date_obtention: ec.date_obtention,
      date_expiration: ec.date_expiration,
      chemin_pdf: ec.chemin_pdf,
      statut: ec.statut as any,
    }));
  },

  async addEmployeCertificat(
    employeCertificat: Omit<EmployeCertificat, 'id'>
  ): Promise<EmployeCertificat | null> {
    const { data, error } = await supabase
      .from('employe_certificats')
      .insert({
        employe_id: numberToUuid(employeCertificat.employeId),
        certificat_id: numberToUuid(employeCertificat.certificatId),
        date_obtention: employeCertificat.date_obtention,
        date_expiration: employeCertificat.date_expiration,
        chemin_pdf: employeCertificat.chemin_pdf,
        statut: employeCertificat.statut,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding employe_certificat:', error);
      return null;
    }

    const dbEmployeCertificat = data as DbEmployeCertificat;
    return {
      id: uuidToNumber(dbEmployeCertificat.id),
      employeId: uuidToNumber(dbEmployeCertificat.employe_id),
      certificatId: uuidToNumber(dbEmployeCertificat.certificat_id),
      date_obtention: dbEmployeCertificat.date_obtention,
      date_expiration: dbEmployeCertificat.date_expiration,
      chemin_pdf: dbEmployeCertificat.chemin_pdf,
      statut: dbEmployeCertificat.statut as any,
    };
  },

  async updateEmployeCertificat(employeCertificat: EmployeCertificat): Promise<boolean> {
    const { error } = await supabase
      .from('employe_certificats')
      .update({
        employe_id: numberToUuid(employeCertificat.employeId),
        certificat_id: numberToUuid(employeCertificat.certificatId),
        date_obtention: employeCertificat.date_obtention,
        date_expiration: employeCertificat.date_expiration,
        chemin_pdf: employeCertificat.chemin_pdf,
        statut: employeCertificat.statut,
      })
      .eq('id', numberToUuid(employeCertificat.id));

    if (error) {
      console.error('Error updating employe_certificat:', error);
      return false;
    }

    return true;
  },

  async deleteEmployeCertificat(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('employe_certificats')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting employe_certificat:', error);
      return false;
    }

    return true;
  },

  async getGroupes(): Promise<Groupe[]> {
    const { data: groupesData, error: groupesError } = await supabase
      .from('groupes')
      .select('*')
      .order('nom');

    if (groupesError) {
      console.error('Error fetching groupes:', groupesError);
      return [];
    }

    const groupes: Groupe[] = [];

    for (const groupe of groupesData as DbGroupe[]) {
      const { data: membersData, error: membersError } = await supabase
        .from('groupe_employes')
        .select('employe_id')
        .eq('groupe_id', groupe.id);

      if (membersError) {
        console.error('Error fetching groupe members:', membersError);
        continue;
      }

      groupes.push({
        id: uuidToNumber(groupe.id),
        nom: groupe.nom,
        entiteId: uuidToNumber(groupe.entite_id),
        employeIds: (membersData as DbGroupeEmploye[]).map((m) => uuidToNumber(m.employe_id)),
      });
    }

    return groupes;
  },

  async addGroupe(groupe: Omit<Groupe, 'id'>): Promise<Groupe | null> {
    const { data, error } = await supabase
      .from('groupes')
      .insert({
        nom: groupe.nom,
        entite_id: numberToUuid(groupe.entiteId),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding groupe:', error);
      return null;
    }

    const dbGroupe = data as DbGroupe;

    if (groupe.employeIds.length > 0) {
      const members = groupe.employeIds.map((employeId) => ({
        groupe_id: dbGroupe.id,
        employe_id: numberToUuid(employeId),
      }));

      const { error: membersError } = await supabase
        .from('groupe_employes')
        .insert(members);

      if (membersError) {
        console.error('Error adding groupe members:', membersError);
      }
    }

    return {
      id: uuidToNumber(dbGroupe.id),
      nom: dbGroupe.nom,
      entiteId: uuidToNumber(dbGroupe.entite_id),
      employeIds: groupe.employeIds,
    };
  },

  async updateGroupe(groupe: Groupe): Promise<boolean> {
    const { error } = await supabase
      .from('groupes')
      .update({
        nom: groupe.nom,
        entite_id: numberToUuid(groupe.entiteId),
      })
      .eq('id', numberToUuid(groupe.id));

    if (error) {
      console.error('Error updating groupe:', error);
      return false;
    }

    await supabase
      .from('groupe_employes')
      .delete()
      .eq('groupe_id', numberToUuid(groupe.id));

    if (groupe.employeIds.length > 0) {
      const members = groupe.employeIds.map((employeId) => ({
        groupe_id: numberToUuid(groupe.id),
        employe_id: numberToUuid(employeId),
      }));

      const { error: membersError } = await supabase
        .from('groupe_employes')
        .insert(members);

      if (membersError) {
        console.error('Error updating groupe members:', membersError);
        return false;
      }
    }

    return true;
  },

  async deleteGroupe(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('groupes')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting groupe:', error);
      return false;
    }

    return true;
  },

  async getDossiers(): Promise<Dossier[]> {
    const { data, error } = await supabase
      .from('dossiers')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Error fetching dossiers:', error);
      return [];
    }

    return (data as DbDossier[]).map((d) => ({
      id: uuidToNumber(d.id),
      nom: d.nom,
    }));
  },

  async addDossier(dossier: Omit<Dossier, 'id'>): Promise<Dossier | null> {
    const { data, error } = await supabase
      .from('dossiers')
      .insert({ nom: dossier.nom })
      .select()
      .single();

    if (error) {
      console.error('Error adding dossier:', error);
      return null;
    }

    const dbDossier = data as DbDossier;
    return {
      id: uuidToNumber(dbDossier.id),
      nom: dbDossier.nom,
    };
  },

  async deleteDossier(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('dossiers')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting dossier:', error);
      return false;
    }

    return true;
  },

  async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('date_ajout', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return (data as DbDocument[]).map((d) => ({
      id: uuidToNumber(d.id),
      nom: d.nom,
      dossierId: uuidToNumber(d.dossier_id),
      employeId: uuidToNumber(d.employe_id),
      chemin_pdf: d.chemin_pdf,
      date_ajout: d.date_ajout,
    }));
  },

  async addDocument(document: Omit<Document, 'id'>): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        nom: document.nom,
        dossier_id: numberToUuid(document.dossierId),
        employe_id: numberToUuid(document.employeId),
        chemin_pdf: document.chemin_pdf,
        date_ajout: document.date_ajout,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding document:', error);
      return null;
    }

    const dbDocument = data as DbDocument;
    return {
      id: uuidToNumber(dbDocument.id),
      nom: dbDocument.nom,
      dossierId: uuidToNumber(dbDocument.dossier_id),
      employeId: uuidToNumber(dbDocument.employe_id),
      chemin_pdf: dbDocument.chemin_pdf,
      date_ajout: dbDocument.date_ajout,
    };
  },

  async deleteDocument(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', numberToUuid(id));

    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }

    return true;
  },
};
