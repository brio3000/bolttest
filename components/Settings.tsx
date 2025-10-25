import React, { useState, useRef, useEffect, memo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { NotificationSettings } from '../types';
import { CogIcon, SunIcon, MoonIcon, ImageIcon, BriefcaseIcon, DatabaseIcon } from './Icons';
import { EmailConfiguration } from './EmailConfiguration';
import { settingsService } from '../services/settingsService';

const Settings: React.FC = memo(() => {
  const { 
    notificationSettings, 
    setNotificationSettings, 
    theme, 
    toggleTheme, 
    logoUrl, 
    setLogoUrl,
    backgroundConfig,
    setBackgroundConfig,
    backupData,
    restoreData
  } = useAppContext();

  const [localSettings, setLocalSettings] = useState(notificationSettings);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Sync local state if global context changes (e.g., after restore)
  useEffect(() => {
    setLocalSettings(notificationSettings);
  }, [notificationSettings]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string, value: any, type?: string } }) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSaved(false);

    setLocalSettings(prev => {
      const newSettings = { ...prev };
      const keys = name.split('.');

      if (keys.length === 2) {
        const section = keys[0] as keyof NotificationSettings;
        const field = keys[1];
        
        const currentSection = newSettings[section];
        if (typeof currentSection === 'object' && currentSection !== null) {
          (newSettings[section] as any) = {
            ...currentSection,
            [field]: type === 'number' ? Number(value) : value,
          };
        }
      } else {
        (newSettings as any)[name] = type === 'checkbox' ? checked : value;
      }
      return newSettings;
    });
  };

  const handleSave = () => {
    setNotificationSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Le fichier est trop volumineux. Veuillez choisir une image de moins de 2 Mo.");
        return;
      }

      const publicUrl = await settingsService.uploadLogo(file);
      if (publicUrl) {
        setLogoUrl(publicUrl);
        await settingsService.updateSettings({ logo_url: publicUrl });
      } else {
        alert("Erreur lors du téléversement du logo.");
      }
    }
  };

  const handleRemoveLogo = async () => {
      if (logoUrl) {
        await settingsService.deleteLogo(logoUrl);
        await settingsService.updateSettings({ logo_url: null });
      }
      setLogoUrl(null);
      if (logoInputRef.current) {
          logoInputRef.current.value = '';
      }
  };

  const handleBgTypeChange = (type: 'default' | 'color' | 'image') => {
    if (type === 'default') {
      setBackgroundConfig({ type: 'default', value: '' });
    } else if (type === 'color') {
      const currentColor = backgroundConfig.type === 'color' ? backgroundConfig.value : '#f3f4f6'; // default light gray
      setBackgroundConfig({ type: 'color', value: currentColor });
    } else if (type === 'image') {
      const currentImage = backgroundConfig.type === 'image' ? backgroundConfig.value : '';
      setBackgroundConfig({ type: 'image', value: currentImage });
    }
  };
  
  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("L'image est trop volumineuse (max 2Mo).");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setBackgroundConfig({ type: 'image', value: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
    if (bgInputRef.current) {
        bgInputRef.current.value = '';
    }
  };
  
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          restoreData(file);
      }
      if (restoreInputRef.current) {
          restoreInputRef.current.value = '';
      }
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-prox-text mb-4">Paramètres Généraux</h2>
      </div>
      
      <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-brand-secondary dark:text-prox-text mb-4 flex items-center">
          <DatabaseIcon className="h-6 w-6 mr-2" />
          Sauvegarde et Restauration
        </h3>
        <p className="text-gray-600 dark:text-prox-text-secondary mb-4">
          Sauvegardez l'ensemble de vos données (employés, certificats, paramètres, etc.) dans un seul fichier. Restaurez à partir d'un fichier pour rétablir un état précédent.
        </p>
        <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/40 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <span className="font-bold">Attention :</span> La restauration d'un fichier écrasera <span className="font-bold">toutes</span> les données actuelles de l'application. Cette action est irréversible.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <input type="file" accept=".json" ref={restoreInputRef} onChange={handleRestoreFileChange} className="hidden" />
            <button
                onClick={backupData}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-blue-700"
            >
                Sauvegarder les données
            </button>
            <button
                onClick={() => restoreInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-brand-secondary dark:text-prox-text bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-prox-dark-700 dark:hover:bg-prox-dark-600"
            >
                Restaurer les données
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-brand-secondary dark:text-prox-text mb-4 flex items-center">
          <CogIcon className="h-6 w-6 mr-2" />
          Notifications par E-mail
        </h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="enabled"
              checked={localSettings.enabled}
              onChange={handleSettingsChange}
              className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary dark:bg-prox-dark-700 dark:border-prox-dark-600"
            />
            <span className="text-gray-700 dark:text-prox-text">Activer les rappels par e-mail</span>
          </label>
          
          {localSettings.enabled && (
             <EmailConfiguration settings={localSettings} onSettingsChange={handleSettingsChange} />
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saved ? 'Enregistré !' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-brand-secondary dark:text-prox-text mb-4 flex items-center">
          <ImageIcon className="h-6 w-6 mr-2" />
          Logo de l'application
        </h3>
        <p className="text-gray-600 dark:text-prox-text-secondary mb-4">
          Téléversez le logo de votre entreprise (format PNG, JPG, SVG recommandé, max 2Mo). Il sera affiché sur la page de connexion et dans la barre latérale.
        </p>
        <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-100 dark:bg-prox-dark-700 rounded-lg flex items-center justify-center border dark:border-prox-dark-600 overflow-hidden">
              {logoUrl ? (
                  <img src={logoUrl} alt="Logo de l'application" className="max-w-full max-h-full object-contain" />
              ) : (
                  <BriefcaseIcon className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/png, image/jpeg, image/svg+xml" ref={logoInputRef} onChange={handleLogoChange} className="hidden" />
              <button
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-secondary rounded-lg hover:bg-gray-700 dark:bg-prox-dark-600 dark:hover:bg-prox-dark-500"
              >
                Changer le logo
              </button>
              {logoUrl && (
                <button
                  onClick={handleRemoveLogo}
                  className="px-4 py-2 text-sm font-medium text-status-expired bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/80"
                >
                  Supprimer
                </button>
              )}
            </div>
        </div>
      </div>

       <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-brand-secondary dark:text-prox-text mb-4 flex items-center">
          <ImageIcon className="h-6 w-6 mr-2" />
          Arrière-plan de l'application
        </h3>
        <p className="text-gray-600 dark:text-prox-text-secondary mb-4">
            Choisissez une couleur unie ou une image pour l'arrière-plan de l'application.
        </p>
        <div className="space-y-4">
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="bg-type" value="default" className="form-radio" checked={backgroundConfig.type === 'default'} onChange={() => handleBgTypeChange('default')}/>
                    Défaut
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="bg-type" value="color" className="form-radio" checked={backgroundConfig.type === 'color'} onChange={() => handleBgTypeChange('color')}/>
                    Couleur
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="bg-type" value="image" className="form-radio" checked={backgroundConfig.type === 'image'} onChange={() => handleBgTypeChange('image')}/>
                    Image
                </label>
            </div>
            
            {backgroundConfig.type === 'color' && (
                <div className="flex items-center gap-4 pl-2 pt-2">
                    <label htmlFor="bgColorPicker" className="text-sm font-medium">Choisir une couleur :</label>
                    <input id="bgColorPicker" type="color" value={backgroundConfig.value || '#f3f4f6'} onChange={(e) => setBackgroundConfig({ type: 'color', value: e.target.value })} className="w-12 h-10 p-1 bg-transparent border-none rounded cursor-pointer"/>
                </div>
            )}

            {backgroundConfig.type === 'image' && (
                <div className="flex items-center gap-4 pl-2 pt-2">
                    <input type="file" accept="image/png, image/jpeg" ref={bgInputRef} onChange={handleBgImageChange} className="hidden" />
                    <button onClick={() => bgInputRef.current?.click()} className="px-4 py-2 text-sm font-medium text-white bg-brand-secondary rounded-lg hover:bg-gray-700">
                        Choisir une image
                    </button>
                    {backgroundConfig.value && (
                        <div className="w-16 h-12 rounded border dark:border-prox-dark-600 overflow-hidden bg-gray-200">
                            <img src={backgroundConfig.value} alt="Aperçu" className="w-full h-full object-cover"/>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>


      <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-prox-text mb-4 flex items-center">
            {theme === 'light' ? <MoonIcon className="h-6 w-6 mr-2" /> : <SunIcon className="h-6 w-6 mr-2" />}
            Thème de l'application
          </h3>
          <p className="text-gray-600 dark:text-prox-text-secondary mb-4">
            Choisissez entre le thème clair et le thème sombre.
          </p>
          <div className="flex items-center space-x-4">
              <span className="text-sm font-medium dark:text-prox-text">Clair</span>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary ${
                  theme === 'dark' ? 'bg-brand-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-medium dark:text-prox-text">Sombre</span>
          </div>
        </div>
    </div>
  );
});
Settings.displayName = 'Settings';

export default Settings;