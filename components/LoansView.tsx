import React, { useState } from 'react';
import { store } from '../services/store';
import { Member, Loan, Partner, Payment, Currency } from '../types';
import { Plus, Calculator, CheckCircle, Printer, ArrowLeft, Download, AlertCircle, DollarSign, Wallet } from 'lucide-react';

export const LoansView: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'PAYMENT' | 'SUCCESS'>('LIST');
  const [loans, setLoans] = useState<Loan[]>(store.getLoans());
  const [members] = useState<Member[]>(store.getMembers());
  const [partners] = useState<Partner[]>(store.getPartners());
  const [settings] = useState(store.getSettings());
  
  // Creation State
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({ currency: 'CDF', durationMonths: 3 });
  
  // Payment State
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  // --- Actions ---

  const calculateLoan = () => {
    if (!newLoan.amount || !newLoan.durationMonths) return;
    
    // Using simple interest as per common MFI demo standards, but can be configured
    const principal = Number(newLoan.amount);
    const rate = settings.interestRate / 100;
    const duration = newLoan.durationMonths;
    
    const interest = principal * rate * duration; // Simple Interest: I = P * r * t
    const fees = principal * (settings.applicationFeePercent / 100);
    const insurance = principal * (settings.insuranceFeePercent / 100);
    const savings = principal * (settings.savingsPercent / 100);
    
    setNewLoan({
        ...newLoan,
        totalInterest: interest,
        totalFees: fees,
        totalInsurance: insurance,
        totalSavings: savings,
        totalDue: principal + interest,
        remainingBalance: principal + interest
    });
  };

  const handleCreateLoan = () => {
    if (!newLoan.memberId || !newLoan.amount) {
        alert("Veuillez remplir les champs obligatoires");
        return;
    }
    
    // Auto calculate if not done
    if (!newLoan.totalDue) calculateLoan();

    // Recalculate to ensure state is fresh (sync issue prevention)
    const principal = Number(newLoan.amount);
    const rate = settings.interestRate / 100;
    const duration = newLoan.durationMonths!;
    const interest = principal * rate * duration;
    
    const loanToSave: Loan = {
        id: Date.now().toString(),
        memberId: newLoan.memberId!,
        memberName: members.find(m => m.id === newLoan.memberId)?.firstName + ' ' + members.find(m => m.id === newLoan.memberId)?.lastName,
        partnerId: newLoan.partnerId,
        amount: principal,
        currency: newLoan.currency as Currency,
        durationMonths: duration,
        interestRate: settings.interestRate,
        startDate: Date.now(),
        status: 'PENDING',
        totalInterest: interest,
        totalFees: principal * (settings.applicationFeePercent / 100),
        totalInsurance: principal * (settings.insuranceFeePercent / 100),
        totalSavings: principal * (settings.savingsPercent / 100),
        totalDue: principal + interest,
        remainingBalance: principal + interest
    };

    try {
        store.createLoan(loanToSave);
        setLoans(store.getLoans());
        setView('LIST');
    } catch (e: any) {
        alert("Erreur: " + e.message);
    }
  };

  const handlePayment = () => {
    if (!selectedLoan || !paymentAmount) return;

    const payment: Payment = {
        id: Date.now().toString(),
        loanId: selectedLoan.id,
        memberId: selectedLoan.memberId,
        amount: Number(paymentAmount),
        currency: selectedLoan.currency,
        date: Date.now(),
        agentName: 'Agent Actuel', // In real app, from Auth Context
        method: 'CASH'
    };

    try {
        store.recordPayment(payment);
        setLastPayment(payment);
        setLoans(store.getLoans()); // Refresh
        setView('SUCCESS');
    } catch (e: any) {
        alert(e.message);
    }
  };

  // --- Views ---

  if (view === 'SUCCESS' && lastPayment && selectedLoan) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 relative">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-200">
                {settings.logoUrl && (
                    <img src={settings.logoUrl} alt="Logo" className="h-16 mx-auto mb-6" />
                )}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Paiement Réussi !</h2>
                <p className="text-slate-600 font-medium mb-8">Merci, la transaction a été enregistrée.</p>

                <div className="bg-slate-50 p-6 rounded-xl text-left space-y-4 mb-8 border border-slate-200">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-600 font-bold">Membre</span>
                        <span className="font-extrabold text-slate-900">{selectedLoan.memberName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-600 font-bold">Montant Payé</span>
                        <span className="font-extrabold text-green-700">{lastPayment.amount} {lastPayment.currency}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-600 font-bold">Nouveau Solde</span>
                        <span className="font-extrabold text-slate-900">
                             {(selectedLoan.remainingBalance - lastPayment.amount).toFixed(2)} {selectedLoan.currency}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600 font-bold">ID Transaction</span>
                        <span className="text-xs text-slate-500 font-mono font-bold">{lastPayment.id}</span>
                    </div>
                </div>

                <div className="flex gap-3 flex-col sm:flex-row no-print">
                    <button onClick={() => setView('LIST')} className="flex-1 py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50">
                        Retour au Dashboard
                    </button>
                    <button onClick={() => window.print()} className="flex-1 py-3 bg-blue-700 rounded-xl text-white font-bold hover:bg-blue-800 flex items-center justify-center gap-2">
                        <Printer size={20} /> Imprimer Reçu
                    </button>
                </div>

                {/* Print Only Receipt */}
                <div className="hidden print-only text-left mt-8 pt-8 border-t-2 border-black">
                     <h1 className="text-xl font-bold mb-2 text-center text-black">{settings.institutionName}</h1>
                     <p className="text-center text-sm mb-6 font-bold text-black">Reçu de Paiement</p>
                     <div className="space-y-2 text-black">
                        <p><strong>Date:</strong> {new Date(lastPayment.date).toLocaleString()}</p>
                        <p><strong>Membre:</strong> {selectedLoan.memberName}</p>
                        <p><strong>Montant:</strong> {lastPayment.amount} {lastPayment.currency}</p>
                        <p><strong>Solde Restant:</strong> {(selectedLoan.remainingBalance - lastPayment.amount).toFixed(2)}</p>
                     </div>
                     <div className="mt-8 border-t border-dashed border-black pt-4">
                        <p className="text-xs text-center font-bold">Signature Agent</p>
                     </div>
                </div>
            </div>
        </div>
    );
  }

  if (view === 'CREATE') {
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button onClick={() => setView('LIST')} className="mb-6 flex items-center text-slate-600 font-bold hover:text-blue-700 transition">
                <ArrowLeft size={20} className="mr-2" strokeWidth={3}/> Retour à la liste
            </button>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                    <Wallet size={32} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900">Création d'un Nouveau Crédit</h2>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-sm font-extrabold text-slate-900 mb-2">Sélectionner le Membre <span className="text-red-600">*</span></label>
                        <select 
                            className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all cursor-pointer"
                            value={newLoan.memberId || ''}
                            onChange={e => setNewLoan({...newLoan, memberId: e.target.value})}
                        >
                            <option value="">-- Choisir un adhérent --</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-extrabold text-slate-900 mb-2">Source de Financement</label>
                        <select 
                            className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all cursor-pointer"
                            value={newLoan.partnerId || ''}
                            onChange={e => setNewLoan({...newLoan, partnerId: e.target.value})}
                        >
                            <option value="">Fonds Propres (Interne)</option>
                            {partners.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-extrabold text-slate-900 mb-2">Montant du Prêt <span className="text-red-600">*</span></label>
                        <div className="flex gap-3">
                             <input 
                                type="number"
                                className="flex-1 border-2 border-slate-200 bg-slate-50 rounded-xl p-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                                placeholder="ex: 500000"
                                value={newLoan.amount || ''}
                                onChange={e => setNewLoan({...newLoan, amount: Number(e.target.value)})}
                             />
                             <select 
                                className="w-28 border-2 border-slate-200 bg-slate-100 rounded-xl p-4 font-extrabold text-slate-900 cursor-pointer"
                                value={newLoan.currency}
                                onChange={e => setNewLoan({...newLoan, currency: e.target.value as Currency})}
                             >
                                <option value="CDF">CDF</option>
                                <option value="USD">USD</option>
                             </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-extrabold text-slate-900 mb-2">Durée (Mois)</label>
                        <input 
                            type="number"
                            className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                            value={newLoan.durationMonths}
                            onChange={e => setNewLoan({...newLoan, durationMonths: Number(e.target.value)})}
                         />
                    </div>
                </div>

                {/* Simulation Area */}
                <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-200 mb-8">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                            <Calculator size={24} className="text-blue-600" /> Simulation du Remboursement
                        </h3>
                        <button onClick={calculateLoan} className="text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline bg-blue-100 px-3 py-1 rounded-lg">
                            Actualiser les calculs
                        </button>
                    </div>
                    {newLoan.totalDue ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <span className="block text-slate-600 font-bold mb-1">Intérêts ({settings.interestRate}%)</span>
                                <span className="font-extrabold text-lg text-slate-900">{newLoan.totalInterest?.toLocaleString()} {newLoan.currency}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <span className="block text-slate-600 font-bold mb-1">Frais Dossier</span>
                                <span className="font-extrabold text-lg text-slate-900">{newLoan.totalFees?.toLocaleString()} {newLoan.currency}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <span className="block text-slate-600 font-bold mb-1">Assurance</span>
                                <span className="font-extrabold text-lg text-slate-900">{newLoan.totalInsurance?.toLocaleString()} {newLoan.currency}</span>
                            </div>
                            <div className="bg-blue-600 p-4 rounded-xl text-white shadow-lg shadow-blue-600/20">
                                <span className="block text-blue-100 font-bold mb-1">Total à Rembourser</span>
                                <span className="font-black text-xl">{newLoan.totalDue?.toLocaleString()} {newLoan.currency}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 font-medium italic">
                            Remplissez le montant et la durée ci-dessus, puis cliquez sur "Actualiser" pour voir le tableau.
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                    <button onClick={() => setView('LIST')} className="px-8 py-4 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition">
                        Annuler
                    </button>
                    <button onClick={handleCreateLoan} className="px-8 py-4 bg-blue-700 text-white font-bold text-lg rounded-xl hover:bg-blue-800 shadow-xl shadow-blue-700/20 transition-transform active:scale-95 flex items-center gap-2">
                        <CheckCircle size={24} /> Approuver & Créer le Prêt
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // LIST VIEW
  return (
    <div className="p-6 h-full flex flex-col bg-slate-50">
       <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Portefeuille Crédit</h2>
            <p className="text-slate-600 font-medium mt-1">Suivi des prêts actifs et remboursements</p>
        </div>
        <button 
          onClick={() => { setNewLoan({ currency: 'CDF', durationMonths: 3 }); setView('CREATE'); }}
          className="bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-800 transition shadow-lg shadow-blue-700/30 transform hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={3} /> <span className="font-bold">Nouveau Prêt</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
         <div className="overflow-auto flex-1">
             <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                     <tr>
                         <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Membre</th>
                         <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Capital Initial</th>
                         <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Devise</th>
                         <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Reste à Payer</th>
                         <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200">Statut</th>
                         <th className="p-5 text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {loans.map(loan => (
                         <tr key={loan.id} className="hover:bg-blue-50/50 transition-colors group">
                             <td className="p-5 font-bold text-slate-900 text-base">{loan.memberName}</td>
                             <td className="p-5 text-slate-700 font-semibold">{loan.amount.toLocaleString()}</td>
                             <td className="p-5">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${loan.currency === 'USD' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {loan.currency}
                                </span>
                             </td>
                             <td className="p-5 font-mono font-bold text-slate-900 text-lg">
                                {loan.remainingBalance.toLocaleString()}
                             </td>
                             <td className="p-5">
                                 <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                                    ${loan.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : ''}
                                    ${loan.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : ''}
                                    ${loan.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}
                                    ${loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                                 `}>
                                     {loan.status}
                                 </span>
                             </td>
                             <td className="p-5 text-right">
                                 {(loan.status === 'ACTIVE' || loan.status === 'OVERDUE') && (
                                     <button 
                                        onClick={() => { setSelectedLoan(loan); setView('PAYMENT'); }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-md hover:shadow-green-600/30"
                                     >
                                         Payer
                                     </button>
                                 )}
                             </td>
                         </tr>
                     ))}
                     {loans.length === 0 && (
                         <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-medium text-lg">Aucun prêt enregistré pour le moment.</td></tr>
                     )}
                 </tbody>
             </table>
         </div>
      </div>

      {/* Payment Modal Overlay */}
      {view === 'PAYMENT' && selectedLoan && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-xl font-extrabold text-slate-800">Enregistrer Paiement</h3>
                      <button onClick={() => setView('LIST')} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition">
                        <ArrowLeft size={24} />
                      </button>
                  </div>
                  <div className="p-8">
                      <div className="flex items-center gap-5 mb-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
                              {selectedLoan.memberName[0]}
                          </div>
                          <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Reste à payer</p>
                              <p className="text-2xl font-black text-slate-900 tracking-tight">{selectedLoan.remainingBalance.toLocaleString()} {selectedLoan.currency}</p>
                          </div>
                      </div>

                      <div className="mb-8">
                          <label className="block text-sm font-extrabold text-slate-900 mb-3">Montant du versement</label>
                          <div className="relative">
                              <input 
                                  type="number" 
                                  autoFocus
                                  className="w-full pl-5 pr-14 py-4 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-600 outline-none text-2xl font-bold text-slate-900 placeholder:text-slate-300"
                                  placeholder="0.00"
                                  value={paymentAmount}
                                  onChange={e => setPaymentAmount(e.target.value)}
                              />
                              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">
                                  {selectedLoan.currency}
                              </span>
                          </div>
                      </div>

                      <button 
                        onClick={handlePayment}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-xl shadow-green-600/30 transition-all transform hover:-translate-y-1"
                      >
                          Valider le Paiement
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};