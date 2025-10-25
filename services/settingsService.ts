import { supabase } from '../lib/supabase';
import { NotificationSettings } from '../types';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export interface AppSettings {
  id: string;
  logo_url: string | null;
  smtp_host: string;
  smtp_port: number;
  smtp_security: 'none' | 'ssl_tls' | 'starttls';
  smtp_username: string;
  smtp_password: string;
  sender_email: string;
  notification_enabled: boolean;
  notification_days_before: number[];
  email_template_subject: string;
  email_template_body: string;
  created_at: string;
  updated_at: string;
}

export const settingsService = {
  async getSettings(): Promise<AppSettings | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
      return null;
    }

    return data;
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<boolean> {
    const { error } = await supabase
      .from('app_settings')
      .update(settings)
      .eq('id', SETTINGS_ID);

    if (error) {
      console.error('Error updating settings:', error);
      return false;
    }

    return true;
  },

  async uploadLogo(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: existingFiles } = await supabase.storage
      .from('logos')
      .list();

    if (existingFiles && existingFiles.length > 0) {
      for (const existingFile of existingFiles) {
        await supabase.storage.from('logos').remove([existingFile.name]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deleteLogo(logoUrl: string): Promise<boolean> {
    const fileName = logoUrl.split('/').pop();
    if (!fileName) return false;

    const { error } = await supabase.storage
      .from('logos')
      .remove([fileName]);

    if (error) {
      console.error('Error deleting logo:', error);
      return false;
    }

    return true;
  },

  convertToNotificationSettings(dbSettings: AppSettings): NotificationSettings {
    return {
      enabled: dbSettings.notification_enabled,
      daysBefore: dbSettings.notification_days_before,
      senderEmail: dbSettings.sender_email,
      smtp: {
        host: dbSettings.smtp_host,
        port: dbSettings.smtp_port,
        security: dbSettings.smtp_security,
        username: dbSettings.smtp_username,
        password: dbSettings.smtp_password,
      },
      template: {
        subject: dbSettings.email_template_subject,
        body: dbSettings.email_template_body,
      },
    };
  },

  convertFromNotificationSettings(notifSettings: NotificationSettings): Partial<AppSettings> {
    return {
      notification_enabled: notifSettings.enabled,
      notification_days_before: notifSettings.daysBefore,
      sender_email: notifSettings.senderEmail,
      smtp_host: notifSettings.smtp.host,
      smtp_port: notifSettings.smtp.port,
      smtp_security: notifSettings.smtp.security,
      smtp_username: notifSettings.smtp.username || '',
      smtp_password: notifSettings.smtp.password || '',
      email_template_subject: notifSettings.template.subject,
      email_template_body: notifSettings.template.body,
    };
  },
};
