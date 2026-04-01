import { fetchApiData } from "./api";
import type { DashboardAreaCode, DashboardRequestStatus, DashboardServiceCode, DashboardVerificationStatus, DashboardWorkerSpecialtyCode } from "./dashboard-data";

export interface ClientRequestListItem {
  id: string;
  requestNumber: string;
  title: string;
  serviceId: string;
  status: DashboardRequestStatus | "PENDING" | "COMPLETED";
  area: string;
  createdAt: string;
}

export interface ClientRequestDetailData {
  id: string;
  requestNumber: string;
  categoryId: string;
  serviceId: string;
  title: string;
  description: string;
  mediaNotes: string;
  address: {
    mode: "saved" | "new";
    savedAddressId?: string;
    governorate?: string;
    city?: string;
    district?: string;
    street?: string;
  };
  timing: {
    type: "emergency" | "today" | "tomorrow" | "custom";
    customDate?: string;
    customWindow?: string;
  };
  status: DashboardRequestStatus | "PENDING" | "COMPLETED";
  area: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFavoritesData {
  summary: {
    totalFavorites: number;
    onlineNow: number;
    avgRating: number;
  };
  workers: Array<{
    id: string;
    name: string;
    specialty: string;
    rating: number;
    completedJobs: number;
    area: string;
    availability: string;
  }>;
}

export interface ClientWalletData {
  balance: number;
  currency: string;
  spendThisMonth: number;
  pendingRefunds: number;
  paymentMethods: Array<{
    id: string;
    label: string;
    isDefault: boolean;
  }>;
  recentTransactions: Array<{
    id: string;
    type: "topup" | "payment" | "refund";
    amount: number;
    label: string;
    createdAt: string;
  }>;
}

export interface ClientSettingsData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  preferences: {
    language: string;
    notificationsBySms: boolean;
    notificationsByEmail: boolean;
    marketingUpdates: boolean;
  };
  addresses: Array<{
    id: string;
    label: string;
    isDefault: boolean;
  }>;
}

export interface WorkerEarningsData {
  today: number;
  week: number;
  month: number;
  pendingWithdrawal: number;
  growth: number;
  chart: Array<{
    label: string;
    amount: number;
  }>;
  payouts: Array<{
    id: string;
    amount: number;
    status: "scheduled" | "paid";
    date: string;
  }>;
  transactions: Array<{
    id: string;
    label: string;
    type: "service" | "withdrawal" | "bonus";
    amount: number;
  }>;
}

export interface PendingWorkersData {
  summary: {
    totalPending: number;
    highPriority: number;
    submittedToday: number;
    averageReviewHours: number;
  };
  workers: Array<{
    id: string;
    name: string;
    specialty: DashboardWorkerSpecialtyCode;
    area: string;
    experienceYears: number;
    rating: number;
    documentsReady: number;
    submittedAt: string;
    status: DashboardVerificationStatus;
  }>;
}

export interface WorkerIncomingRequestsData {
  summary: {
    availableNow: number;
    sameDay: number;
    emergency: number;
    averageBudget: number;
  };
  requests: Array<{
    id: string;
    service: DashboardServiceCode;
    urgency: "NORMAL" | "SAME_DAY" | "URGENT";
    area: DashboardAreaCode;
    budgetMin: number;
    budgetMax: number;
    distanceKm: number;
    freshnessMinutes: number;
  }>;
}

export interface WorkerActiveRequestsData {
  summary: {
    activeJobs: number;
    enRoute: number;
    onSite: number;
    wrapUp: number;
  };
  requests: Array<{
    id: string;
    service: DashboardServiceCode;
    status: "EN_ROUTE" | "ON_SITE" | "WRAP_UP";
    clientName: string;
    area: DashboardAreaCode;
    scheduledWindow: string;
    earnings: number;
  }>;
}

