export interface GiftClaim {
  userId: string;
  name: string;
  isAnonymous: boolean;
  timestamp: number;
}

export interface Gift {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  maxQuantity?: number; // Default is 1
  claims?: GiftClaim[]; // Array of claims
  
  // Legacy fields (kept for type compatibility if needed, but logic moves to claims array)
  claimedBy?: string | null; 
  claimedByUserId?: string | null;
  isAnonymous?: boolean;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CashGoal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
}