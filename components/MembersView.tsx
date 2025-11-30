import React, { useState } from 'react';
import { store } from '../services/store';
import { Member } from '../types';
import { Search, Plus, Trash2, Edit2, User, Save, X } from 'lucide-react';

export const MembersView: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(store.getMembers());
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState<Partial<Member>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = () => {
    if (!currentMember.firstName || !currentMember.lastName) return;
    
    const memberToSave: Member = {
      id: currentMember.id || Date.now().toString(),
      firstName: currentMember.firstName!,
      lastName: currentMember.lastName!,
      gender: currentMember.gender || 'M',
      phone: currentMember.phone || '',
      address: currentMember.address || '',
      profession: currentMember.profession || '',
      group: currentMember.group || '',
      registrationDate: currentMember.registrationDate || Date.now(),
    };

    store.saveMember(memberToSave);
    setMembers(store.getMembers());
    setIsEditing(false);
    setCurrentMember({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce membre ? Cette action est irréversible.")) {
        try {
            store.deleteMember(id);
            setMembers(store.getMembers());
        } catch (e: any) {
            alert(e.message);
        }
    }
  };

  const filteredMembers = members.filter(m => 
    m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Membres</h2>
            <p className="text-slate-600 font-medium mt-1">Gérez votre base de données d'adhérents</p>
        </div>
        <button 
          onClick={() => { setCurrentMember({}); setIsEditing(true); }}
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-700/30 transform hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} /> <span className="font-bold">Nouveau Membre</span>
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                    <User size={24} />
                </div>
                {currentMember.id ? 'Modifier le Membre' : 'Inscrire un Nouveau Membre'}
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Prénom <span className="text-red-500">*</span></label>
                <input 
                  className="w-full border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                  placeholder="Ex: Jean"
                  value={currentMember.firstName || ''} 
                  onChange={e => setCurrentMember({...currentMember, firstName: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Nom / Post-nom <span className="text-red-500">*</span></label>
                <input 
                  className="w-full border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                  placeholder="Ex: Kalala"
                  value={currentMember.lastName || ''} 
                  onChange={e => setCurrentMember({...currentMember, lastName: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Sexe</label>
                <select 
                  className="w-full border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all bg-slate-50 focus:bg-white cursor-pointer"
                  value={currentMember.gender || 'M'}
                  onChange={e => setCurrentMember({...currentMember, gender: e.target.value as 'M'|'F'})}
                >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Téléphone</label>
                <input 
                  className="w-full border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                  placeholder="Ex: 099 000 0000"
                  value={currentMember.phone || ''} 
                  onChange={e => setCurrentMember({...currentMember, phone: e.target.value})}
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-900 mb-2">Adresse Complète</label>
                <input 
                  className="w-full border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                  placeholder="Avenue, Quartier, Commune..."
                  value={currentMember.address || ''} 
                  onChange={e => setCurrentMember({...currentMember, address: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Profession</label>
                <input 
                  className="w-full border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                  placeholder="Ex: Commerçant"
                  value={currentMember.profession || ''} 
                  onChange={e => setCurrentMember({...currentMember, profession: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Groupe / Église / Association</label>
                <input 
                  className="w-full border-2 border-slate-200 rounded-xl p-3.5 text-slate-900 font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                  placeholder="Nom du groupe solidaire"
                  value={currentMember.group || ''} 
                  onChange={e => setCurrentMember({...currentMember, group: e.target.value})}
                />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition"
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Save size={20} /> Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50">
            <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Rechercher par nom, téléphone ou groupe..." 
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Identité</th>
                        <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Contact & Info</th>
                        <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Groupe</th>
                        <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Date Inscription</th>
                        <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredMembers.map(member => (
                        <tr key={member.id} className="hover:bg-blue-50/60 transition-colors group">
                            <td className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg border-4 border-slate-50 shadow-sm">
                                        {member.firstName[0]}{member.lastName[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg leading-tight">{member.firstName} {member.lastName}</div>
                                        <div className="text-sm text-slate-500 font-medium">{member.profession}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="text-slate-900 font-bold text-base">{member.phone}</div>
                                <div className="text-slate-500 text-xs truncate max-w-[150px]">{member.address}</div>
                            </td>
                            <td className="p-5">
                                <span className="inline-flex px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
                                    {member.group}
                                </span>
                            </td>
                            <td className="p-5 text-slate-700 font-semibold text-sm">
                                {new Date(member.registrationDate).toLocaleDateString()}
                            </td>
                            <td className="p-5 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => { setCurrentMember(member); setIsEditing(true); }}
                                        className="p-2.5 bg-white border-2 border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-xl transition-all shadow-sm"
                                        title="Modifier"
                                    >
                                        <Edit2 size={18} strokeWidth={2.5} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(member.id)}
                                        className="p-2.5 bg-white border-2 border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl transition-all shadow-sm"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredMembers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-12 text-center">
                                <div className="flex flex-col items-center text-slate-400">
                                    <User size={64} className="mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-slate-500">Aucun membre trouvé.</p>
                                    <p className="text-sm">Essayez une autre recherche ou ajoutez un nouveau membre.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};