export interface WorkerRatingsData {
  summary: {
    overallRating: number;
    totalReviews: number;
    repeatClientsRate: number;
    fiveStars: number;
  };
  badges: string[];
  reviews: Array<{
    id: string;
    clientName: string;
    rating: number;
    service: string;
    comment: string;
    createdAt: string;
  }>;
}

export interface WorkerSettingsData {
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  workPreferences: {
    isAvailable: boolean;
    acceptsEmergency: boolean;
    acceptsSameDay: boolean;
    serviceAreas: string[];
  };
  payout: {
    method: string;
    schedule: string;
    bankLabel: string;
  };
}

export interface AdminClientsData {
  summary: {
    totalClients: number;
    activeThisWeek: number;
    vipClients: number;
    averageRating: number;
  };
  clients: Array<{
    id: string;
    name: string;
    city: string;
    requests: number;
    walletBalance: number;
    status: string;
  }>;
}

export interface AdminRequestsData {
  summary: {
    active: number;
    completedToday: number;
    disputed: number;
    averageTicket: number;
  };
  requests: Array<{
    id: string;
    title: string;
    status: string;
    city: string;
    amount: number;
  }>;
}

export interface AdminFinanceData {
  summary: {
    totalRevenue: number;
    commissions: number;
    escrowHeld: number;
    releasedThisWeek: number;
  };
  streams: Array<{
    label: string;
    value: number;
  }>;
  payouts: Array<{
    id: string;
    label: string;
    status: string;
    amount: number;
  }>;
}

export interface AdminSettingsData {
  platform: {
    supportEmail: string;
    emergencyHotline: string;
    defaultLanguage: string;
  };
  operations: {
    autoAssignmentEnabled: boolean;
    manualVerificationRequired: boolean;
    payoutsSchedule: string;
  };
  moderation: {
    complaintEscalationHours: number;
    reviewVisibilityCheck: boolean;
    workerRecheckCycleDays: number;
  };
}

const workerEarningsFallback: WorkerEarningsData = {
  today: 1240,
  week: 4280,
  month: 11240,
  pendingWithdrawal: 1800,
  growth: 18,
  chart: [
    { label: "Week 1", amount: 2200 },
    { label: "Week 2", amount: 2640 },
    { label: "Week 3", amount: 2910 },
    { label: "Week 4", amount: 3490 }
  ],
  payouts: [
    { id: "payout-1", amount: 1800, status: "scheduled", date: "2026-03-31" },
    { id: "payout-2", amount: 4200, status: "paid", date: "2026-03-21" }
  ],
  transactions: [
    { id: "txn-1", label: "AC maintenance", type: "service", amount: 420 },
    { id: "txn-2", label: "Electrical inspection", type: "service", amount: 310 },
    { id: "txn-3", label: "Withdrawal", type: "withdrawal", amount: -1800 },
    { id: "txn-4", label: "Bonus payout", type: "bonus", amount: 250 }
  ]
};

const clientRequestsFallback: ClientRequestListItem[] = [
  {
    id: "req-101",
    requestNumber: "OSTA-101",
    title: "Urgent electrical repair",
    serviceId: "electrical-emergency",
    status: "WORKER_EN_ROUTE",
    area: "New Cairo",
    createdAt: "2026-03-28T09:20:00.000Z"
  },
  {
    id: "req-102",
    requestNumber: "OSTA-102",
    title: "Kitchen plumbing fix",
    serviceId: "plumbing-repair",
    status: "IN_PROGRESS",
    area: "Maadi",
    createdAt: "2026-03-28T08:10:00.000Z"
  },
  {
    id: "req-103",
    requestNumber: "OSTA-103",
    title: "Living room painting",
    serviceId: "painting-finishes",
    status: "COMPLETED",
    area: "New Cairo",
    createdAt: "2026-03-24T15:00:00.000Z"
  }
];

