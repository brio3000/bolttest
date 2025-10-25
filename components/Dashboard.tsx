import React, { useMemo, FC, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import { StatutCertificat } from '../types';
import { ChartPieIcon, CheckCircleIcon, ExclamationIcon, XCircleIcon, UsersIcon } from './Icons';

const COLORS = {
  [StatutCertificat.VALIDE]: '#22c55e',
  [StatutCertificat.EXPIRE_BIENTOT]: '#f59e0b',
  [StatutCertificat.EXPIRE]: '#ef4444',
};

const DashboardCard: FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = memo(
  ({ title, icon, children }) => (
    <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-xl shadow-lg flex flex-col">
      <h3 className="font-semibold text-lg text-brand-secondary dark:text-prox-text mb-4 flex items-center">
        {icon && <span className="mr-3 text-brand-primary">{icon}</span>}
        {title}
      </h3>
      <div className="flex-grow">{children}</div>
    </div>
  )
);
DashboardCard.displayName = 'DashboardCard';

const StatCard: FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = memo(
  ({ title, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-')}/10`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-prox-text-secondary">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
      </div>
    </div>
  )
);
StatCard.displayName = 'StatCard';

const Dashboard: React.FC = memo(() => {
  const { getFilteredEmployeCertificats, getFilteredEmployes, getCertificateStatus, theme } = useAppContext();

  const certificats = getFilteredEmployeCertificats();

  const statusData = useMemo(() => {
    const data = certificats.reduce((acc, cert) => {
      const status = getCertificateStatus(cert.date_expiration);
      const statusIndex = acc.findIndex(item => item.name === status);
      if (statusIndex > -1) acc[statusIndex].value += 1;
      else acc.push({ name: status, value: 1 });
      return acc;
    }, [] as { name: StatutCertificat; value: number }[]);

    Object.values(StatutCertificat).forEach(status => {
      if (!data.some(d => d.name === status)) data.push({ name: status, value: 0 });
    });

    return data;
  }, [certificats, getCertificateStatus]);

  const isDark = theme === 'dark';
  const tickColor = isDark ? '#a0a0a0' : '#6b7281';
  const gridColor = isDark ? '#3c3c3c' : '#e5e7eb';
  const tooltipStyle = {
    backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
    border: `1px solid ${gridColor}`,
    color: isDark ? '#e0e0e0' : '#1f2937',
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold text-brand-secondary dark:text-prox-text mb-6">
        Vue d'ensemble publique 🌍
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employés"
          value={getFilteredEmployes().length}
          icon={<UsersIcon className="h-6 w-6" />}
          colorClass="text-brand-secondary dark:text-prox-text"
        />
        <StatCard
          title="Certificats Valides"
          value={statusData.find(s => s.name === StatutCertificat.VALIDE)?.value || 0}
          icon={<CheckCircleIcon className="h-6 w-6" />}
          colorClass="text-status-valid"
        />
        <StatCard
          title="Expirent Bientôt"
          value={statusData.find(s => s.name === StatutCertificat.EXPIRE_BIENTOT)?.value || 0}
          icon={<ExclamationIcon className="h-6 w-6" />}
          colorClass="text-status-soon"
        />
        <StatCard
          title="Certificats Expirés"
          value={statusData.find(s => s.name === StatutCertificat.EXPIRE)?.value || 0}
          icon={<XCircleIcon className="h-6 w-6" />}
          colorClass="text-status-expired"
        />
      </div>

      <DashboardCard title="Répartition des Statuts" icon={<ChartPieIcon className="h-6 w-6" />}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={120} label>
              {statusData.map((entry, i) => (
                <Cell key={i} fill={COLORS[entry.name as StatutCertificat]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </DashboardCard>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;
