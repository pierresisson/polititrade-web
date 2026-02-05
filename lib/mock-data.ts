// Centralized mock data for PolitiTrades
// All mock data in one place for easy management

export type Party = "D" | "R";
export type Chamber = "House" | "Senate";
export type TradeType = "buy" | "sell";

export type Politician = {
  id: string;
  name: string;
  party: Party;
  chamber: Chamber;
  state: string;
  imageUrl?: string;
  trades: number;
  volume: string;
  topHolding: string;
  returnYTD: string;
};

export type Transaction = {
  id: string;
  politicianId: string;
  politician: string;
  party: Party;
  state: string;
  stock: string;
  company: string;
  type: TradeType;
  amount: string;
  date: string;
  filedDate: string;
  daysAgo: number;
};

export type Stock = {
  symbol: string;
  name: string;
  transactions: number;
  change: string;
  trending: "up" | "down";
};

// ============================================
// POLITICIANS
// ============================================

export const politicians: Politician[] = [
  {
    id: "pelosi",
    name: "Nancy Pelosi",
    party: "D",
    chamber: "House",
    state: "CA",
    trades: 43,
    volume: "$12.4M",
    topHolding: "NVDA",
    returnYTD: "+67%",
  },
  {
    id: "tuberville",
    name: "Tommy Tuberville",
    party: "R",
    chamber: "Senate",
    state: "AL",
    trades: 156,
    volume: "$8.7M",
    topHolding: "AAPL",
    returnYTD: "+45%",
  },
  {
    id: "crenshaw",
    name: "Dan Crenshaw",
    party: "R",
    chamber: "House",
    state: "TX",
    trades: 28,
    volume: "$3.2M",
    topHolding: "MSFT",
    returnYTD: "+34%",
  },
  {
    id: "warner",
    name: "Mark Warner",
    party: "D",
    chamber: "Senate",
    state: "VA",
    trades: 12,
    volume: "$5.1M",
    topHolding: "GOOGL",
    returnYTD: "+28%",
  },
  {
    id: "gottheimer",
    name: "Josh Gottheimer",
    party: "D",
    chamber: "House",
    state: "NJ",
    trades: 89,
    volume: "$2.8M",
    topHolding: "META",
    returnYTD: "+52%",
  },
];

// ============================================
// TRANSACTIONS
// ============================================

export const transactions: Transaction[] = [
  {
    id: "tx-1",
    politicianId: "pelosi",
    politician: "Nancy Pelosi",
    party: "D",
    state: "CA",
    stock: "NVDA",
    company: "NVIDIA Corporation",
    type: "buy",
    amount: "$1M – $5M",
    date: "Jan 15, 2024",
    filedDate: "Jan 20, 2024",
    daysAgo: 2,
  },
  {
    id: "tx-2",
    politicianId: "tuberville",
    politician: "Tommy Tuberville",
    party: "R",
    state: "AL",
    stock: "AAPL",
    company: "Apple Inc.",
    type: "sell",
    amount: "$250K – $500K",
    date: "Jan 14, 2024",
    filedDate: "Jan 19, 2024",
    daysAgo: 3,
  },
  {
    id: "tx-3",
    politicianId: "crenshaw",
    politician: "Dan Crenshaw",
    party: "R",
    state: "TX",
    stock: "MSFT",
    company: "Microsoft Corp.",
    type: "buy",
    amount: "$100K – $250K",
    date: "Jan 14, 2024",
    filedDate: "Jan 19, 2024",
    daysAgo: 3,
  },
  {
    id: "tx-4",
    politicianId: "warner",
    politician: "Mark Warner",
    party: "D",
    state: "VA",
    stock: "GOOGL",
    company: "Alphabet Inc.",
    type: "buy",
    amount: "$500K – $1M",
    date: "Jan 13, 2024",
    filedDate: "Jan 18, 2024",
    daysAgo: 4,
  },
  {
    id: "tx-5",
    politicianId: "gottheimer",
    politician: "Josh Gottheimer",
    party: "D",
    state: "NJ",
    stock: "AMZN",
    company: "Amazon.com Inc.",
    type: "buy",
    amount: "$50K – $100K",
    date: "Jan 12, 2024",
    filedDate: "Jan 17, 2024",
    daysAgo: 5,
  },
  {
    id: "tx-6",
    politicianId: "tuberville",
    politician: "Tommy Tuberville",
    party: "R",
    state: "AL",
    stock: "TSLA",
    company: "Tesla Inc.",
    type: "sell",
    amount: "$100K – $250K",
    date: "Jan 11, 2024",
    filedDate: "Jan 16, 2024",
    daysAgo: 6,
  },
  {
    id: "tx-7",
    politicianId: "pelosi",
    politician: "Nancy Pelosi",
    party: "D",
    state: "CA",
    stock: "META",
    company: "Meta Platforms",
    type: "buy",
    amount: "$15K – $50K",
    date: "Jan 10, 2024",
    filedDate: "Jan 15, 2024",
    daysAgo: 7,
  },
  {
    id: "tx-8",
    politicianId: "crenshaw",
    politician: "Dan Crenshaw",
    party: "R",
    state: "TX",
    stock: "AMD",
    company: "Advanced Micro Devices",
    type: "buy",
    amount: "$1K – $15K",
    date: "Jan 9, 2024",
    filedDate: "Jan 14, 2024",
    daysAgo: 8,
  },
];

// ============================================
// TRENDING STOCKS
// ============================================

export const trendingStocks: Stock[] = [
  { symbol: "NVDA", name: "NVIDIA", transactions: 12, change: "+3.2%", trending: "up" },
  { symbol: "MSFT", name: "Microsoft", transactions: 8, change: "+1.4%", trending: "up" },
  { symbol: "GOOGL", name: "Alphabet", transactions: 6, change: "-0.8%", trending: "down" },
  { symbol: "AAPL", name: "Apple", transactions: 5, change: "+0.5%", trending: "up" },
  { symbol: "TSLA", name: "Tesla", transactions: 4, change: "-2.1%", trending: "down" },
];

// ============================================
// STATS
// ============================================

export const weeklyStats = {
  totalVolume: "$47M",
  totalTrades: 156,
  activePoliticians: 42,
};

// ============================================
// HELPERS
// ============================================

export function getPoliticianById(id: string): Politician | undefined {
  return politicians.find((p) => p.id === id);
}

export function getTransactionsByPolitician(politicianId: string): Transaction[] {
  return transactions.filter((t) => t.politicianId === politicianId);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function getPartyColor(party: Party): string {
  return party === "D" ? "text-blue-600" : "text-red-600";
}

export function getPartyBgColor(party: Party): string {
  return party === "D" ? "bg-blue-100" : "bg-red-100";
}
