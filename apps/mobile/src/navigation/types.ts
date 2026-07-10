export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Otp: { phone?: string } | undefined;
};

export type CommonStackParamList = {
  Chat: undefined;
  RequestDetails: { requestId?: string } | undefined;
  Notifications: undefined;
  WorkerProfile: { workerId: string };
  VendorProfile: { vendorId: string };
  CreateRequest: {
    categoryId?: string;
    categorySlug?: string;
    categoryNameAr?: string;
    workerId?: string;
    workerName?: string;
    title?: string;
    description?: string;
  } | undefined;
  Support: undefined;
};
