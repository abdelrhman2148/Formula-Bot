
export enum Platform {
  EXCEL = 'Excel',
  GOOGLE_SHEETS = 'Google Sheets'
}

export enum Complexity {
  BASIC = 'Basic',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum UserTier {
  GUEST = 'guest',
  FREE = 'free',
  PREMIUM = 'premium'
}

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  createdAt: number;
}

export interface GeneratedFormula {
  formula: string;
  explanation: string;
  complexity: string;
  platform: string;
}

export interface HistoryItem extends GeneratedFormula {
  id: string;
  prompt: string;
  timestamp: number;
}

export interface GeneratorState {
  prompt: string;
  platform: Platform;
  isLoading: boolean;
  result: GeneratedFormula | null;
  error: string | null;
}

export interface UsageMetric {
  name: string;
  value: number;
  color: string;
}

// Errors
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class PaymentRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentRequiredError";
  }
}
