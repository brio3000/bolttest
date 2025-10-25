/*
  # Complete PkiGest Pro Application Schema

  ## Overview
  This migration creates the complete database schema for the PkiGest Pro certificate management application.
  It includes all tables, relationships, indexes, and security policies based on the TypeScript interfaces.

  ## New Tables

  ### `villes` (Cities)
  - `id` (uuid, primary key) - Unique identifier
  - `nom` (text, not null) - City name
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `entites` (Entities/Companies)
  - `id` (uuid, primary key) - Unique identifier
  - `nom` (text, not null) - Entity name
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `agences` (Agencies/Branches)
  - `id` (uuid, primary key) - Unique identifier
  - `nom` (text, not null) - Agency name
  - `ville_id` (uuid, foreign key -> villes.id) - City reference
  - `entite_id` (uuid, foreign key -> entites.id) - Entity reference
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `certificats` (Certificate Types)
  - `id` (uuid, primary key) - Unique identifier
  - `nom_certificat` (text, not null) - Certificate name
  - `duree_validite_jours` (integer, not null) - Validity duration in days
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `employes` (Employees)
  - `id` (uuid, primary key) - Unique identifier
  - `nom` (text, not null) - Last name
  - `prenom` (text, not null) - First name
  - `id_interne` (text, unique, not null) - Internal employee ID
  - `gsm` (text) - Mobile phone number
  - `email` (text, not null) - Email address
  - `entite_id` (uuid, foreign key -> entites.id) - Entity reference
  - `agence_id` (uuid, foreign key -> agences.id) - Agency reference
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `employe_certificats` (Employee Certificates - Junction table)
  - `id` (uuid, primary key) - Unique identifier
  - `employe_id` (uuid, foreign key -> employes.id) - Employee reference
  - `certificat_id` (uuid, foreign key -> certificats.id) - Certificate type reference
  - `date_obtention` (date, not null) - Certificate obtained date
  - `date_expiration` (date, not null) - Certificate expiration date
  - `chemin_pdf` (text) - PDF file path
  - `statut` (text) - Status (Valide, Expire Bientôt, Expiré)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `groupes` (Groups)
  - `id` (uuid, primary key) - Unique identifier
  - `nom` (text, not null) - Group name
  - `entite_id` (uuid, foreign key -> entites.id) - Entity reference
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `groupe_employes` (Group Members - Junction table)
  - `id` (uuid, primary key) - Unique identifier
  - `groupe_id` (uuid, foreign key -> groupes.id) - Group reference
  - `employe_id` (uuid, foreign key -> employes.id) - Employee reference
  - `created_at` (timestamptz) - Record creation timestamp

  ### `dossiers` (Folders)
  - `id` (uuid, primary key) - Unique identifier
  - `nom` (text, not null) - Folder name
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `documents` (Documents)
  - `id` (uuid, primary key) - Unique identifier
  - `nom` (text, not null) - Document name
  - `dossier_id` (uuid, foreign key -> dossiers.id) - Folder reference
  - `employe_id` (uuid, foreign key -> employes.id) - Employee reference
  - `chemin_pdf` (text) - PDF file path
  - `date_ajout` (date, not null) - Date added
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Indexes
  - Index on foreign keys for faster joins
  - Index on email and id_interne for faster employee lookups
  - Index on dates for faster expiration queries

  ## Security
  - Enable RLS on all tables
  - Policies: Authenticated users can perform all operations
  - Future enhancement: Role-based access control (ADMIN vs GESTIONNAIRE)

  ## Important Notes
  - All IDs use UUID for better scalability and security
  - Timestamps are automatically managed with triggers
  - Foreign key constraints ensure referential integrity
  - Cascade deletes are configured where appropriate
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create villes table
CREATE TABLE IF NOT EXISTS villes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create entites table
CREATE TABLE IF NOT EXISTS entites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agences table
CREATE TABLE IF NOT EXISTS agences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  ville_id uuid REFERENCES villes(id) ON DELETE CASCADE,
  entite_id uuid REFERENCES entites(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create certificats table
CREATE TABLE IF NOT EXISTS certificats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom_certificat text NOT NULL,
  duree_validite_jours integer NOT NULL DEFAULT 365,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employes table
CREATE TABLE IF NOT EXISTS employes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  prenom text NOT NULL,
  id_interne text UNIQUE NOT NULL,
  gsm text,
  email text NOT NULL,
  entite_id uuid REFERENCES entites(id) ON DELETE CASCADE,
  agence_id uuid REFERENCES agences(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employe_certificats table
CREATE TABLE IF NOT EXISTS employe_certificats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employe_id uuid REFERENCES employes(id) ON DELETE CASCADE,
  certificat_id uuid REFERENCES certificats(id) ON DELETE CASCADE,
  date_obtention date NOT NULL,
  date_expiration date NOT NULL,
  chemin_pdf text,
  statut text DEFAULT 'Valide' CHECK (statut IN ('Valide', 'Expire Bientôt', 'Expiré')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create groupes table
CREATE TABLE IF NOT EXISTS groupes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  entite_id uuid REFERENCES entites(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create groupe_employes junction table
CREATE TABLE IF NOT EXISTS groupe_employes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  groupe_id uuid REFERENCES groupes(id) ON DELETE CASCADE,
  employe_id uuid REFERENCES employes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(groupe_id, employe_id)
);

-- Create dossiers table
CREATE TABLE IF NOT EXISTS dossiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE,
  employe_id uuid REFERENCES employes(id) ON DELETE CASCADE,
  chemin_pdf text,
  date_ajout date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agences_ville_id ON agences(ville_id);
CREATE INDEX IF NOT EXISTS idx_agences_entite_id ON agences(entite_id);
CREATE INDEX IF NOT EXISTS idx_employes_entite_id ON employes(entite_id);
CREATE INDEX IF NOT EXISTS idx_employes_agence_id ON employes(agence_id);
CREATE INDEX IF NOT EXISTS idx_employes_email ON employes(email);
CREATE INDEX IF NOT EXISTS idx_employes_id_interne ON employes(id_interne);
CREATE INDEX IF NOT EXISTS idx_employe_certificats_employe_id ON employe_certificats(employe_id);
CREATE INDEX IF NOT EXISTS idx_employe_certificats_certificat_id ON employe_certificats(certificat_id);
CREATE INDEX IF NOT EXISTS idx_employe_certificats_date_expiration ON employe_certificats(date_expiration);
CREATE INDEX IF NOT EXISTS idx_groupe_employes_groupe_id ON groupe_employes(groupe_id);
CREATE INDEX IF NOT EXISTS idx_groupe_employes_employe_id ON groupe_employes(employe_id);
CREATE INDEX IF NOT EXISTS idx_groupes_entite_id ON groupes(entite_id);
CREATE INDEX IF NOT EXISTS idx_documents_dossier_id ON documents(dossier_id);
CREATE INDEX IF NOT EXISTS idx_documents_employe_id ON documents(employe_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_villes_updated_at BEFORE UPDATE ON villes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entites_updated_at BEFORE UPDATE ON entites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agences_updated_at BEFORE UPDATE ON agences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificats_updated_at BEFORE UPDATE ON certificats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employes_updated_at BEFORE UPDATE ON employes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employe_certificats_updated_at BEFORE UPDATE ON employe_certificats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groupes_updated_at BEFORE UPDATE ON groupes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON dossiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE villes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entites ENABLE ROW LEVEL SECURITY;
ALTER TABLE agences ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificats ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employe_certificats ENABLE ROW LEVEL SECURITY;
ALTER TABLE groupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE groupe_employes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for villes
CREATE POLICY "Authenticated users can read villes"
  ON villes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert villes"
  ON villes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update villes"
  ON villes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete villes"
  ON villes FOR DELETE TO authenticated USING (true);

-- Create RLS policies for entites
CREATE POLICY "Authenticated users can read entites"
  ON entites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert entites"
  ON entites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update entites"
  ON entites FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete entites"
  ON entites FOR DELETE TO authenticated USING (true);

-- Create RLS policies for agences
CREATE POLICY "Authenticated users can read agences"
  ON agences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert agences"
  ON agences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update agences"
  ON agences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete agences"
  ON agences FOR DELETE TO authenticated USING (true);

-- Create RLS policies for certificats
CREATE POLICY "Authenticated users can read certificats"
  ON certificats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert certificats"
  ON certificats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update certificats"
  ON certificats FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete certificats"
  ON certificats FOR DELETE TO authenticated USING (true);

-- Create RLS policies for employes
CREATE POLICY "Authenticated users can read employes"
  ON employes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert employes"
  ON employes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employes"
  ON employes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete employes"
  ON employes FOR DELETE TO authenticated USING (true);

-- Create RLS policies for employe_certificats
CREATE POLICY "Authenticated users can read employe_certificats"
  ON employe_certificats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert employe_certificats"
  ON employe_certificats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employe_certificats"
  ON employe_certificats FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete employe_certificats"
  ON employe_certificats FOR DELETE TO authenticated USING (true);

-- Create RLS policies for groupes
CREATE POLICY "Authenticated users can read groupes"
  ON groupes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert groupes"
  ON groupes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update groupes"
  ON groupes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete groupes"
  ON groupes FOR DELETE TO authenticated USING (true);

-- Create RLS policies for groupe_employes
CREATE POLICY "Authenticated users can read groupe_employes"
  ON groupe_employes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert groupe_employes"
  ON groupe_employes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update groupe_employes"
  ON groupe_employes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete groupe_employes"
  ON groupe_employes FOR DELETE TO authenticated USING (true);

-- Create RLS policies for dossiers
CREATE POLICY "Authenticated users can read dossiers"
  ON dossiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert dossiers"
  ON dossiers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update dossiers"
  ON dossiers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete dossiers"
  ON dossiers FOR DELETE TO authenticated USING (true);

-- Create RLS policies for documents
CREATE POLICY "Authenticated users can read documents"
  ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert documents"
  ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update documents"
  ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete documents"
  ON documents FOR DELETE TO authenticated USING (true);