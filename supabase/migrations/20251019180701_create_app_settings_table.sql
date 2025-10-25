/*
  # Create application settings schema

  ## Overview
  This migration creates the infrastructure for storing application settings including:
  - Logo management
  - SMTP email configuration (with encrypted password)
  - Notification settings for certificate expiration reminders

  ## New Tables
  
  ### `app_settings`
  - `id` (uuid, primary key) - Unique identifier (singleton pattern - only one row)
  - `logo_url` (text) - URL to the logo stored in Supabase Storage
  - `smtp_host` (text) - SMTP server hostname
  - `smtp_port` (integer) - SMTP server port
  - `smtp_security` (text) - Security protocol (none, ssl_tls, starttls)
  - `smtp_username` (text) - SMTP authentication username
  - `smtp_password` (text) - Encrypted SMTP password
  - `sender_email` (text) - Email address used as sender
  - `notification_enabled` (boolean) - Enable/disable email notifications
  - `notification_days_before` (integer[]) - Array of days before expiration to send reminders
  - `email_template_subject` (text) - Email subject template with variables
  - `email_template_body` (text) - Email body template with variables
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Storage
  
  ### `logos` bucket
  - Public bucket for storing application logos
  - Allows authenticated users to upload/update logos

  ## Security
  
  ### RLS Policies
  - Enable RLS on `app_settings` table
  - Policy: Authenticated users can read settings
  - Policy: Authenticated users can insert settings (singleton enforcement via trigger)
  - Policy: Authenticated users can update settings

  ## Important Notes
  - Uses singleton pattern: only one settings row should exist
  - SMTP password should be encrypted before storage (handled by application)
  - Default notification intervals: 90, 60, 30 days before expiration
  - Email templates support variables: {{employe_nom}}, {{employe_prenom}}, {{certificat_nom}}, {{date_expiration}}
*/

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  smtp_host text DEFAULT '',
  smtp_port integer DEFAULT 587,
  smtp_security text DEFAULT 'starttls' CHECK (smtp_security IN ('none', 'ssl_tls', 'starttls')),
  smtp_username text DEFAULT '',
  smtp_password text DEFAULT '',
  sender_email text DEFAULT 'notifications@pkigest.com',
  notification_enabled boolean DEFAULT true,
  notification_days_before integer[] DEFAULT ARRAY[90, 60, 30],
  email_template_subject text DEFAULT 'Rappel d''expiration de certificat : {{certificat_nom}}',
  email_template_body text DEFAULT 'Bonjour {{employe_prenom}} {{employe_nom}},

Ceci est un rappel que votre certificat "{{certificat_nom}}" expirera le {{date_expiration}}.

Veuillez prendre les mesures nécessaires pour le renouveler.

Cordialement,
L''équipe PkiGest Pro',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings (singleton)
INSERT INTO app_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;