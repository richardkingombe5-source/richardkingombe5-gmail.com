
import React, { useState } from 'react';
import { store } from '../services/store';
import { User, UserRole } from '../types';
import { UserPlus, Shield, Trash2, Edit2, Check, X, User as UserIcon } from 'lucide-react';

export const UsersView: React.FC = () => {
    const [users, setUsers] = useState<User[]>(store.getUsers());
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User>>({ role: 'AGENT', isActive: true });

    const handleSave = () => {
        if (!currentUser.username || !currentUser.password || !currentUser.name) {
            alert("Tous les champs sont obligatoires");
            return;
        }

        const userToSave: User = {
            id: currentUser.id || Date.now().toString(),
            username: currentUser.username,
            password: currentUser.password,
            name: currentUser.name,
            role: currentUser.role as UserRole,
            isActive: currentUser.isActive !== undefined ? currentUser.isActive : true
        };

        store.saveUser(userToSave);
        setUsers(store.getUsers());
        setIsEditing(false);
        setCurrentUser({ role: 'AGENT', isActive: true });
    };

    const handleDelete = (id: string) => {
        if (confirm("Supprimer cet utilisateur ?")) {
            try {
                store.deleteUser(id);
                setUsers(store.getUsers());
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    return (
        <div className="p-6 h-full flex flex-col bg-slate-50 relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion de l'Équipe</h2>
                    <p className="text-slate-600 font-medium mt-1">Gérez les accès Administrateurs et Agents</p>
                </div>
                <button 
                    onClick={() => { setCurrentUser({ role: 'AGENT', isActive: true }); setIsEditing(true); }}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-700/30 transform hover:-translate-y-0.5"
                >
                    <UserPlus size={20} strokeWidth={2.5} /> <span className="font-bold">Ajouter Utilisateur</span>
                </button>
            </div>

            {/* MODAL POPUP */}
            {isEditing && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 mb-8 max-w-2xl w-full animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                {currentUser.id ? <Edit2 className="text-blue-600" /> : <UserPlus className="text-green-600" />}
                                {currentUser.id ? 'Modifier le Compte' : 'Créer un Nouveau Compte'}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-extrabold text-slate-900 mb-2">Nom Complet</label>
                                <input 
                                    className="w-full border-2 border-slate-200 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-600"
                                    value={currentUser.name || ''}
                                    onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                                    placeholder="Ex: Jean Dupont"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-extrabold text-slate-900 mb-2">Nom d'utilisateur</label>
                                    <input 
                                        className="w-full border-2 border-slate-200 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-600"
                                        value={currentUser.username || ''}
                                        onChange={e => setCurrentUser({...currentUser, username: e.target.value})}
                                        placeholder="login"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-extrabold text-slate-900 mb-2">Mot de passe</label>
                                    <input 
                                        className="w-full border-2 border-slate-200 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-600"
                                        value={currentUser.password || ''}
                                        onChange={e => setCurrentUser({...currentUser, password: e.target.value})}
                                        placeholder="******"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-extrabold text-slate-900 mb-2">Rôle</label>
                                    <select 
                                        className="w-full border-2 border-slate-200 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
                                        value={currentUser.role}
                                        onChange={e => setCurrentUser({...currentUser, role: e.target.value as UserRole})}
                                    >
                                        <option value="AGENT">Agent (Limité)</option>
                                        <option value="ADMIN">Administrateur (Total)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-extrabold text-slate-900 mb-2">Statut</label>
                                    <select 
                                        className="w-full border-2 border-slate-200 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
                                        value={currentUser.isActive ? 'true' : 'false'}
                                        onChange={e => setCurrentUser({...currentUser, isActive: e.target.value === 'true'})}
                                    >
                                        <option value="true">Actif</option>
                                        <option value="false">Désactivé</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">Annuler</button>
                            <button onClick={handleSave} className="px-8 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 shadow-lg">Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto">
                {users.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between group hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${user.role === 'ADMIN' ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                                {user.role === 'ADMIN' ? <Shield size={24} /> : <UserIcon size={24} />}
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-900 text-lg">{user.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-500">@{user.username}</span>
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setCurrentUser(user); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
