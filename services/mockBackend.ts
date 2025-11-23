
import { User, UserTier, HistoryItem, RateLimitError, PaymentRequiredError } from '../types';

// Constants matching the brief
const LIMITS = {
  [UserTier.GUEST]: { count: 1, windowMs: 24 * 60 * 60 * 1000 }, // 1 per 24h
  [UserTier.FREE]: { count: 5, windowMs: 6 * 60 * 60 * 1000 },    // 5 per 6h
  [UserTier.PREMIUM]: { count: Infinity, windowMs: 0 }
};

const STORAGE_KEYS = {
  USER: 'efb_user',
  HISTORY: 'efb_history',
  USAGE: 'efb_usage'
};

interface UsageRecord {
  count: number;
  resetAt: number;
}

// --- Auth Simulation ---

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
};

export const login = async (email: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock login - in reality this would hit Supabase
  const user: User = {
    id: crypto.randomUUID(),
    email,
    tier: UserTier.FREE, // Default to Free on login
    createdAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const logout = async () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const upgradeToPremium = async (userId: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate Stripe
  const user = getCurrentUser();
  if (!user || user.id !== userId) throw new Error("User not found");
  
  const updatedUser = { ...user, tier: UserTier.PREMIUM };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  return updatedUser;
};

// --- Rate Limiting Simulation (Redis Logic) ---

export const checkRateLimit = async (user: User | null): Promise<void> => {
  const tier = user ? user.tier : UserTier.GUEST;
  const limit = LIMITS[tier];
  
  if (limit.count === Infinity) return;

  const now = Date.now();
  const usageKey = `${STORAGE_KEYS.USAGE}_${tier}_${user?.id || 'guest'}`;
  const storedUsage = localStorage.getItem(usageKey);
  
  let usage: UsageRecord = storedUsage ? JSON.parse(storedUsage) : { count: 0, resetAt: now + limit.windowMs };

  // Reset if window passed
  if (now > usage.resetAt) {
    usage = { count: 0, resetAt: now + limit.windowMs };
  }

  if (usage.count >= limit.count) {
    const hoursRemaining = Math.ceil((usage.resetAt - now) / (1000 * 60 * 60));
    throw new RateLimitError(
      `Limit reached. ${tier === UserTier.GUEST ? 'Guests' : 'Free users'} are limited to ${limit.count} formulas per ${tier === UserTier.GUEST ? 'day' : '6 hours'}. Please ${tier === UserTier.GUEST ? 'sign up' : 'upgrade'} or wait ${hoursRemaining} hours.`
    );
  }
};

export const incrementUsage = (user: User | null) => {
  const tier = user ? user.tier : UserTier.GUEST;
  const limit = LIMITS[tier];
  if (limit.count === Infinity) return;

  const usageKey = `${STORAGE_KEYS.USAGE}_${tier}_${user?.id || 'guest'}`;
  const storedUsage = localStorage.getItem(usageKey);
  let usage: UsageRecord = storedUsage ? JSON.parse(storedUsage) : { count: 0, resetAt: Date.now() + limit.windowMs };

  usage.count += 1;
  localStorage.setItem(usageKey, JSON.stringify(usage));
};

// --- History ---

export const getHistory = (): HistoryItem[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return stored ? JSON.parse(stored) : [];
};

export const addToHistory = (item: HistoryItem) => {
  const history = getHistory();
  const updated = [item, ...history];
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  return updated;
};
