
import React, { useState } from 'react';
import { store } from '../services/store';
import { Settings } from '../types';
import { Save, Upload, Briefcase, DollarSign, Percent, Wallet, TrendingDown, LayoutTemplate } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(store.getSettings());
  const [saved, setSaved] = useState(false);
  
  // Récupération des prêts pour le calcul en temps réel
  const loans = store.getLoans();

  // Calcul des fonds engagés (argent dehors)
  const activeLoans = loans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const usedCDF = activeLoans.filter(l => l.currency === 'CDF').reduce((sum, l) => sum + l.remainingBalance, 0);
  const usedUSD = activeLoans.filter(l => l.currency === 'USD').reduce((sum, l) => sum + l.remainingBalance, 0);

  // Calcul du disponible (argent en caisse)
  const availableCDF = settings.capitalCDF - usedCDF;
  const availableUSD = settings.capitalUSD - usedUSD;

  const handleSave = () => {
    store.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({...settings, logoUrl: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-full overflow-y-auto bg-slate-50">
       <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configuration Système</h2>
            <button 
                onClick={handleSave}
                className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${saved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20'}`}
            >
                <Save size={24} /> {saved ? 'Sauvegardé !' : 'Enregistrer Tout'}
            </button>
       </div>

       <div className="space-y-8 pb-12">
           
           {/* Capital - Section Modifiée pour afficher le décrément automatique */}
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="font-extrabold text-xl mb-6 text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                   <Wallet className="text-green-600" /> Gestion de la Trésorerie (Automatique)
               </h3>
               <p className="text-slate-500 font-medium mb-6">
                   Définissez votre capital initial. Le montant disponible diminuera automatiquement lors de l'octroi de prêts.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Bloc CDF */}
                   <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100">
                       <div className="flex justify-between items-center mb-4">
                           <span className="font-black text-blue-900 text-lg flex items-center gap-2">
                               <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">CDF</span> Franc Congolais
                           </span>
                       </div>
                       
                       <div className="mb-6">
                           <label className="block text-sm font-extrabold text-slate-700 mb-2">Capital Total Investi (Plafond)</label>
                           <input 
                              type="number"
                              className="w-full border-2 border-blue-200 bg-white rounded-xl p-4 font-black text-slate-900 text-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                              value={settings.capitalCDF}
                              onChange={e => setSettings({...settings, capitalCDF: Number(e.target.value)})}
                           />
                       </div>

                       <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-inner">
                           <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                                    <TrendingDown size={16} /> En cours (Prêts)
                                </span>
                                <span className="font-bold text-red-500">-{usedCDF.toLocaleString()} CDF</span>
                           </div>
                           <div className="border-t border-dashed border-slate-300 my-2"></div>
                           <div className="flex justify-between items-end">
                                <span className="text-sm font-extrabold text-blue-700 uppercase">Disponible en Caisse</span>
                                <span className={`text-2xl font-black ${availableCDF < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                                    {availableCDF.toLocaleString()} CDF
                                </span>
                           </div>
                       </div>
                   </div>

                   {/* Bloc USD */}
                   <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100">
                       <div className="flex justify-between items-center mb-4">
                           <span className="font-black text-emerald-900 text-lg flex items-center gap-2">
                               <span className="bg-emerald-600 text-white px-2 py-1 rounded text-sm">USD</span> Dollar Américain
                           </span>
                       </div>
                       
                       <div className="mb-6">
                           <label className="block text-sm font-extrabold text-slate-700 mb-2">Capital Total Investi (Plafond)</label>
                           <input 
                              type="number"
                              className="w-full border-2 border-emerald-200 bg-white rounded-xl p-4 font-black text-slate-900 text-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                              value={settings.capitalUSD}
                              onChange={e => setSettings({...settings, capitalUSD: Number(e.target.value)})}
                           />
                       </div>

                       <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-inner">
                           <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                                    <TrendingDown size={16} /> En cours (Prêts)
                                </span>
                                <span className="font-bold text-red-500">-{usedUSD.toLocaleString()} $</span>
                           </div>
                           <div className="border-t border-dashed border-slate-300 my-2"></div>
                           <div className="flex justify-between items-end">
                                <span className="text-sm font-extrabold text-emerald-700 uppercase">Disponible en Caisse</span>
                                <span className={`text-2xl font-black ${availableUSD < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                    {availableUSD.toLocaleString()} $
                                </span>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           {/* Identity */}
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="font-extrabold text-xl mb-6 text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                   <Briefcase className="text-blue-600" /> Identité Visuelle
               </h3>
               <div className="flex flex-col md:flex-row items-start gap-8">
                   <div className="flex-1 w-full">
                       <label className="block text-sm font-extrabold text-slate-900 mb-2">Nom de l'Institution</label>
                       <input 
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-4 font-bold text-slate-900 text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                          value={settings.institutionName}
                          onChange={e => setSettings({...settings, institutionName: e.target.value})}
                       />
                       <p className="text-sm text-slate-500 font-medium mt-2">Ce nom apparaîtra sur tous les reçus et rapports.</p>
                   </div>
                   <div className="flex flex-col items-center gap-4">
                       <div className="w-40 h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group hover:border-blue-400 transition-colors">
                           {settings.logoUrl ? (
                               <img src={settings.logoUrl} className="w-full h-full object-contain p-2" />
                           ) : (
                               <div className="text-center p-4">
                                   <Upload className="mx-auto text-slate-300 mb-2" size={32}/>
                                   <span className="text-xs text-slate-400 font-bold uppercase">Aucun logo</span>
                               </div>
                           )}
                       </div>
                       <label className="cursor-pointer bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm">
                           <Upload size={16} strokeWidth={3} /> Importer Logo
                           <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                       </label>
                   </div>
               </div>
           </div>

           {/* Landing Page Customization */}
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="font-extrabold text-xl mb-6 text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                   <LayoutTemplate className="text-purple-600" /> Personnalisation Page d'Accueil
               </h3>
               <div className="grid grid-cols-1 gap-6">
                   <div>
                       <label className="block text-sm font-extrabold text-slate-900 mb-2">Grand Titre (Accueil)</label>
                       <input 
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none"
                          value={settings.welcomeTitle || ''}
                          onChange={e => setSettings({...settings, welcomeTitle: e.target.value})}
                          placeholder="Ex: ONGD DEBOUT GRANDS LACS"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-extrabold text-slate-900 mb-2">Sous-titre (Slogan)</label>
                       <input 
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none"
                          value={settings.welcomeSubtitle || ''}
                          onChange={e => setSettings({...settings, welcomeSubtitle: e.target.value})}
                          placeholder="Ex: Soutenez vos projets avec le microcrédit solidaire"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-extrabold text-slate-900 mb-2">Description Complète</label>
                       <textarea 
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none h-24 resize-none"
                          value={settings.welcomeDescription || ''}
                          onChange={e => setSettings({...settings, welcomeDescription: e.target.value})}
                          placeholder="Ex: Un programme de financement adapté..."
                       />
                   </div>
               </div>
           </div>

           {/* Rates & Fees */}
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="font-extrabold text-xl mb-6 text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                   <Percent className="text-indigo-600" /> Taux & Frais (Standards MFI)
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div>
                       <label className="block text-sm font-extrabold text-slate-900 mb-2">Taux Intérêt (%)</label>
                       <input 
                          type="number"
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none"
                          value={settings.interestRate}
                          onChange={e => setSettings({...settings, interestRate: Number(e.target.value)})}
                       />
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};
