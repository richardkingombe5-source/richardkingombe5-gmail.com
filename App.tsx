
import React, { useState, useEffect } from 'react';
import { ViewMode, User } from './types';
import { DashboardView } from './components/DashboardView';
import { MembersView } from './components/MembersView';
import { LoansView } from './components/LoansView';
import { PartnersView } from './components/PartnersView';
import { SettingsView } from './components/SettingsView';
import { UsersView } from './components/UsersView';
import { LoginView } from './components/LoginView';
import { store } from './services/store';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Handshake, 
  Settings as SettingsIcon,
  LogOut,
  Building2,
  ShieldCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const settings = store.getSettings();

  // Restore session if needed (optional implementation, here we force login on refresh for security in this demo)
  // useEffect(() => { ... }, []);

  const handleLogout = () => {
      setCurrentUser(null);
      setView(ViewMode.DASHBOARD);
  };

  const NavButton = ({ mode, icon: Icon, label, restricted }: { mode: ViewMode, icon: any, label: string, restricted?: boolean }) => {
    // If restricted and user is not admin, don't render
    if (restricted && currentUser?.role !== 'ADMIN') return null;

    return (
      <button
        onClick={() => setView(mode)}
        className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 mb-1 ${
          view === mode
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon size={20} className="shrink-0" />
        <span className="ml-3 font-medium hidden md:block">{label}</span>
      </button>
    );
  };

  // --- Auth Gate ---
  if (!currentUser) {
      return <LoginView onLogin={setCurrentUser} />;
  }

  // --- Main App ---
  return (
    <div className="flex h-screen w-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <div className="w-20 md:w-64 flex-shrink-0 bg-slate-900 flex flex-col justify-between z-20 shadow-xl no-print">
        <div>
            <div className="h-20 flex items-center justify-center md:justify-start md:px-6 bg-slate-950">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shrink-0">
                    <Building2 size={24} />
                </div>
                <div className="ml-3 hidden md:block overflow-hidden">
                    <h1 className="font-bold text-lg text-white leading-tight truncate">MFI Manager</h1>
                    <span className="text-xs text-slate-500">Pro Edition</span>
                </div>
            </div>

            <nav className="p-4 mt-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3 hidden md:block">Principal</div>
                <NavButton mode={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Tableau de Bord" />
                <NavButton mode={ViewMode.MEMBERS} icon={Users} label="Membres" />
                <NavButton mode={ViewMode.LOANS} icon={Wallet} label="Prêts & Paiements" />
                
                {currentUser.role === 'ADMIN' && (
                    <>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-4 px-3 hidden md:block">Administration</div>
                        <NavButton mode={ViewMode.PARTNERS} icon={Handshake} label="Partenaires" restricted />
                        <NavButton mode={ViewMode.USERS} icon={ShieldCheck} label="Équipe & Accès" restricted />
                        <NavButton mode={ViewMode.SETTINGS} icon={SettingsIcon} label="Paramètres" restricted />
                    </>
                )}
            </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
            <div className="mb-4 px-2 hidden md:block">
                <p className="text-xs text-slate-500 uppercase font-bold">Connecté en tant que</p>
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-blue-400 font-bold">{currentUser.role === 'ADMIN' ? 'Administrateur' : 'Agent'}</p>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center p-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition"
            >
                <LogOut size={20} />
                <span className="ml-3 hidden md:block">Déconnexion</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 no-print">
            <h2 className="text-lg font-semibold text-slate-700">
                {view === ViewMode.DASHBOARD && 'Vue d\'ensemble'}
                {view === ViewMode.MEMBERS && 'Gestion des Adhérents'}
                {view === ViewMode.LOANS && 'Opérations de Crédit'}
                {view === ViewMode.PARTNERS && 'Bailleurs de Fonds'}
                {view === ViewMode.USERS && 'Gestion des Utilisateurs'}
                {view === ViewMode.SETTINGS && 'Configuration Système'}
            </h2>
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800">{settings.institutionName}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                    {currentUser.name[0]}
                </div>
            </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
            {view === ViewMode.DASHBOARD && <DashboardView />}
            {view === ViewMode.MEMBERS && <MembersView />}
            {view === ViewMode.LOANS && <LoansView />}
            
            {/* Security Guard: Only render Admin views if Admin */}
            {currentUser.role === 'ADMIN' && view === ViewMode.PARTNERS && <PartnersView />}
            {currentUser.role === 'ADMIN' && view === ViewMode.USERS && <UsersView />}
            {currentUser.role === 'ADMIN' && view === ViewMode.SETTINGS && <SettingsView />}
            
            {/* Fallback for unauthorized access attempts */}
            {currentUser.role !== 'ADMIN' && [ViewMode.PARTNERS, ViewMode.USERS, ViewMode.SETTINGS].includes(view) && (
                <div className="h-full flex items-center justify-center text-slate-400">
                    <p>Accès non autorisé.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
