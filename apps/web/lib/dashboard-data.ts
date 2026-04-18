import { fetchApiData } from "./api";

export type DashboardServiceCode =
  | "electricalRepair"
  | "kitchenPlumbing"
  | "acMaintenance"
  | "electricalInspection"
  | "paintingRefresh"
  | "livingRoomPainting"
  | "ceilingFanInstallation"
  | "heaterMaintenance"
  | "faucetInstallation";

export type DashboardAreaCode = "newCairo" | "nasrCity" | "maadi";

export type DashboardWorkerSpecialtyCode = "acTechnician" | "electrician" | "plumber";

export type DashboardRequestStatus = "WORKER_EN_ROUTE" | "IN_PROGRESS";

export type DashboardVerificationStatus = "UNDER_REVIEW" | "DOCUMENTS_SUBMITTED" | "AWAITING_ID";

export type DashboardAlertCode =
  | "complaintsUnderInvestigation"
  | "escrowApprovalsNeedReview"
  | "workersReadyForActivation";

export type DashboardDayCode = "saturday" | "sunday" | "monday" | "tuesday";

export interface ClientDashboardData {
  summary: {
    totalRequests: number;
    totalRequestsDelta: number;
    activeRequests: number;
    enRouteCount: number;
    activeWarranties: number;
    walletBalance: number;
  };
  activeRequests: Array<{
    id: string;
    service: DashboardServiceCode;
    workerName: string;
    status: DashboardRequestStatus;
    etaMinutes?: number;
    onSite?: boolean;
    area: DashboardAreaCode;
  }>;
  suggestedServices: DashboardServiceCode[];
  recentCompleted: Array<{
    id: string;
    service: DashboardServiceCode;
    completedDaysAgo: number;
  }>;
  favoriteWorkers: Array<{
    id: string;
    name: string;
    specialty: DashboardWorkerSpecialtyCode;
    rating: number;
  }>;
}

export interface WorkerDashboardData {
  summary: {
    incomingRequests: number;
    incomingDelta: number;
    activeJobs: number;
    enRouteCount: number;
    monthlyEarnings: number;
    monthlyGrowth: number;
    rating: number;
    ratingCount: number;
    orderQuota: number;
    trialExpiresAt?: string;
  };
  queue: Array<{
    id: string;
    service: DashboardServiceCode;
    area: DashboardAreaCode;
    budgetMin: number;
    budgetMax: number;
    freshness: "TODAY";
  }>;
  weeklyLoad: Array<{
    day: DashboardDayCode;
    value: number;
    tone?: "dark";
  }>;
  earningsPulse: {
    today: number;
    week: number;
    revenue: number;
    satisfaction: number;
  };
  performance: {
    responseMinutes: number;
    completionRate: number;
    acceptanceRate: number;
    repeatClients: number;
  };
}

export interface AdminDashboardData {
  summary: {
    totalRevenue: number;
    revenueGrowth: number;
    pendingVerifications: number;
    highPriorityVerifications: number;
    openComplaints: number;
    underInvestigation: number;
    activeRequests: number;
    requestsDelta: number;
  };
  verificationQueue: Array<{
    id: string;
    name: string;
    specialty: DashboardWorkerSpecialtyCode;
    status: DashboardVerificationStatus;
    submittedAt: string;
  }>;
  alerts: DashboardAlertCode[];
  financePulse: {
    commissions: number;
    escrowHeld: number;
    releasedThisWeek: number;
    refundPressure: number;
  };
  operationalMix: {
    clientsCount: number;
    workersCount: number;
    walletFlow: number;
    qualityScore: number;
  };
}

const clientDashboardFallback: ClientDashboardData = {
  summary: {
    totalRequests: 0,
    totalRequestsDelta: 0,
    activeRequests: 0,
    enRouteCount: 0,
    activeWarranties: 0,
    walletBalance: 0
  },
  activeRequests: [],
  suggestedServices: [],
  recentCompleted: [],
  favoriteWorkers: []
};

const workerDashboardFallback: WorkerDashboardData = {
  summary: {
    incomingRequests: 0,
    incomingDelta: 0,
    activeJobs: 0,
    enRouteCount: 0,
    monthlyEarnings: 0,
    monthlyGrowth: 0,
    rating: 0,
    ratingCount: 0,
    orderQuota: 0
  },
  queue: [],
  weeklyLoad: [],
  earningsPulse: {
    today: 0,
    week: 0,
    revenue: 0,
    satisfaction: 0
  },
  performance: {
    responseMinutes: 0,
    completionRate: 0,
    acceptanceRate: 0,
    repeatClients: 0
  }
};

const adminDashboardFallback: AdminDashboardData = {
  summary: {
    totalRevenue: 0,
    revenueGrowth: 0,
    pendingVerifications: 0,
    highPriorityVerifications: 0,
    openComplaints: 0,
    underInvestigation: 0,
    activeRequests: 0,
    requestsDelta: 0
  },
  verificationQueue: [],
  alerts: [],
  financePulse: {
    commissions: 0,
    escrowHeld: 0,
    releasedThisWeek: 0,
    refundPressure: 0
  },
  operationalMix: {
    clientsCount: 0,
    workersCount: 0,
    walletFlow: 0,
    qualityScore: 0
  }
};

export function getClientDashboardData() {
  return fetchApiData<ClientDashboardData>("/clients/dashboard", clientDashboardFallback);
}

export function getWorkerDashboardData() {
  return fetchApiData<WorkerDashboardData>("/workers/dashboard", workerDashboardFallback);
}

export function getAdminDashboardData() {
  return fetchApiData<AdminDashboardData>("/admin/dashboard", adminDashboardFallback);
}
