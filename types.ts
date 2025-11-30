
export type Currency = 'CDF' | 'USD';
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'OVERDUE' | 'COMPLETED';
export type PartnerType = 'INTERNAL' | 'EXTERNAL';
export type FundingType = 'GRANT' | 'SUBVENTION' | 'CREDIT_LINE' | 'SOCIAL_INVESTMENT' | 'INSTITUTIONAL_LOAN';
export type UserRole = 'ADMIN' | 'AGENT';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, hash this!
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface Settings {
  institutionName: string;
  logoUrl: string | null;
  capitalCDF: number;
  capitalUSD: number;
  interestRate: number; // Percentage
  applicationFeePercent: number;
  insuranceFeePercent: number;
  savingsPercent: number;
  penaltyRate: number;
  
  // Customizable Welcome Screen
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeDescription: string;
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  country: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Funding {
  id: string;
  partnerId: string;
  amount: number;
  currency: Currency;
  type: FundingType;
  date: number;
  remainingAmount: number;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string; // Post-nom/Last name
  gender: 'M' | 'F';
  phone: string;
  address: string;
  profession: string;
  group: string;
  registrationDate: number;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  partnerId?: string; // Source of funding
  amount: number;
  currency: Currency;
  durationMonths: number;
  interestRate: number;
  startDate: number;
  status: LoanStatus;
  
  // Financials
  totalInterest: number;
  totalFees: number;
  totalInsurance: number;
  totalSavings: number;
  totalDue: number; // Principal + Interest
  remainingBalance: number;
}

export interface Payment {
  id: string;
  loanId: string;
  memberId: string;
  amount: number;
  currency: Currency;
  date: number;
  agentName: string;
  method: 'CASH' | 'MOBILE_MONEY' | 'BANK';
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: number;
  user: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  MEMBERS = 'MEMBERS',
  LOANS = 'LOANS',
  PARTNERS = 'PARTNERS',
  SETTINGS = 'SETTINGS',
  USERS = 'USERS'
}

export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
  IMAGE = 'gemini-3-pro-image-preview',
  LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  images?: string[];
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}
