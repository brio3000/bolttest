import React, { useMemo, FC, memo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import { StatutCertificat } from '../types';
import { ChartPieIcon, CheckCircleIcon, ExclamationIcon, XCircleIcon, UsersIcon, EyeIcon, ClockIcon, BriefcaseIcon, LogOutIcon } from './Icons';
import { supabase } from '../lib/supabase'; // ✅ Added for auth check

const COLORS = {
  [StatutCertificat.VALIDE]: '#22c55e',
  [StatutCertificat.EXPIRE_BIENTOT]: '#f59e0b',
  [StatutCertificat.EXPIRE]: '#ef4444',
};

const ENTITY_COLORS = ['#0052cc', '#172b4d', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardCard: FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; contentClassName?: string }> = memo(({ title, icon, children, className, contentClassName }) => (
  <div className={`bg-white dark:bg-prox-dark-800 p-6 rounded-xl shadow-lg flex flex-col ${className}`}>
    <h3 className="font-semibold text-lg text-brand-secondary dark:text-prox-text mb-4 flex items-center">
      {icon && <span className="mr-3 text-brand-primary">{icon}</span>}
      {title}
    </h3>
    <div className={`flex-grow ${contentClassName}`}>{children}</div>
  </div>
));
DashboardCard.displayName = 'DashboardCard';

const StatCard: FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = memo(({ title, value, icon, colorClass }) => (
  <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
    <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}/10`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-prox-text-secondary">{title}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

const Dashboard: React.FC = memo(() => {
  const { getFilteredEmployeCertificats, getFilteredEmployes, getCertificateStatus, entites, employes, theme, certificats: certificateTypes } = useAppContext();

  // ✅ 1. Protect the page (redirect if not authenticated)
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.replace('/login'); // 👈 adjust if your login route differs
      }
    };
    checkAuth();
  }, []);

  // ✅ 2. Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace('/login');
  };

  const certificats = getFilteredEmployeCertificats();

  const statusData = useMemo(() => {
    const data = certificats.reduce((acc, cert) => {
      const status = getCertificateStatus(cert.date_expiration);
      const statusIndex = acc.findIndex(item => item.name === status);
      if (statusIndex > -1) {
        acc[statusIndex].value += 1;
      } else {
        acc.push({ name: status, value: 1 });
      }
      return acc;
    }, [] as { name: StatutCertificat; value: number }[]);

    Object.values(StatutCertificat).forEach(status => {
      if (!data.some(d => d.name === status)) {
        data.push({ name: status, value: 0 });
      }
    });

    return data;
  }, [certificats, getCertificateStatus]);

  const certificatesToWatch = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return certificats
      .filter(cert => new Date(cert.date_expiration) >= today)
      .map(cert => {
        const expDate = new Date(cert.date_expiration);
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...cert,
          employe: employes.find(e => e.id === cert.employeId),
          certificat: certificateTypes.find(c => c.id === cert.certificatId),
          daysRemaining: diffDays,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }, [certificats, employes, certificateTypes]);

  const yearlyExpirationData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push({
        name: d.toLocaleString('fr-FR', { month: 'short' }),
        expirations: 0,
      });
    }
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    certificats.forEach(cert => {
      const expDate = new Date(cert.date_expiration);
      if (expDate >= now && expDate < oneYearFromNow) {
        let monthIndex = (expDate.getFullYear() - now.getFullYear()) * 12 + expDate.getMonth() - now.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          months[monthIndex].expirations++;
        }
      }
    });
    return months;
  }, [certificats]);

  const certificatesByEntityData = useMemo(() => {
    const data = entites.map(e => ({ name: e.nom, value: 0 }));
    const employeIdToEntiteId = new Map(employes.map(e => [e.id, e.entiteId]));
    certificats.forEach(cert => {
      const entiteId = employeIdToEntiteId.get(cert.employeId);
      if (entiteId) {
        const entityData = data.find(d => entites.find(e => e.nom === d.name)?.id === entiteId);
        if (entityData) {
          entityData.value++;
        }
      }
    });
    return data.filter(d => d.value > 0);
  }, [certificats, employes, entites]);

  const certificatesByEmployeeData = useMemo(() => {
    const counts: { [id: number]: number } = {};
    certificats.forEach(cert => {
      counts[cert.employeId] = (counts[cert.employeId] || 0) + 1;
    });

    return Object.keys(counts)
      .map(employeIdStr => {
        const employeId = parseInt(employeIdStr, 10);
        const employe = employes.find(e => e.id === employeId);
        return {
          name: employe ? `${employe.prenom} ${employe.nom}` : `Inconnu (${employeId})`,
          certifications: counts[employeId],
        };
      })
      .sort((a, b) => b.certifications - a.certifications)
      .slice(0, 5);
  }, [certificats, employes]);

  const isDark = theme === 'dark';
  const tickColor = isDark ? '#a0a0a0' : '#6b7281';
  const gridColor = isDark ? '#3c3c3c' : '#e5e7eb';
  const tooltipStyle = {
    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
    border: `1px solid ${gridColor}`,
    color: isDark ? '#e0e0e0' : '#1f2937',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  };

  return (
    <div className="space-y-6">
      {/* ✅ Logout Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-brand-secondary dark:text-prox-text">Vue d'ensemble</h1>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <LogOutIcon className="h-5 w-5 mr-2" /> Se déconnecter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employés" value={getFilteredEmployes().length} icon={<UsersIcon className="h-6 w-6" />} colorClass="text-brand-secondary dark:text-prox-text" />
        <StatCard title="Certificats Valides" value={statusData.find(s => s.name === StatutCertificat.VALIDE)?.value || 0} icon={<CheckCircleIcon className="h-6 w-6" />} colorClass="text-status-valid" />
        <StatCard title="Expirent Bientôt" value={statusData.find(s => s.name === StatutCertificat.EXPIRE_BIENTOT)?.value || 0} icon={<ExclamationIcon className="h-6 w-6" />} colorClass="text-status-soon" />
        <StatCard title="Certificats Expirés" value={statusData.find(s => s.name === StatutCertificat.EXPIRE)?.value || 0} icon={<XCircleIcon className="h-6 w-6" />} colorClass="text-status-expired" />
      </div>

      {/* ... rest of your original charts and dashboard content unchanged ... */}
      {/* ✅ Keep your full existing charts below this line */}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;