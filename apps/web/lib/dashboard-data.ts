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
    totalRequests: 28,
    totalRequestsDelta: 4,
    activeRequests: 3,
    enRouteCount: 1,
    activeWarranties: 2,
    walletBalance: 860
  },
  activeRequests: [
    {
      id: "req-101",
      service: "electricalRepair",
      workerName: "Youssef El-Sharif",
      status: "WORKER_EN_ROUTE",
      etaMinutes: 18,
      area: "newCairo"
    },
    {
      id: "req-102",
      service: "kitchenPlumbing",
      workerName: "Mostafa Adel",
      status: "IN_PROGRESS",
      onSite: true,
      area: "maadi"
    }
  ],
  suggestedServices: ["acMaintenance", "electricalInspection", "paintingRefresh"],
  recentCompleted: [
    { id: "req-201", service: "livingRoomPainting", completedDaysAgo: 1 },
    { id: "req-202", service: "ceilingFanInstallation", completedDaysAgo: 3 },
    { id: "req-203", service: "heaterMaintenance", completedDaysAgo: 7 }
  ],
  favoriteWorkers: [
    { id: "worker-1", name: "Ahmed Fawzy", specialty: "acTechnician", rating: 4.9 },
    { id: "worker-2", name: "Youssef El-Sharif", specialty: "electrician", rating: 4.9 },
    { id: "worker-3", name: "Mostafa Adel", specialty: "plumber", rating: 4.8 }
  ]
};

const workerDashboardFallback: WorkerDashboardData = {
  summary: {
    incomingRequests: 8,
    incomingDelta: 2,
    activeJobs: 4,
    enRouteCount: 2,
    monthlyEarnings: 11240,
    monthlyGrowth: 18,
    rating: 4.9,
    ratingCount: 312
  },
  queue: [
    { id: "offer-1", service: "acMaintenance", area: "newCairo", budgetMin: 350, budgetMax: 450, freshness: "TODAY" },
    { id: "offer-2", service: "electricalInspection", area: "nasrCity", budgetMin: 250, budgetMax: 320, freshness: "TODAY" },
    { id: "offer-3", service: "faucetInstallation", area: "maadi", budgetMin: 220, budgetMax: 280, freshness: "TODAY" }
  ],
  weeklyLoad: [
    { day: "saturday", value: 90 },
    { day: "sunday", value: 70, tone: "dark" },
    { day: "monday", value: 82 },
    { day: "tuesday", value: 64, tone: "dark" }
  ],
  earningsPulse: {
    today: 46,
    week: 78,
    revenue: 88,
    satisfaction: 96
  },
  performance: {
    responseMinutes: 5,
    completionRate: 98,
    acceptanceRate: 96,
    repeatClients: 41
  }
};

const adminDashboardFallback: AdminDashboardData = {
  summary: {
    totalRevenue: 684000,
    revenueGrowth: 12,
    pendingVerifications: 43,
    highPriorityVerifications: 13,
    openComplaints: 12,
    underInvestigation: 4,
    activeRequests: 186,
    requestsDelta: 21
  },
  verificationQueue: [
    { id: "worker-18", name: "Mahmoud Saber", specialty: "plumber", status: "UNDER_REVIEW", submittedAt: "2026-03-27" },
    { id: "worker-19", name: "Ali Nader", specialty: "electrician", status: "DOCUMENTS_SUBMITTED", submittedAt: "2026-03-27" },
    { id: "worker-20", name: "Khaled Amin", specialty: "acTechnician", status: "AWAITING_ID", submittedAt: "2026-03-28" }
  ],
  alerts: ["complaintsUnderInvestigation", "escrowApprovalsNeedReview", "workersReadyForActivation"],
  financePulse: {
    commissions: 68,
    escrowHeld: 81,
    releasedThisWeek: 52,
    refundPressure: 14
  },
  operationalMix: {
    clientsCount: 14200,
    workersCount: 5100,
    walletFlow: 274000,
    qualityScore: 96
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
