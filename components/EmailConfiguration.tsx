import React, { useState, useEffect } from 'react';
import { NotificationSettings } from '../types';
import { CloseIcon } from './Icons';

interface EmailConfigurationProps {
  settings: NotificationSettings;
  onSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string, value: any, type?: string } }) => void;
}

const FormRow: React.FC<{ label: string; htmlFor?: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-prox-text mb-1">
            {label}
        </label>
        {children}
    </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white dark:bg-prox-dark-700 dark:border-prox-dark-600 dark:text-prox-text" />
);

export const EmailConfiguration: React.FC<EmailConfigurationProps> = ({ settings, onSettingsChange }) => {
    const [testRecipient, setTestRecipient] = useState('');
    const [testStatus, setTestStatus] = useState<{ message: string; success?: boolean } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [subjectError, setSubjectError] = useState<string | null>(null);
    const [newDay, setNewDay] = useState('');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const availableVariables = ['{{employe_nom}}', '{{employe_prenom}}', '{{certificat_nom}}', '{{date_expiration}}'];

    useEffect(() => {
        const subject = settings.template.subject;
        const hasVariable = availableVariables.some(variable => subject.includes(variable));

        if (!hasVariable) {
            setSubjectError("Le sujet doit contenir au moins une variable (ex: {{certificat_nom}}).");
        } else {
            setSubjectError(null);
        }
    }, [settings.template.subject]);

    const handleDaysChange = (newDays: number[]) => {
        const sortedDays = [...newDays].sort((a, b) => b - a);
        const event = {
            target: { name: 'daysBefore', value: sortedDays }
        };
        onSettingsChange(event);
    };

    const handleAddDay = () => {
        const day = parseInt(newDay, 10);
        if (day > 0 && !settings.daysBefore.includes(day)) {
            handleDaysChange([...settings.daysBefore, day]);
            setNewDay('');
        }
    };

    const handleRemoveDay = (dayToRemove: number) => {
        handleDaysChange(settings.daysBefore.filter(d => d !== dayToRemove));
    };


    const handleSendTest = async () => {
        const { host, port, username, password, security } = settings.smtp;
        const errors: string[] = [];

        if (!testRecipient) {
            errors.push("Veuillez saisir une adresse e-mail de destination.");
        }

        if (!host || host.includes('votreserveur.com')) {
            errors.push("L'hôte SMTP est requis.");
        }
        if (!port || isNaN(port) || port <= 0) {
            errors.push("Le port SMTP doit être un nombre valide.");
        }
        if (!username || username.includes('domaine.com')) {
            errors.push("Le nom d'utilisateur est requis.");
        }
        if (!password) {
            errors.push("Le mot de passe est requis.");
        }

        if (errors.length > 0) {
            setTestStatus({ message: `Erreur de validation : ${errors.join(' ')}`, success: false });
            return;
        }

        setIsTesting(true);
        setTestStatus({ message: 'Envoi en cours...' });

        try {
            const apiUrl = `${supabaseUrl}/functions/v1/send-test-email`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipient: testRecipient,
                    smtpConfig: {
                        host,
                        port,
                        security,
                        username,
                        password,
                    },
                    senderEmail: settings.senderEmail,
                }),
            });

            const result = await response.json();
            setTestStatus(result);
        } catch (error: any) {
            setTestStatus({
                success: false,
                message: `Erreur de connexion : ${error.message || 'Impossible de contacter le serveur'}`
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="pl-8 pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <FormRow label="Intervalles de rappel (en jours)">
                    <div className="flex items-center gap-2">
                        <FormInput 
                            type="number" 
                            id="daysBefore" 
                            value={newDay} 
                            onChange={(e) => setNewDay(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleAddDay()}
                            min="1" 
                            placeholder="Ex: 45"
                        />
                        <button type="button" onClick={handleAddDay} className="px-4 py-2 text-sm font-medium text-white bg-brand-secondary rounded-lg hover:bg-gray-700">Ajouter</button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {settings.daysBefore.map(day => (
                            <span key={day} className="flex items-center bg-gray-200 dark:bg-prox-dark-700 text-gray-800 dark:text-prox-text text-sm font-medium px-3 py-1 rounded-full">
                                {day} jours
                                <button type="button" onClick={() => handleRemoveDay(day)} className="ml-2 text-gray-500 hover:text-gray-800 dark:text-prox-text-secondary dark:hover:text-prox-text">
                                    <CloseIcon className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </FormRow>
                 <FormRow label="Adresse e-mail de l'expéditeur" htmlFor="senderEmail">
                    <FormInput type="email" id="senderEmail" name="senderEmail" value={settings.senderEmail || ''} onChange={onSettingsChange} placeholder="notifications@domaine.com" />
                 </FormRow>
            </div>

            {/* SMTP Section */}
            <div className="border-t pt-6 dark:border-prox-dark-700">
                <h4 className="text-md font-semibold text-gray-800 dark:text-prox-text mb-4">Configuration du serveur SMTP</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormRow label="Hôte SMTP" htmlFor="smtp.host">
                        <FormInput type="text" id="smtp.host" name="smtp.host" value={settings.smtp.host} onChange={onSettingsChange} placeholder="smtp.votreserveur.com" />
                    </FormRow>
                    <FormRow label="Port SMTP" htmlFor="smtp.port">
                        <FormInput type="number" id="smtp.port" name="smtp.port" value={settings.smtp.port} onChange={onSettingsChange} />
                    </FormRow>
                    <FormRow label="Nom d'utilisateur" htmlFor="smtp.username">
                        <FormInput type="text" id="smtp.username" name="smtp.username" value={settings.smtp.username || ''} onChange={onSettingsChange} placeholder="votre.email@domaine.com" />
                    </FormRow>
                    <FormRow label="Mot de passe" htmlFor="smtp.password">
                        <FormInput type="password" id="smtp.password" name="smtp.password" value={settings.smtp.password || ''} onChange={onSettingsChange} />
                    </FormRow>
                    <FormRow label="Sécurité" htmlFor="smtp.security">
                         <select id="smtp.security" name="smtp.security" value={settings.smtp.security} onChange={onSettingsChange} className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white dark:bg-prox-dark-700 dark:border-prox-dark-600">
                            <option value="none">Aucune</option>
                            <option value="ssl_tls">SSL/TLS</option>
                            <option value="starttls">STARTTLS</option>
                        </select>
                    </FormRow>
                </div>
            </div>

            {/* Template Section */}
            <div className="border-t pt-6 dark:border-prox-dark-700">
                <h4 className="text-md font-semibold text-gray-800 dark:text-prox-text mb-4">Modèle d'e-mail de notification</h4>
                <div className="space-y-4">
                    <FormRow label="Sujet de l'e-mail" htmlFor="template.subject">
                        <input name="template.subject" id="template.subject" value={settings.template.subject} onChange={onSettingsChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white dark:bg-prox-dark-700 dark:border-prox-dark-600 dark:text-prox-text" />
                        {subjectError && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-500">{subjectError}</p>
                        )}
                    </FormRow>
                    <FormRow label="Corps de l'e-mail" htmlFor="template.body">
                        <textarea name="template.body" id="template.body" value={settings.template.body} onChange={onSettingsChange} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white dark:bg-prox-dark-700 dark:border-prox-dark-600 dark:text-prox-text font-mono text-sm"></textarea>
                    </FormRow>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-prox-text-secondary">Variables disponibles : <code>{'{{employe_nom}}'}</code>, <code>{'{{employe_prenom}}'}</code>, <code>{'{{certificat_nom}}'}</code>, <code>{'{{date_expiration}}'}</code>.</p>
                    </div>
                </div>
            </div>

            {/* Test Section */}
            <div className="border-t pt-6 dark:border-prox-dark-700">
                <h4 className="text-md font-semibold text-gray-800 dark:text-prox-text mb-4">Tester la connexion</h4>
                <p className="text-sm text-gray-600 dark:text-prox-text-secondary mb-3">Envoyez un e-mail de test pour vérifier vos paramètres SMTP. N'oubliez pas d'enregistrer vos modifications avant de lancer un test.</p>
                <div className="flex items-end gap-4">
                    <FormRow label="Envoyer à l'adresse e-mail" htmlFor="test-recipient">
                        <FormInput type="email" id="test-recipient" value={testRecipient} onChange={(e) => setTestRecipient(e.target.value)} placeholder="votre.email@test.com" />
                    </FormRow>
                    <button onClick={handleSendTest} disabled={isTesting} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait">
                        {isTesting ? 'Envoi...' : 'Envoyer un test'}
                    </button>
                </div>
                {testStatus && (
                    <div className={`mt-3 text-sm p-3 rounded-md ${
                        testStatus.success === true ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                        testStatus.success === false ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}>
                        {testStatus.message}
                    </div>
                )}
            </div>
        </div>
    );
};