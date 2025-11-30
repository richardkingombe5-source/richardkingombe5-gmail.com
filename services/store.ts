
import { Member, Partner, Funding, Loan, Payment, Settings, AuditLog, Currency, LoanStatus, User } from "../types";

// Initial Mock Data
const DEFAULT_SETTINGS: Settings = {
  institutionName: "ONGD DEBOUT GRANDS LACS",
  logoUrl: null,
  capitalCDF: 10000000,
  capitalUSD: 5000,
  interestRate: 10,
  applicationFeePercent: 2,
  insuranceFeePercent: 1,
  savingsPercent: 5,
  penaltyRate: 5,
  
  // Default customizable text
  welcomeTitle: "ONGD DEBOUT GRANDS LACS",
  welcomeSubtitle: "Soutenez vos projets avec le microcrédit solidaire",
  welcomeDescription: "Un programme de financement adapté pour les membres de l'église CVEM.\nPrêts sur 3 mois OU PLUS avec des taux solidaires."
};

const DEFAULT_ADMIN: User = {
    id: 'admin-001',
    username: 'admin',
    password: 'admin', // Default password
    name: 'Administrateur Principal',
    role: 'ADMIN',
    isActive: true
};

class StoreService {
  private load<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  private save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Users & Auth ---
  getUsers(): User[] {
      const users = this.load<User[]>('mfi_users', []);
      if (users.length === 0) {
          // Initialize default admin if no users exist
          users.push(DEFAULT_ADMIN);
          this.save('mfi_users', users);
      }
      return users;
  }

  saveUser(user: User) {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) users[idx] = user;
      else users.push(user);
      this.save('mfi_users', users);
  }

  deleteUser(id: string) {
      const users = this.getUsers().filter(u => u.id !== id);
      // Prevent deleting the last admin
      if (!users.some(u => u.role === 'ADMIN')) {
          throw new Error("Impossible de supprimer le dernier administrateur.");
      }
      this.save('mfi_users', users);
  }

  login(username: string, password: string): User | null {
      const users = this.getUsers();
      const user = users.find(u => u.username === username && u.password === password && u.isActive);
      if (user) {
          this.logAudit('LOGIN', `Connexion utilisateur: ${user.name}`);
          return user;
      }
      return null;
  }

  // --- Settings ---
  getSettings(): Settings {
    return this.load<Settings>('mfi_settings', DEFAULT_SETTINGS);
  }

  saveSettings(settings: Settings) {
    this.save('mfi_settings', settings);
  }

  // --- Members ---
  getMembers(): Member[] {
    return this.load<Member[]>('mfi_members', []);
  }

  saveMember(member: Member) {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === member.id);
    if (idx >= 0) members[idx] = member;
    else members.push(member);
    this.save('mfi_members', members);
  }

  deleteMember(id: string) {
    // Logic check: ensure no active loans
    const loans = this.getLoans().filter(l => l.memberId === id && l.status === 'ACTIVE');
    if (loans.length > 0) throw new Error("Impossible de supprimer: Ce membre a des prêts actifs.");
    
    const members = this.getMembers().filter(m => m.id !== id);
    this.save('mfi_members', members);
  }

  // --- Partners ---
  getPartners(): Partner[] {
    return this.load<Partner[]>('mfi_partners', []);
  }

  savePartner(partner: Partner) {
    const partners = this.getPartners();
    const idx = partners.findIndex(p => p.id === partner.id);
    if (idx >= 0) partners[idx] = partner;
    else partners.push(partner);
    this.save('mfi_partners', partners);
  }

  // --- Loans ---
  getLoans(): Loan[] {
    return this.load<Loan[]>('mfi_loans', []);
  }

  createLoan(loan: Loan) {
    // Check capital availability
    const settings = this.getSettings();
    const loans = this.getLoans();
    
    // Calculate currently used capital
    const activeLoans = loans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    const usedCDF = activeLoans.filter(l => l.currency === 'CDF').reduce((acc, l) => acc + l.remainingBalance, 0); // Simplified approximation
    const usedUSD = activeLoans.filter(l => l.currency === 'USD').reduce((acc, l) => acc + l.remainingBalance, 0);

    // Simple capital check
    if (loan.currency === 'CDF') {
        if ((settings.capitalCDF - usedCDF) < loan.amount) throw new Error("Capital CDF insuffisant pour couvrir ce prêt.");
    } else {
        if ((settings.capitalUSD - usedUSD) < loan.amount) throw new Error("Capital USD insuffisant pour couvrir ce prêt.");
    }

    loans.push(loan);
    this.save('mfi_loans', loans);
    this.logAudit('CREATE_LOAN', `Prêt créé pour ${loan.memberName} (${loan.amount} ${loan.currency})`);
  }

  updateLoanStatus(id: string, status: LoanStatus) {
    const loans = this.getLoans();
    const loan = loans.find(l => l.id === id);
    if (loan) {
      loan.status = status;
      this.save('mfi_loans', loans);
      this.logAudit('UPDATE_LOAN', `Statut prêt ${id} changé en ${status}`);
    }
  }

  // --- Payments ---
  getPayments(): Payment[] {
    return this.load<Payment[]>('mfi_payments', []);
  }

  recordPayment(payment: Payment) {
    const loans = this.getLoans();
    const loan = loans.find(l => l.id === payment.loanId);
    
    if (!loan) throw new Error("Prêt introuvable");

    // Update Loan Balance
    loan.remainingBalance -= payment.amount;
    
    if (loan.remainingBalance <= 0) {
      loan.remainingBalance = 0;
      loan.status = 'COMPLETED';
    } else if (loan.status === 'OVERDUE') {
       // Logic to revert to active if payment satisfies overdue amount could go here
       loan.status = 'ACTIVE'; 
    }

    this.save('mfi_loans', loans);

    // Save Payment
    const payments = this.getPayments();
    payments.push(payment);
    this.save('mfi_payments', payments);
    
    this.logAudit('PAYMENT', `Paiement de ${payment.amount} ${payment.currency} reçu pour prêt ${loan.id}`);
  }

  // --- Logs ---
  logAudit(action: string, details: string) {
    const logs = this.load<AuditLog[]>('mfi_logs', []);
    logs.unshift({
      id: Date.now().toString(),
      action,
      details,
      timestamp: Date.now(),
      user: 'Système' // Will be updated by UI context if possible
    });
    this.save('mfi_logs', logs);
  }
}

export const store = new StoreService();
