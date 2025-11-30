import React from 'react';
import { store } from '../services/store';
import { Settings, Loan, Payment, Member } from '../types';
import { LayoutDashboard, Users, FileText, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const settings = store.getSettings();
  const loans = store.getLoans();
  const members = store.getMembers();

  // Calculations
  const activeLoans = loans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const overdueLoans = loans.filter(l => l.status === 'OVERDUE');

  // CDF Metrics
  const cdfLoans = activeLoans.filter(l => l.currency === 'CDF');
  const cdfOutstanding = cdfLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const cdfAvailable = settings.capitalCDF - cdfOutstanding;

  // USD Metrics
  const usdLoans = activeLoans.filter(l => l.currency === 'USD');
  const usdOutstanding = usdLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const usdAvailable = settings.capitalUSD - usdOutstanding;

  const MetricCard = ({ title, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
          {subValue && <p className="text-sm text-slate-500 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Tableau de Bord</h2>
        {settings.logoUrl && (
          <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain" />
        )}
      </div>

      {/* Capital Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Capital Disponible (CDF)"
          value={`${cdfAvailable.toLocaleString()} CDF`}
          subValue={`Sur ${settings.capitalCDF.toLocaleString()} Total`}
          icon={DollarSign}
          color="bg-blue-600"
        />
         <MetricCard 
          title="Capital Disponible (USD)"
          value={`${usdAvailable.toLocaleString()} $`}
          subValue={`Sur ${settings.capitalUSD.toLocaleString()} Total`}
          icon={DollarSign}
          color="bg-emerald-600"
        />
        <MetricCard 
          title="Encours Crédit (Global)"
          value={`${loans.filter(l => l.status === 'ACTIVE').length} Dossiers`}
          subValue={`${cdfOutstanding.toLocaleString()} CDF + ${usdOutstanding.toLocaleString()} $`}
          icon={TrendingUp}
          color="bg-indigo-600"
        />
        <MetricCard 
          title="Portefeuille à Risque (PAR)"
          value={overdueLoans.length.toString()}
          subValue="Dossiers en retard"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="text-slate-500" size={20} /> Membres
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-slate-600">Total Inscrits</span>
                    <span className="font-bold">{members.length}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-slate-600">Actifs (Avec prêt)</span>
                    <span className="font-bold text-green-600">{activeLoans.length}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Nouveaux (ce mois)</span>
                    <span className="font-bold text-blue-600">
                        {members.filter(m => m.registrationDate > Date.now() - 2592000000).length}
                    </span>
                </div>
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="text-slate-500" size={20} /> Performance Financière
            </h3>
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Taux de Remboursement</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-right text-xs font-bold mt-1 text-green-600">92%</p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Utilisation Capital USD</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(usdOutstanding / settings.capitalUSD) * 100}%` }}></div>
                    </div>
                    <p className="text-right text-xs font-bold mt-1 text-emerald-600">
                        {((usdOutstanding / settings.capitalUSD) * 100).toFixed(1)}%
                    </p>
                 </div>
            </div>
         </div>
      </div>
    </div>
  );
};