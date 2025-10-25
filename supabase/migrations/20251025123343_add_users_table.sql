/*
  # Add Users Table

  ## Overview
  This migration adds a users table for storing application user data.

  ## New Tables
  
  ### `users` (Application Users)
  - `id` (uuid, primary key, references auth.users) - User ID from Supabase auth
  - `email` (text, not null, unique) - User email
  - `role` (text, not null) - User role (Administrateur or Gestionnaire)
  - `entite_id` (uuid, foreign key -> entites.id) - Entity assignment for Gestionnaire role
  - `nom` (text, not null) - User display name
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Important Notes
  - Authentication uses Supabase built-in auth.users table
  - The users table extends auth.users with application-specific data
  - Role values: 'Administrateur' or 'Gestionnaire'
  - Gestionnaires are restricted to their assigned entity
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('Administrateur', 'Gestionnaire')),
  entite_id uuid REFERENCES entites(id) ON DELETE SET NULL,
  nom text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_entite_id ON users(entite_id);

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Administrateur'
    )
  );

-- Allow users to be inserted (will be triggered by auth signup)
CREATE POLICY "Allow user creation"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);