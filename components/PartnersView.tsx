
import React, { useState } from 'react';
import { store } from '../services/store';
import { Partner, PartnerType } from '../types';
import { Building, Plus, Trash2, Globe, MapPin, Mail, X } from 'lucide-react';

export const PartnersView: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>(store.getPartners());
  const [isAdding, setIsAdding] = useState(false);
  const [newPartner, setNewPartner] = useState<Partial<Partner>>({ type: 'EXTERNAL', status: 'ACTIVE' });

  const handleSave = () => {
    if (!newPartner.name) return;
    
    const partner: Partner = {
        id: Date.now().toString(),
        name: newPartner.name,
        type: newPartner.type as PartnerType,
        country: newPartner.country || '',
        email: newPartner.email || '',
        status: 'ACTIVE'
    };

    store.savePartner(partner);
    setPartners(store.getPartners());
    setIsAdding(false);
    setNewPartner({ type: 'EXTERNAL', status: 'ACTIVE' });
  };

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50 relative">
       <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Partenaires Financiers</h2>
            <p className="text-slate-600 font-medium mt-1">Gestion des bailleurs de fonds et partenaires</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-800 transition shadow-lg shadow-indigo-700/30 transform hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={3} /> <span className="font-bold">Ajouter Partenaire</span>
        </button>
      </div>

      {/* MODAL POPUP FOR ADDING */}
      {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                        <Building className="text-indigo-600" /> Nouveau Partenaire
                    </h3>
                    <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-extrabold text-slate-900 mb-2">Nom de l'organisation <span className="text-red-500">*</span></label>
                        <input 
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none"
                          placeholder="Ex: Banque Mondiale"
                          value={newPartner.name || ''}
                          onChange={e => setNewPartner({...newPartner, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-extrabold text-slate-900 mb-2">Type de Partenaire</label>
                        <select 
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none cursor-pointer"
                          value={newPartner.type}
                          onChange={e => setNewPartner({...newPartner, type: e.target.value as PartnerType})}
                        >
                            <option value="INTERNAL">Interne (Local)</option>
                            <option value="EXTERNAL">Externe (International)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-extrabold text-slate-900 mb-2">Pays / Région</label>
                        <input 
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none"
                          placeholder="Ex: RDC, Kinshasa"
                          value={newPartner.country || ''}
                          onChange={e => setNewPartner({...newPartner, country: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-extrabold text-slate-900 mb-2">Email Contact</label>
                        <input 
                          className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none"
                          placeholder="contact@partenaire.org"
                          value={newPartner.email || ''}
                          onChange={e => setNewPartner({...newPartner, email: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition">Annuler</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 shadow-lg shadow-indigo-700/20">Enregistrer Partenaire</button>
                </div>
            </div>
          </div>
      )}

      {/* PARTNER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto">
          {partners.map(partner => (
              <div key={partner.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-5">
                      <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                          <Building className="text-indigo-700" size={28} />
                      </div>
                      <span className={`text-xs font-black px-3 py-1.5 rounded-lg tracking-wide uppercase ${partner.type === 'INTERNAL' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                          {partner.type}
                      </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight">{partner.name}</h3>
                  <div className="flex items-center text-slate-600 font-semibold text-sm mb-6">
                      <MapPin size={16} className="mr-1.5 text-slate-400" /> {partner.country || 'N/A'}
                  </div>
                  
                  <div className="pt-5 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex items-center text-sm font-medium text-slate-500">
                         <Mail size={14} className="mr-2" />
                         <span className="truncate max-w-[150px]">{partner.email || 'N/A'}</span>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                  </div>
              </div>
          ))}
          {partners.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                  <Globe className="mx-auto mb-4 opacity-30" size={64} />
                  <p className="text-lg font-bold text-slate-500">Aucun partenaire enregistré.</p>
                  <p className="text-sm">Commencez par ajouter une source de financement.</p>
              </div>
          )}
      </div>
    </div>
  );
};
