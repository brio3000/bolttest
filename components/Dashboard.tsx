import React, { useMemo, FC, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';
import { StatutCertificat } from '../types';
import { ChartPieIcon, CheckCircleIcon, ExclamationIcon, XCircleIcon, UsersIcon, LogOutIcon } from './Icons';
import { supabase } from '../lib/supabase';
import ProtectedRoute from './ProtectedRoute'; // ✅ added

const COLORS = {
  [StatutCertificat.VALIDE]: '#22c55e',
  [StatutCertificat.EXPIRE_BIENTOT]: '#f59e0b',
  [StatutCertificat.EXPIRE]: '#ef4444',
};

const DashboardCard: FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = memo(({ title, icon, children }) => (
  <div className="bg-white dark:bg-prox-dark-800 p-6 rounded-xl shadow-lg flex flex-col">
    <h3 className="font-semibold text-lg text-brand-secondary dark:text-prox-text mb-4 flex items-center">
      {icon && <span className="mr-3 text-brand-primary">{icon}</span>}
      {title}
    </h3>
    <div className="flex-grow">{children}</div>
  </div>
));
DashboardCard.displayName = 'DashboardCard';

const Dashboard: React.FC = memo(() => {
  const { getFilteredEmployeCertificats, getFilteredEmployes, getCertificateStatus, theme } = useAppContext();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace('/login');
  };

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
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-brand-secondary dark:text-prox-text">Vue d'ensemble</h1>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <LogOutIcon className="h-5 w-5 mr-2" /> Se déconnecter
          </button>
        </div>

        <DashboardCard title="Statut global des certificats" icon={<ChartPieIcon className="h-6 w-6" />}>
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
    </ProtectedRoute>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;
