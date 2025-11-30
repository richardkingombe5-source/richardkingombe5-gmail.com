
import React from 'react';
import { store } from '../services/store';
import { Wallet, HeartHandshake, ArrowRight, ShieldCheck } from 'lucide-react';

interface HomeViewProps {
  onEnter: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onEnter }) => {
  const settings = store.getSettings();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Navigation / Header */}
      <header className="px-6 py-4 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
          ) : (
            <div className="h-10 w-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
                MFI
            </div>
          )}
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
              {settings.institutionName}
            </h1>
          </div>
        </div>
        <button 
          onClick={onEnter}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-700/20 flex items-center gap-2"
        >
          Espace Membre <ArrowRight size={16} />
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-pulse delay-1000"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-extrabold text-xs uppercase tracking-widest">
            Microfinance Solidaire
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            {settings.welcomeSubtitle || "Soutenez vos projets avec le microcrédit solidaire"}
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {settings.welcomeDescription || "Un programme de financement adapté pour les membres de l'église CVEM.\nPrêts sur 3 mois OU PLUS avec des taux solidaires."}
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-3xl mx-auto mt-8">
            {/* Card 1: Faire une demande */}
            <div 
              onClick={onEnter}
              className="group flex-1 bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Wallet size={100} className="text-blue-600 transform rotate-12" />
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 mb-6 group-hover:scale-110 transition-transform">
                <Wallet size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Faire une demande</h3>
              <p className="text-slate-500 font-medium mb-6">Accédez à votre espace pour initier une demande de prêt.</p>
              <div className="flex items-center text-blue-700 font-bold group-hover:translate-x-2 transition-transform">
                Connectez-vous pour initier <ArrowRight size={20} className="ml-2" />
              </div>
            </div>

            {/* Card 2: Devenir Partenaire */}
            <div className="group flex-1 bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-green-500 hover:shadow-2xl hover:shadow-green-900/10 transition-all cursor-pointer text-left relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <HeartHandshake size={100} className="text-green-600 transform -rotate-12" />
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 mb-6 group-hover:scale-110 transition-transform">
                <HeartHandshake size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Devenir Partenaire</h3>
              <p className="text-slate-500 font-medium mb-6">Rejoignez la vision et soutenez le développement local.</p>
              <div className="flex items-center text-green-700 font-bold group-hover:translate-x-2 transition-transform">
                En savoir plus <ArrowRight size={20} className="ml-2" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h4 className="font-black text-slate-900">{settings.institutionName}</h4>
              <p className="text-slate-500 text-sm">Église CVEM - Département Développement</p>
            </div>
            <div className="flex gap-6">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                    <ShieldCheck size={16} /> Plateforme Sécurisée
                </div>
            </div>
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Tous droits réservés.
            </div>
         </div>
      </footer>
    </div>
  );
};
