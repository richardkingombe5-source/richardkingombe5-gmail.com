
import React, { useState } from 'react';
import { store } from '../services/store';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, AlertCircle, ArrowRight, Wallet, HeartHandshake } from 'lucide-react';

interface LoginViewProps {
    onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const settings = store.getSettings();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const user = store.login(username, password);
        if (user) {
            onLogin(user);
        } else {
            setError('Identifiants incorrects ou compte désactivé.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 md:p-6 font-sans">
            <div className="bg-white md:rounded-[32px] shadow-2xl overflow-hidden max-w-6xl w-full flex flex-col md:flex-row min-h-screen md:min-h-[700px]">
                
                {/* Visual Side (Left) */}
                <div className="md:w-3/5 bg-gradient-to-br from-blue-800 to-indigo-900 p-8 md:p-16 text-white flex flex-col relative overflow-hidden">
                    
                    {/* Top Brand Area */}
                    <div className="relative z-10 mb-8 md:mb-0">
                        {settings.logoUrl && (
                             <img src={settings.logoUrl} alt="Logo" className="h-20 md:h-24 object-contain mb-8 bg-white/10 p-2 rounded-xl backdrop-blur-sm" />
                        )}
                        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                            {settings.welcomeTitle || "ONGD DEBOUT GRANDS LACS"}
                        </h1>
                        <div className="w-24 h-2 bg-yellow-400 rounded-full mb-8"></div>
                        <h2 className="text-xl md:text-2xl font-bold text-blue-100 leading-relaxed max-w-xl">
                            {settings.welcomeSubtitle || "Soutenez vos projets avec le microcrédit solidaire"}
                        </h2>
                    </div>
                    
                    {/* Description Area */}
                    <div className="relative z-10 space-y-8 mt-auto">
                         <p className="text-blue-100 text-lg leading-relaxed max-w-lg opacity-90 whitespace-pre-line">
                            {settings.welcomeDescription || "Un programme de financement adapté pour les membres de l'église CVEM.\nPrêts sur 3 mois OU PLUS avec des taux solidaires."}
                         </p>

                         {/* Call to Actions (Visual only as per request) */}
                         <div className="flex flex-col sm:flex-row gap-4 mt-8">
                             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/20 transition cursor-pointer group">
                                <div className="bg-yellow-400 p-3 rounded-xl text-yellow-900">
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Faire une demande</h3>
                                    <p className="text-xs text-blue-200 group-hover:text-white transition">Connectez-vous pour initier</p>
                                </div>
                             </div>

                             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/20 transition cursor-pointer group">
                                <div className="bg-emerald-400 p-3 rounded-xl text-emerald-900">
                                    <HeartHandshake size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Devenir Partenaire</h3>
                                    <p className="text-xs text-blue-200 group-hover:text-white transition">Rejoignez la vision</p>
                                </div>
                             </div>
                         </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 -ml-32 -mb-32 animate-pulse"></div>
                </div>

                {/* Login Form Side (Right) */}
                <div className="md:w-2/5 p-8 md:p-16 bg-white flex flex-col justify-center relative">
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-700 font-bold text-sm mb-4">
                            <Lock size={14} /> Accès Réservé
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Espace Gestion</h2>
                        <p className="text-slate-500 font-medium">Accéder au tableau de bord</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in shake">
                                <AlertCircle size={20} /> {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-extrabold text-slate-900 mb-2">Identifiant</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={20} />
                                <input 
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 bg-slate-50 focus:bg-white"
                                    placeholder="Nom d'utilisateur"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-extrabold text-slate-900 mb-2">Mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={20} />
                                <input 
                                    type="password"
                                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 bg-slate-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg rounded-xl shadow-xl shadow-blue-700/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                        >
                            <LogIn size={20} /> Se Connecter 
                            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                    </form>
                    
                    <div className="mt-auto pt-10 text-center">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                            © {new Date().getFullYear()} ONGD Debout Grands Lacs
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