const clientRequestDetailFallback: ClientRequestDetailData = {
  id: "req-101",
  requestNumber: "OSTA-101",
  categoryId: "electrical",
  serviceId: "electrical-emergency",
  title: "Urgent electrical repair",
  description: "Main kitchen socket stopped working and the breaker trips every few minutes.",
  mediaNotes: "3 images attached from the kitchen panel.",
  address: {
    mode: "saved",
    savedAddressId: "home-new-cairo"
  },
  timing: {
    type: "emergency"
  },
  status: "WORKER_EN_ROUTE",
  area: "New Cairo",
  createdAt: "2026-03-28T09:20:00.000Z",
  updatedAt: "2026-03-28T09:32:00.000Z"
};

const clientFavoritesFallback: ClientFavoritesData = {
  summary: {
    totalFavorites: 3,
    onlineNow: 1,
    avgRating: 4.9
  },
  workers: [
    { id: "worker-1", name: "Ahmed Fawzy", specialty: "AC Technician", rating: 4.9, completedJobs: 354, area: "New Cairo", availability: "Available tomorrow" },
    { id: "worker-2", name: "Youssef El-Sharif", specialty: "Electrician", rating: 4.9, completedJobs: 312, area: "Nasr City", availability: "Online now" },
    { id: "worker-3", name: "Mostafa Adel", specialty: "Plumber", rating: 4.8, completedJobs: 287, area: "Maadi", availability: "Today 7 PM" }
  ]
};

const clientWalletFallback: ClientWalletData = {
  balance: 860,
  currency: "EGP",
  spendThisMonth: 2140,
  pendingRefunds: 180,
  paymentMethods: [
    { id: "card-1", label: "Visa ending 1842", isDefault: true },
    { id: "wallet-1", label: "Vodafone Cash", isDefault: false }
  ],
  recentTransactions: [
    { id: "txn-1", type: "topup", amount: 500, label: "Wallet top-up", createdAt: "2026-03-27T18:30:00.000Z" },
    { id: "txn-2", type: "payment", amount: -320, label: "Electrical repair payment", createdAt: "2026-03-27T19:10:00.000Z" },
    { id: "txn-3", type: "refund", amount: 180, label: "Partial refund", createdAt: "2026-03-25T15:00:00.000Z" }
  ]
};

const clientSettingsFallback: ClientSettingsData = {
  profile: {
    firstName: "Mariam",
    lastName: "Hassan",
    email: "mariam@osta.eg",
    phone: "+201000000000"
  },
  preferences: {
    language: "ar",
    notificationsBySms: true,
    notificationsByEmail: true,
    marketingUpdates: false
  },
  addresses: [
    { id: "home-new-cairo", label: "Home - New Cairo", isDefault: true },
    { id: "villa-maadi", label: "Villa - Maadi", isDefault: false }
  ]
};

const pendingWorkersFallback: PendingWorkersData = {
  summary: {
    totalPending: 43,
    highPriority: 13,
    submittedToday: 8,
    averageReviewHours: 29
  },
  workers: [
    {
      id: "worker-18",
      name: "Mahmoud Saber",
      specialty: "plumber",
      area: "Nasr City",
      experienceYears: 7,
      rating: 4.8,
      documentsReady: 5,
      submittedAt: "2026-03-27",
      status: "UNDER_REVIEW"
    },
    {
      id: "worker-19",
      name: "Ali Nader",
      specialty: "electrician",
      area: "New Cairo",
      experienceYears: 6,
      rating: 4.7,
      documentsReady: 4,
      submittedAt: "2026-03-27",
      status: "DOCUMENTS_SUBMITTED"
    },
    {
      id: "worker-20",
      name: "Khaled Amin",
      specialty: "acTechnician",
      area: "Maadi",
      experienceYears: 9,
      rating: 4.9,
      documentsReady: 3,
      submittedAt: "2026-03-28",
      status: "AWAITING_ID"
    }
  ]
};

