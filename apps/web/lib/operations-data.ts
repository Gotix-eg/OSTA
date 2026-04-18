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
  today: 0,
  week: 0,
  month: 0,
  pendingWithdrawal: 0,
  growth: 0,
  chart: [],
  payouts: [],
  transactions: []
};

const clientRequestsFallback: ClientRequestListItem[] = [];

const clientRequestDetailFallback: ClientRequestDetailData = {
  id: "",
  requestNumber: "",
  categoryId: "electrical",
  serviceId: "electrical-emergency",
  title: "",
  description: "",
  mediaNotes: "",
  address: {
    mode: "new"
  },
  timing: {
    type: "today"
  },
  status: "PENDING",
  area: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const clientFavoritesFallback: ClientFavoritesData = {
  summary: {
    totalFavorites: 0,
    onlineNow: 0,
    avgRating: 0
  },
  workers: []
};

const clientWalletFallback: ClientWalletData = {
  balance: 0,
  currency: "EGP",
  spendThisMonth: 0,
  pendingRefunds: 0,
  paymentMethods: [],
  recentTransactions: []
};

const clientSettingsFallback: ClientSettingsData = {
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  },
  preferences: {
    language: "ar",
    notificationsBySms: true,
    notificationsByEmail: true,
    marketingUpdates: false
  },
  addresses: []
};

const pendingWorkersFallback: PendingWorkersData = {
  summary: {
    totalPending: 0,
    highPriority: 0,
    submittedToday: 0,
    averageReviewHours: 0
  },
  workers: []
};

const workerIncomingRequestsFallback: WorkerIncomingRequestsData = {
  summary: {
    availableNow: 0,
    sameDay: 0,
    emergency: 0,
    averageBudget: 0
  },
  requests: []
};

const workerActiveRequestsFallback: WorkerActiveRequestsData = {
  summary: {
    activeJobs: 0,
    enRoute: 0,
    onSite: 0,
    wrapUp: 0
  },
  requests: []
};

const workerRatingsFallback: WorkerRatingsData = {
  summary: {
    overallRating: 0,
    totalReviews: 0,
    repeatClientsRate: 0,
    fiveStars: 0
  },
  badges: [],
  reviews: []
};

const workerSettingsFallback: WorkerSettingsData = {
  profile: {
    firstName: "",
    lastName: "",
    phone: "",
    email: ""
  },
  workPreferences: {
    isAvailable: false,
    acceptsEmergency: false,
    acceptsSameDay: false,
    serviceAreas: []
  },
  payout: {
    method: "",
    schedule: "",
    bankLabel: ""
  }
};

const adminClientsFallback: AdminClientsData = {
  summary: {
    totalClients: 0,
    activeThisWeek: 0,
    vipClients: 0,
    averageRating: 0
  },
  clients: []
};

const adminRequestsFallback: AdminRequestsData = {
  summary: {
    active: 0,
    completedToday: 0,
    disputed: 0,
    averageTicket: 0
  },
  requests: []
};

const adminFinanceFallback: AdminFinanceData = {
  summary: {
    totalRevenue: 0,
    commissions: 0,
    escrowHeld: 0,
    releasedThisWeek: 0
  },
  streams: [],
  payouts: []
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
