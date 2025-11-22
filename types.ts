export interface Gift {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  claimedBy: string | null;
  claimedByUserId?: string | null; // Novo campo para identificar o dono da marcação
  isAnonymous?: boolean;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}