const workerIncomingRequestsFallback: WorkerIncomingRequestsData = {
  summary: {
    availableNow: 8,
    sameDay: 3,
    emergency: 1,
    averageBudget: 340
  },
  requests: [
    {
      id: "offer-1",
      service: "acMaintenance",
      urgency: "SAME_DAY",
      area: "newCairo",
      budgetMin: 350,
      budgetMax: 450,
      distanceKm: 2.4,
      freshnessMinutes: 6
    },
    {
      id: "offer-2",
      service: "electricalInspection",
      urgency: "NORMAL",
      area: "nasrCity",
      budgetMin: 250,
      budgetMax: 320,
      distanceKm: 4.1,
      freshnessMinutes: 14
    },
    {
      id: "offer-3",
      service: "faucetInstallation",
      urgency: "URGENT",
      area: "maadi",
      budgetMin: 220,
      budgetMax: 280,
      distanceKm: 3.2,
      freshnessMinutes: 4
    }
  ]
};

const workerActiveRequestsFallback: WorkerActiveRequestsData = {
  summary: {
    activeJobs: 4,
    enRoute: 2,
    onSite: 1,
    wrapUp: 1
  },
  requests: [
    {
      id: "active-1",
      service: "electricalRepair",
      status: "EN_ROUTE",
      clientName: "Mariam Hassan",
      area: "newCairo",
      scheduledWindow: "Today 2:00 PM - 3:00 PM",
      earnings: 320
    },
    {
      id: "active-2",
      service: "kitchenPlumbing",
      status: "ON_SITE",
      clientName: "Karim Adel",
      area: "maadi",
      scheduledWindow: "Today 3:30 PM - 5:00 PM",
      earnings: 410
    },
    {
      id: "active-3",
      service: "acMaintenance",
      status: "WRAP_UP",
      clientName: "Nour Emad",
      area: "nasrCity",
      scheduledWindow: "Today 5:30 PM - 6:30 PM",
      earnings: 480
    }
  ]
};

const workerRatingsFallback: WorkerRatingsData = {
  summary: {
    overallRating: 4.9,
    totalReviews: 312,
    repeatClientsRate: 41,
    fiveStars: 284
  },
  badges: ["Fast arrival", "Top-rated", "Trusted pro"],
  reviews: [
    { id: "review-1", clientName: "Sara Hassan", rating: 5, service: "AC maintenance", comment: "Very clean execution and fast arrival.", createdAt: "2026-03-26T16:00:00.000Z" },
    { id: "review-2", clientName: "Hany Mahmoud", rating: 5, service: "Electrical inspection", comment: "Clear communication and fair pricing.", createdAt: "2026-03-24T11:30:00.000Z" },
    { id: "review-3", clientName: "Mona Sherif", rating: 4, service: "Faucet installation", comment: "Good work and finished within the expected window.", createdAt: "2026-03-21T14:10:00.000Z" }
  ]
};

const workerSettingsFallback: WorkerSettingsData = {
  profile: {
    firstName: "Youssef",
    lastName: "Mahmoud",
    phone: "+201055555555",
    email: "youssef.worker@osta.eg"
  },
  workPreferences: {
    isAvailable: true,
    acceptsEmergency: true,
    acceptsSameDay: true,
    serviceAreas: ["New Cairo", "Nasr City", "Maadi"]
  },
  payout: {
    method: "Bank transfer",
    schedule: "Weekly",
    bankLabel: "National Bank ending 2241"
  }
};

const adminClientsFallback: AdminClientsData = {
  summary: {
    totalClients: 14200,
    activeThisWeek: 3240,
    vipClients: 186,
    averageRating: 4.8
  },
  clients: [
    { id: "client-1", name: "Mariam Hassan", city: "New Cairo", requests: 28, walletBalance: 860, status: "VIP" },
    { id: "client-2", name: "Karim Adel", city: "Maadi", requests: 11, walletBalance: 220, status: "Active" },
    { id: "client-3", name: "Nour Emad", city: "Nasr City", requests: 17, walletBalance: 0, status: "Active" }
  ]
};

const adminRequestsFallback: AdminRequestsData = {
  summary: {
    active: 186,
    completedToday: 88,
    disputed: 12,
    averageTicket: 410
  },
  requests: [
    { id: "req-101", title: "Urgent electrical repair", status: "WORKER_EN_ROUTE", city: "New Cairo", amount: 320 },
    { id: "req-102", title: "Kitchen plumbing fix", status: "IN_PROGRESS", city: "Maadi", amount: 410 },
    { id: "req-103", title: "AC maintenance", status: "PENDING", city: "Nasr City", amount: 450 }
  ]
};

const adminFinanceFallback: AdminFinanceData = {
  summary: {
    totalRevenue: 684000,
    commissions: 102600,
    escrowHeld: 274000,
    releasedThisWeek: 84200
  },
  streams: [
    { label: "Commissions", value: 102600 },
    { label: "Escrow held", value: 274000 },
    { label: "Released", value: 84200 }
  ],
  payouts: [
    { id: "pay-1", label: "Worker batch payout", status: "Scheduled", amount: 52000 },
    { id: "pay-2", label: "Escrow release", status: "Processed", amount: 18400 }
  ]
};

const adminSettingsFallback: AdminSettingsData = {
  platform: {
    supportEmail: "support@osta.eg",
    emergencyHotline: "+20 100 000 0000",
    defaultLanguage: "ar"
  },
  operations: {
    autoAssignmentEnabled: false,
    manualVerificationRequired: true,
    payoutsSchedule: "Weekly"
  },
  moderation: {
    complaintEscalationHours: 24,
    reviewVisibilityCheck: true,
    workerRecheckCycleDays: 90
  }
};

export function getWorkerEarningsData() {
  return fetchApiData<WorkerEarningsData>("/workers/earnings/summary", workerEarningsFallback);
}

export function getPendingWorkersData() {
  return fetchApiData<PendingWorkersData>("/admin/workers/pending", pendingWorkersFallback);
}

export function getClientRequestsData() {
  return fetchApiData<ClientRequestListItem[]>("/clients/requests", clientRequestsFallback);
}

export function getClientFavoritesData() {
  return fetchApiData<ClientFavoritesData>("/clients/favorites", clientFavoritesFallback);
}

export function getClientWalletData() {
  return fetchApiData<ClientWalletData>("/clients/wallet", clientWalletFallback);
}

export function getClientSettingsData() {
  return fetchApiData<ClientSettingsData>("/clients/settings", clientSettingsFallback);
}

export function getClientRequestDetailData(id: string) {
  return fetchApiData<ClientRequestDetailData>(`/clients/requests/${id}`, {
    ...clientRequestDetailFallback,
    id,
    requestNumber: id === clientRequestDetailFallback.id ? clientRequestDetailFallback.requestNumber : `OSTA-${id}`
  });
}

export function getWorkerIncomingRequestsData() {
  return fetchApiData<WorkerIncomingRequestsData>("/workers/requests/incoming", workerIncomingRequestsFallback);
}

export function getWorkerActiveRequestsData() {
  return fetchApiData<WorkerActiveRequestsData>("/workers/requests/active", workerActiveRequestsFallback);
}

export function getWorkerRatingsData() {
  return fetchApiData<WorkerRatingsData>("/workers/ratings", workerRatingsFallback);
}

export function getWorkerSettingsData() {
  return fetchApiData<WorkerSettingsData>("/workers/settings", workerSettingsFallback);
}

export function getAdminClientsData() {
  return fetchApiData<AdminClientsData>("/admin/clients", adminClientsFallback);
}

export function getAdminRequestsData() {
  return fetchApiData<AdminRequestsData>("/admin/requests", adminRequestsFallback);
}

export function getAdminFinanceData() {
  return fetchApiData<AdminFinanceData>("/admin/finance", adminFinanceFallback);
}

export function getAdminSettingsData() {
  return fetchApiData<AdminSettingsData>("/admin/settings", adminSettingsFallback);
}
