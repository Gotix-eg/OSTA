=============================================================
PROJECT: OSTA (أُسطى) — Uber for Skilled Workers Platform
FULL-STACK WEB APPLICATION — COMPLETE BUILD
=============================================================

You are a senior full-stack developer building a production-ready
platform called "OSTA" (أُسطى). This is an "Uber for Handymen/
Skilled Workers" platform that connects homeowners with verified
skilled workers (electricians, plumbers, carpenters, etc.) with
a full security verification system, escrow payments, and rights
protection for both parties.

The platform supports Arabic (RTL) as the primary language and
English as secondary. It must be fully responsive, mobile-first,
and follow the Golden Ratio design principles.

=============================================================
PHASE 1: PROJECT SETUP & ARCHITECTURE
=============================================================

TECH STACK:
-----------
Frontend:
  - Next.js 14+ (App Router)
  - TypeScript (strict mode)
  - Tailwind CSS 3+
  - Shadcn/UI component library
  - Framer Motion (animations)
  - React Hook Form + Zod (form validation)
  - Zustand (state management)
  - Socket.io-client (real-time)
  - Leaflet or Google Maps (maps)
  - Chart.js or Recharts (dashboard charts)
  - next-intl (i18n — Arabic RTL + English LTR)
  - Lucide React (icons)
  - Swiper (carousels)
  - React Dropzone (file uploads)

Backend:
  - Node.js + Express.js (or Fastify)
  - TypeScript
  - Prisma ORM
  - PostgreSQL (primary database)
  - Redis (caching + sessions + rate limiting)
  - Socket.io (real-time communication)
  - JWT + Refresh Tokens (authentication)
  - Multer + Sharp (image upload + processing)
  - Nodemailer (emails)
  - Twilio or Firebase (OTP/SMS)
  - Stripe or Paymob (payment gateway)
  - Bull/BullMQ (job queues)
  - Winston (logging)
  - Helmet + CORS + Rate Limiter (security)
  - Jest + Supertest (testing)

DevOps:
  - Docker + Docker Compose
  - GitHub Actions (CI/CD)
  - AWS S3 (file storage)
  - Nginx (reverse proxy)

PROJECT STRUCTURE:
------------------
osta/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── (public)/
│   │   │   │   │   ├── page.tsx              # Landing page
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── how-it-works/
│   │   │   │   │   ├── about/
│   │   │   │   │   ├── contact/
│   │   │   │   │   ├── faq/
│   │   │   │   │   ├── terms/
│   │   │   │   │   └── privacy/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   │   ├── client/
│   │   │   │   │   │   └── worker/
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   ├── reset-password/
│   │   │   │   │   └── verify-otp/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── client/
│   │   │   │   │   │   ├── page.tsx           # Client home
│   │   │   │   │   │   ├── new-request/
│   │   │   │   │   │   ├── my-requests/
│   │   │   │   │   │   ├── request/[id]/
│   │   │   │   │   │   ├── favorites/
│   │   │   │   │   │   ├── wallet/
│   │   │   │   │   │   ├── warranties/
│   │   │   │   │   │   ├── complaints/
│   │   │   │   │   │   ├── messages/
│   │   │   │   │   │   ├── notifications/
│   │   │   │   │   │   └── settings/
│   │   │   │   │   ├── worker/
│   │   │   │   │   │   ├── page.tsx           # Worker home
│   │   │   │   │   │   ├── requests/
│   │   │   │   │   │   │   ├── incoming/
│   │   │   │   │   │   │   ├── active/
│   │   │   │   │   │   │   └── history/
│   │   │   │   │   │   ├── earnings/
│   │   │   │   │   │   ├── ratings/
│   │   │   │   │   │   ├── portfolio/
│   │   │   │   │   │   ├── schedule/
│   │   │   │   │   │   ├── stats/
│   │   │   │   │   │   ├── training/
│   │   │   │   │   │   ├── messages/
│   │   │   │   │   │   ├── notifications/
│   │   │   │   │   │   └── settings/
│   │   │   │   │   │       ├── profile/
│   │   │   │   │   │       ├── documents/
│   │   │   │   │   │       ├── work-areas/
│   │   │   │   │   │       ├── specializations/
│   │   │   │   │   │       └── bank-account/
│   │   │   │   │   └── admin/
│   │   │   │   │       ├── page.tsx           # Admin overview
│   │   │   │   │       ├── workers/
│   │   │   │   │       │   ├── page.tsx       # All workers
│   │   │   │   │       │   ├── pending/       # Pending verification
│   │   │   │   │       │   ├── [id]/          # Worker details
│   │   │   │   │       │   └── verification/[id]/
│   │   │   │   │       ├── clients/
│   │   │   │   │       ├── requests/
│   │   │   │   │       ├── complaints/
│   │   │   │   │       ├── finance/
│   │   │   │   │       │   ├── revenue/
│   │   │   │   │       │   ├── commissions/
│   │   │   │   │       │   ├── escrow/
│   │   │   │   │       │   ├── withdrawals/
│   │   │   │   │       │   └── reports/
│   │   │   │   │       ├── categories/
│   │   │   │   │       ├── areas/
│   │   │   │   │       ├── promotions/
│   │   │   │   │       ├── analytics/
│   │   │   │   │       ├── content/
│   │   │   │   │       ├── notifications/
│   │   │   │   │       ├── support/
│   │   │   │   │       └── settings/
│   │   │   │   └── worker-profile/[id]/       # Public worker profile
│   │   │   ├── api/                           # API routes (if needed)
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── ClientLayout.tsx
│   │   │   │   ├── WorkerLayout.tsx
│   │   │   │   └── AdminLayout.tsx
│   │   │   ├── landing/
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── TrustBar.tsx
│   │   │   │   ├── ServicesGrid.tsx
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   ├── WhyOsta.tsx
│   │   │   │   ├── Testimonials.tsx
│   │   │   │   ├── JoinAsWorker.tsx
│   │   │   │   ├── DownloadApp.tsx
│   │   │   │   └── FAQ.tsx
│   │   │   ├── auth/
│   │   │   ├── client/
│   │   │   ├── worker/
│   │   │   ├── admin/
│   │   │   ├── shared/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── ServiceCard.tsx
│   │   │   │   ├── WorkerCard.tsx
│   │   │   │   ├── RequestCard.tsx
│   │   │   │   ├── RatingStars.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── PriceTag.tsx
│   │   │   │   ├── ImageUploader.tsx
│   │   │   │   ├── MapComponent.tsx
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── LoadingSkeleton.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   └── FileUpload.tsx
│   │   │   └── charts/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useGeolocation.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   └── useMediaQuery.ts
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios instance
│   │   │   ├── socket.ts
│   │   │   ├── utils.ts
│   │   │   ├── constants.ts
│   │   │   ├── validations.ts
│   │   │   └── formatters.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── notificationStore.ts
│   │   │   └── chatStore.ts
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── request.ts
│   │   │   ├── service.ts
│   │   │   ├── payment.ts
│   │   │   ├── review.ts
│   │   │   └── api.ts
│   │   ├── messages/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   ├── public/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   ├── tailwind.config.ts
│   │   ├── next.config.js
│   │   └── middleware.ts         # Auth + locale middleware
│   │
│   └── server/                   # Express.js Backend
│       ├── src/
│       │   ├── index.ts
│       │   ├── app.ts
│       │   ├── config/
│       │   │   ├── database.ts
│       │   │   ├── redis.ts
│       │   │   ├── socket.ts
│       │   │   ├── multer.ts
│       │   │   ├── email.ts
│       │   │   └── env.ts
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.middleware.ts
│       │   │   │   ├── auth.validation.ts
│       │   │   │   └── strategies/
│       │   │   │       ├── jwt.strategy.ts
│       │   │   │       └── otp.strategy.ts
│       │   │   ├── users/
│       │   │   │   ├── users.controller.ts
│       │   │   │   ├── users.service.ts
│       │   │   │   ├── users.routes.ts
│       │   │   │   └── users.validation.ts
│       │   │   ├── workers/
│       │   │   │   ├── workers.controller.ts
│       │   │   │   ├── workers.service.ts
│       │   │   │   ├── workers.routes.ts
│       │   │   │   └── workers.validation.ts
│       │   │   ├── clients/
│       │   │   │   ├── clients.controller.ts
│       │   │   │   ├── clients.service.ts
│       │   │   │   ├── clients.routes.ts
│       │   │   │   └── clients.validation.ts
│       │   │   ├── services/
│       │   │   │   ├── services.controller.ts
│       │   │   │   ├── services.service.ts
│       │   │   │   ├── services.routes.ts
│       │   │   │   └── services.validation.ts
│       │   │   ├── requests/
│       │   │   │   ├── requests.controller.ts
│       │   │   │   ├── requests.service.ts
│       │   │   │   ├── requests.routes.ts
│       │   │   │   └── requests.validation.ts
│       │   │   ├── payments/
│       │   │   │   ├── payments.controller.ts
│       │   │   │   ├── payments.service.ts
│       │   │   │   ├── payments.routes.ts
│       │   │   │   ├── escrow.service.ts
│       │   │   │   └── payments.validation.ts
│       │   │   ├── reviews/
│       │   │   │   ├── reviews.controller.ts
│       │   │   │   ├── reviews.service.ts
│       │   │   │   ├── reviews.routes.ts
│       │   │   │   └── reviews.validation.ts
│       │   │   ├── complaints/
│       │   │   │   ├── complaints.controller.ts
│       │   │   │   ├── complaints.service.ts
│       │   │   │   ├── complaints.routes.ts
│       │   │   │   └── complaints.validation.ts
│       │   │   ├── chat/
│       │   │   │   ├── chat.controller.ts
│       │   │   │   ├── chat.service.ts
│       │   │   │   ├── chat.routes.ts
│       │   │   │   └── chat.gateway.ts
│       │   │   ├── notifications/
│       │   │   │   ├── notifications.controller.ts
│       │   │   │   ├── notifications.service.ts
│       │   │   │   ├── notifications.routes.ts
│       │   │   │   └── push.service.ts
│       │   │   ├── verification/
│       │   │   │   ├── verification.controller.ts
│       │   │   │   ├── verification.service.ts
│       │   │   │   ├── verification.routes.ts
│       │   │   │   └── ocr.service.ts
│       │   │   ├── admin/
│       │   │   │   ├── admin.controller.ts
│       │   │   │   ├── admin.service.ts
│       │   │   │   ├── admin.routes.ts
│       │   │   │   └── analytics.service.ts
│       │   │   ├── upload/
│       │   │   │   ├── upload.controller.ts
│       │   │   │   ├── upload.service.ts
│       │   │   │   └── upload.routes.ts
│       │   │   └── promotions/
│       │   │       ├── promotions.controller.ts
│       │   │       ├── promotions.service.ts
│       │   │       └── promotions.routes.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── role.middleware.ts
│       │   │   ├── rateLimiter.middleware.ts
│       │   │   ├── validation.middleware.ts
│       │   │   ├── upload.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   └── logger.middleware.ts
│       │   ├── utils/
│       │   │   ├── ApiError.ts
│       │   │   ├── ApiResponse.ts
│       │   │   ├── asyncHandler.ts
│       │   │   ├── helpers.ts
│       │   │   ├── constants.ts
│       │   │   └── emailTemplates.ts
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── jobs/
│       │       ├── queue.ts
│       │       ├── emailJob.ts
│       │       ├── notificationJob.ts
│       │       └── payoutJob.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       ├── tests/
│       ├── Dockerfile
│       └── tsconfig.json
│
├── packages/
│   └── shared/
│       ├── types/
│       ├── constants/
│       └── validations/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── package.json


=============================================================
PHASE 2: DATABASE SCHEMA (Prisma)
=============================================================

Create file: prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum UserRole {
  CLIENT
  WORKER
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  BANNED
}

enum WorkerVerificationStatus {
  PENDING
  DOCUMENTS_SUBMITTED
  UNDER_REVIEW
  VERIFIED
  REJECTED
  SUSPENDED
  BANNED
}

enum WorkerLevel {
  NEW
  ACTIVE
  PROFESSIONAL
  EXPERT
  DIAMOND
}

enum RequestStatus {
  PENDING
  ACCEPTED
  WORKER_EN_ROUTE
  IN_PROGRESS
  COMPLETED
  CONFIRMED_BY_CLIENT
  CANCELLED_BY_CLIENT
  CANCELLED_BY_WORKER
  DISPUTED
}

enum RequestUrgency {
  NORMAL
  SAME_DAY
  URGENT
  EMERGENCY
}

enum PaymentStatus {
  PENDING
  HELD_IN_ESCROW
  RELEASED
  REFUNDED
  PARTIALLY_REFUNDED
  FAILED
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  MOBILE_WALLET
  BANK_TRANSFER
  CASH
  WALLET_BALANCE
}

enum ComplaintStatus {
  OPEN
  UNDER_INVESTIGATION
  RESOLVED
  ESCALATED
  CLOSED
}

enum ComplaintType {
  QUALITY_ISSUE
  LATE_ARRIVAL
  NO_SHOW
  OVERCHARGE
  DAMAGE
  THEFT
  MISCONDUCT
  PAYMENT_ISSUE
  OTHER
}

enum NotificationType {
  REQUEST_NEW
  REQUEST_ACCEPTED
  REQUEST_CANCELLED
  WORKER_EN_ROUTE
  WORKER_ARRIVED
  WORK_COMPLETED
  PAYMENT_RECEIVED
  PAYMENT_RELEASED
  REVIEW_RECEIVED
  COMPLAINT_UPDATE
  VERIFICATION_UPDATE
  PROMOTION
  SYSTEM
}

enum WarrantyStatus {
  ACTIVE
  CLAIMED
  EXPIRED
  VOID
}

// ==================== MODELS ====================

model User {
  id                String      @id @default(cuid())
  email             String?     @unique
  phone             String      @unique
  passwordHash      String
  role              UserRole    @default(CLIENT)
  status            UserStatus  @default(ACTIVE)
  firstName         String
  lastName          String
  avatarUrl         String?
  dateOfBirth       DateTime?
  emailVerified     Boolean     @default(false)
  phoneVerified     Boolean     @default(true)
  preferredLanguage String      @default("ar")
  lastLoginAt       DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  clientProfile     ClientProfile?
  workerProfile     WorkerProfile?
  addresses         Address[]
  sentMessages      Message[]         @relation("SentMessages")
  receivedMessages  Message[]         @relation("ReceivedMessages")
  notifications     Notification[]
  reviews           Review[]          @relation("ReviewAuthor")
  receivedReviews   Review[]          @relation("ReviewTarget")
  complaints        Complaint[]       @relation("ComplaintAuthor")
  complaintsAgainst Complaint[]       @relation("ComplaintTarget")
  sessions          Session[]
  otpCodes          OtpCode[]
  walletTransactions WalletTransaction[]

  @@index([phone])
  @@index([email])
  @@index([role])
  @@index([status])
}

model ClientProfile {
  id                String    @id @default(cuid())
  userId            String    @unique
  totalRequests     Int       @default(0)
  cancelledRequests Int       @default(0)
  walletBalance     Float     @default(0)
  rating            Float     @default(5.0)
  ratingCount       Int       @default(0)
  isVip             Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  requests          ServiceRequest[]
  favoriteWorkers   FavoriteWorker[]
}

model WorkerProfile {
  id                    String                    @id @default(cuid())
  userId                String                    @unique
  nationalIdFront       String?
  nationalIdBack        String?
  selfieWithId          String?
  nationalIdNumber      String?                   @unique
  criminalRecord        String?
  verificationStatus    WorkerVerificationStatus  @default(PENDING)
  verificationNotes     String?
  verifiedAt            DateTime?
  verifiedBy            String?
  level                 WorkerLevel               @default(NEW)
  yearsOfExperience     Int                       @default(0)
  bio                   String?
  rating                Float                     @default(0)
  ratingCount           Int                       @default(0)
  totalJobsCompleted    Int                       @default(0)
  totalEarnings         Float                     @default(0)
  walletBalance         Float                     @default(0)
  commissionRate        Float                     @default(15)
  isAvailable           Boolean                   @default(false)
  isOnline              Boolean                   @default(false)
  lastLocationLat       Float?
  lastLocationLng       Float?
  lastLocationUpdatedAt DateTime?
  guarantorName         String?
  guarantorPhone        String?
  utilityBillUrl        String?
  subscriptionTier      String                    @default("free")
  subscriptionExpiresAt DateTime?
  monthlyRequestLimit   Int                       @default(5)
  requestsThisMonth     Int                       @default(0)
  acceptanceRate        Float                     @default(100)
  avgResponseTime       Int                       @default(0)
  createdAt             DateTime                  @default(now())
  updatedAt             DateTime                  @updatedAt

  // Relations
  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  specializations       WorkerSpecialization[]
  workAreas             WorkerArea[]
  workSchedule          WorkSchedule[]
  portfolio             PortfolioItem[]
  requests              ServiceRequest[]    @relation("AssignedWorker")
  requestOffers         RequestOffer[]
  badges                WorkerBadge[]
  bankAccount           BankAccount?
  tools                 WorkerTool[]

  @@index([verificationStatus])
  @@index([isAvailable])
  @@index([level])
  @@index([rating])
}

model ServiceCategory {
  id          String    @id @default(cuid())
  nameAr      String
  nameEn      String
  slug        String    @unique
  description String?
  icon        String?
  imageUrl    String?
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  services    Service[]
}

model Service {
  id              String    @id @default(cuid())
  categoryId      String
  nameAr          String
  nameEn          String
  slug            String    @unique
  descriptionAr   String?
  descriptionEn   String?
  icon            String?
  imageUrl        String?
  basePriceMin    Float?
  basePriceMax    Float?
  estimatedTime   String?
  warrantyDays    Int       @default(7)
  isActive        Boolean   @default(true)
  sortOrder       Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  category        ServiceCategory     @relation(fields: [categoryId], references: [id])
  requests        ServiceRequest[]
  specializations WorkerSpecialization[]

  @@index([categoryId])
  @@index([slug])
}

model Address {
  id            String    @id @default(cuid())
  userId        String
  label         String    @default("Home")
  governorate   String
  city          String
  area          String
  street        String
  building      String?
  floor         String?
  apartment     String?
  landmark      String?
  latitude      Float?
  longitude     Float?
  isDefault     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  requests      ServiceRequest[]

  @@index([userId])
}

model ServiceRequest {
  id                String          @id @default(cuid())
  requestNumber     String          @unique @default(cuid())
  clientId          String
  workerId          String?
  serviceId         String
  addressId         String
  status            RequestStatus   @default(PENDING)
  urgency           RequestUrgency  @default(NORMAL)
  title             String
  description       String
  images            String[]
  voiceNote         String?
  videoUrl          String?
  preferredDate     DateTime?
  preferredTimeSlot String?
  estimatedPrice    Float?
  finalPrice        Float?
  clientNotes       String?
  workerNotes       String?
  beforeImages      String[]
  afterImages       String[]
  startedAt         DateTime?
  completedAt       DateTime?
  confirmedAt       DateTime?
  cancelledAt       DateTime?
  cancelReason      String?
  cancellationFee   Float?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  client            ClientProfile   @relation(fields: [clientId], references: [id])
  worker            WorkerProfile?  @relation("AssignedWorker", fields: [workerId], references: [id])
  service           Service         @relation(fields: [serviceId], references: [id])
  address           Address         @relation(fields: [addressId], references: [id])
  offers            RequestOffer[]
  payment           Payment?
  review            Review?
  warranty          Warranty?
  complaints        Complaint[]
  statusHistory     RequestStatusHistory[]
  invoice           Invoice?

  @@index([clientId])
  @@index([workerId])
  @@index([status])
  @@index([serviceId])
  @@index([createdAt])
}

model RequestOffer {
  id            String    @id @default(cuid())
  requestId     String
  workerId      String
  price         Float
  estimatedTime String?
  message       String?
  isAccepted    Boolean   @default(false)
  expiresAt     DateTime?
  createdAt     DateTime  @default(now())

  // Relations
  request       ServiceRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade)
  worker        WorkerProfile   @relation(fields: [workerId], references: [id])

  @@unique([requestId, workerId])
  @@index([requestId])
  @@index([workerId])
}

model RequestStatusHistory {
  id          String        @id @default(cuid())
  requestId   String
  fromStatus  RequestStatus?
  toStatus    RequestStatus
  changedBy   String?
  note        String?
  createdAt   DateTime      @default(now())

  // Relations
  request     ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@index([requestId])
}

model Payment {
  id                String          @id @default(cuid())
  requestId         String          @unique
  transactionId     String?         @unique
  amount            Float
  commissionAmount  Float           @default(0)
  workerAmount      Float           @default(0)
  currency          String          @default("EGP")
  method            PaymentMethod
  status            PaymentStatus   @default(PENDING)
  escrowHeldAt      DateTime?
  escrowReleasedAt  DateTime?
  refundedAt        DateTime?
  refundAmount      Float?
  refundReason      String?
  gatewayResponse   Json?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  request           ServiceRequest  @relation(fields: [requestId], references: [id])

  @@index([status])
  @@index([createdAt])
}

model Review {
  id                String    @id @default(cuid())
  requestId         String    @unique
  authorId          String
  targetId          String
  overallRating     Float
  qualityRating     Float?
  punctualityRating Float?
  behaviorRating    Float?
  cleanlinessRating Float?
  comment           String?
  images            String[]
  isVisible         Boolean   @default(true)
  adminNote         String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  request           ServiceRequest @relation(fields: [requestId], references: [id])
  author            User          @relation("ReviewAuthor", fields: [authorId], references: [id])
  target            User          @relation("ReviewTarget", fields: [targetId], references: [id])

  @@index([targetId])
  @@index([overallRating])
}

model Warranty {
  id            String          @id @default(cuid())
  requestId     String          @unique
  status        WarrantyStatus  @default(ACTIVE)
  warrantyDays  Int
  startsAt      DateTime
  expiresAt     DateTime
  claimedAt     DateTime?
  claimReason   String?
  resolvedAt    DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  // Relations
  request       ServiceRequest  @relation(fields: [requestId], references: [id])

  @@index([status])
  @@index([expiresAt])
}

model Complaint {
  id              String           @id @default(cuid())
  requestId       String
  authorId        String
  targetId        String
  type            ComplaintType
  status          ComplaintStatus  @default(OPEN)
  title           String
  description     String
  evidence        String[]
  adminResponse   String?
  resolution      String?
  compensationAmount Float?
  assignedTo      String?
  resolvedAt      DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  request         ServiceRequest   @relation(fields: [requestId], references: [id])
  author          User             @relation("ComplaintAuthor", fields: [authorId], references: [id])
  target          User             @relation("ComplaintTarget", fields: [targetId], references: [id])

  @@index([status])
  @@index([requestId])
}

model Invoice {
  id              String    @id @default(cuid())
  requestId       String    @unique
  invoiceNumber   String    @unique
  laborCost       Float
  materialsCost   Float     @default(0)
  additionalCosts Float     @default(0)
  subtotal        Float
  commission      Float
  tax             Float     @default(0)
  total           Float
  notes           String?
  materialsDetail Json?
  createdAt       DateTime  @default(now())

  // Relations
  request         ServiceRequest @relation(fields: [requestId], references: [id])
}

model WorkerSpecialization {
  id        String   @id @default(cuid())
  workerId  String
  serviceId String
  createdAt DateTime @default(now())

  // Relations
  worker    WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)
  service   Service       @relation(fields: [serviceId], references: [id])

  @@unique([workerId, serviceId])
}

model WorkerArea {
  id            String    @id @default(cuid())
  workerId      String
  governorate   String
  city          String
  area          String?
  createdAt     DateTime  @default(now())

  // Relations
  worker        WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)

  @@index([workerId])
  @@index([governorate, city])
}

model WorkSchedule {
  id          String    @id @default(cuid())
  workerId    String
  dayOfWeek   Int
  startTime   String
  endTime     String
  isAvailable Boolean   @default(true)

  // Relations
  worker      WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)

  @@unique([workerId, dayOfWeek])
}

model PortfolioItem {
  id          String    @id @default(cuid())
  workerId    String
  title       String
  description String?
  beforeImage String?
  afterImage  String?
  images      String[]
  serviceType String?
  createdAt   DateTime  @default(now())

  // Relations
  worker      WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)

  @@index([workerId])
}

model WorkerBadge {
  id        String    @id @default(cuid())
  workerId  String
  badge     String
  awardedAt DateTime  @default(now())

  // Relations
  worker    WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)

  @@unique([workerId, badge])
}

model WorkerTool {
  id        String    @id @default(cuid())
  workerId  String
  toolName  String
  createdAt DateTime  @default(now())

  // Relations
  worker    WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)

  @@index([workerId])
}

model BankAccount {
  id            String    @id @default(cuid())
  workerId      String    @unique
  bankName      String
  accountName   String
  accountNumber String
  iban          String?
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  worker        WorkerProfile @relation(fields: [workerId], references: [id], onDelete: Cascade)
}

model FavoriteWorker {
  id        String    @id @default(cuid())
  clientId  String
  workerId  String
  createdAt DateTime  @default(now())

  // Relations
  client    ClientProfile @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@unique([clientId, workerId])
}

model Message {
  id          String    @id @default(cuid())
  senderId    String
  receiverId  String
  requestId   String?
  content     String
  type        String    @default("text")
  attachments String[]
  isRead      Boolean   @default(false)
  readAt      DateTime?
  createdAt   DateTime  @default(now())

  // Relations
  sender      User @relation("SentMessages", fields: [senderId], references: [id])
  receiver    User @relation("ReceivedMessages", fields: [receiverId], references: [id])

  @@index([senderId, receiverId])
  @@index([requestId])
  @@index([createdAt])
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  data      Json?
  isRead    Boolean          @default(false)
  readAt    DateTime?
  createdAt DateTime         @default(now())

  // Relations
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

model WalletTransaction {
  id          String    @id @default(cuid())
  userId      String
  type        String
  amount      Float
  balance     Float
  description String?
  referenceId String?
  createdAt   DateTime  @default(now())

  // Relations
  user        User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([createdAt])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  userAgent    String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  // Relations
  user         User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model OtpCode {
  id        String   @id @default(cuid())
  userId    String
  code      String
  type      String
  expiresAt DateTime
  isUsed    Boolean  @default(false)
  createdAt DateTime @default(now())

  // Relations
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([code])
}

model Promotion {
  id            String    @id @default(cuid())
  code          String    @unique
  type          String
  value         Float
  maxUses       Int?
  usedCount     Int       @default(0)
  minOrderValue Float?
  maxDiscount   Float?
  validFrom     DateTime
  validTo       DateTime
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Area {
  id          String    @id @default(cuid())
  governorate String
  city        String
  area        String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  @@unique([governorate, city, area])
  @@index([governorate])
}

model SystemSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  type      String   @default("string")
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  entity      String
  entityId    String?
  oldData     Json?
  newData     Json?
  ipAddress   String?
  createdAt   DateTime @default(now())

  @@index([entity, entityId])
  @@index([userId])
  @@index([createdAt])
}


=============================================================
PHASE 3: BACKEND API ENDPOINTS
=============================================================

Build all these REST API endpoints with proper validation,
error handling, authentication, and authorization:

--- AUTH MODULE ---
POST   /api/auth/register/client
       Body: { firstName, lastName, phone, email?, password, confirmPassword }
       Response: { user, message: "OTP sent" }

POST   /api/auth/register/worker
       Body: { firstName, lastName, phone, email?, password, confirmPassword }
       Response: { user, message: "OTP sent" }

POST   /api/auth/verify-otp
       Body: { phone, code, type: "registration"|"login"|"reset" }
       Response: { accessToken, refreshToken, user }

POST   /api/auth/login
       Body: { phone, password }
       Response: { accessToken, refreshToken, user }

POST   /api/auth/refresh-token
       Body: { refreshToken }
       Response: { accessToken, refreshToken }

POST   /api/auth/forgot-password
       Body: { phone }
       Response: { message: "OTP sent" }

POST   /api/auth/reset-password
       Body: { phone, code, newPassword, confirmPassword }
       Response: { message: "Password reset successful" }

POST   /api/auth/logout
       Headers: Authorization: Bearer <token>
       Response: { message: "Logged out" }

GET    /api/auth/me
       Headers: Authorization: Bearer <token>
       Response: { user (with profile) }

--- USERS MODULE ---
GET    /api/users/profile
PUT    /api/users/profile
PATCH  /api/users/avatar
PUT    /api/users/change-password
DELETE /api/users/account

--- CLIENTS MODULE ---
GET    /api/clients/dashboard
GET    /api/clients/requests
GET    /api/clients/requests/:id
POST   /api/clients/requests
PUT    /api/clients/requests/:id
PATCH  /api/clients/requests/:id/cancel
PATCH  /api/clients/requests/:id/confirm
GET    /api/clients/favorites
POST   /api/clients/favorites/:workerId
DELETE /api/clients/favorites/:workerId
GET    /api/clients/wallet
GET    /api/clients/wallet/transactions
POST   /api/clients/wallet/topup
GET    /api/clients/warranties
GET    /api/clients/addresses
POST   /api/clients/addresses
PUT    /api/clients/addresses/:id
DELETE /api/clients/addresses/:id

--- WORKERS MODULE ---
GET    /api/workers/dashboard
PATCH  /api/workers/availability
PATCH  /api/workers/location
GET    /api/workers/requests/incoming
GET    /api/workers/requests/active
GET    /api/workers/requests/history
PATCH  /api/workers/requests/:id/accept
PATCH  /api/workers/requests/:id/reject
PATCH  /api/workers/requests/:id/start
PATCH  /api/workers/requests/:id/complete
POST   /api/workers/requests/:id/offer
GET    /api/workers/earnings
GET    /api/workers/earnings/summary
POST   /api/workers/earnings/withdraw
GET    /api/workers/ratings
GET    /api/workers/stats
GET    /api/workers/portfolio
POST   /api/workers/portfolio
DELETE /api/workers/portfolio/:id
GET    /api/workers/schedule
PUT    /api/workers/schedule
GET    /api/workers/badges
PUT    /api/workers/bank-account
PUT    /api/workers/work-areas
PUT    /api/workers/specializations

--- VERIFICATION MODULE ---
POST   /api/verification/national-id
       Body: FormData { frontImage, backImage, selfieImage }
POST   /api/verification/criminal-record
       Body: FormData { document }
POST   /api/verification/guarantor
       Body: { guarantorName, guarantorPhone }
POST   /api/verification/utility-bill
       Body: FormData { billImage }
GET    /api/verification/status

--- SERVICES MODULE ---
GET    /api/services/categories
GET    /api/services/categories/:slug
GET    /api/services
GET    /api/services/:slug
GET    /api/services/search?q=&category=&area=

--- WORKERS PUBLIC ---
GET    /api/workers/search?service=&area=&rating=&sort=
GET    /api/workers/:id/profile
GET    /api/workers/:id/reviews
GET    /api/workers/:id/portfolio
GET    /api/workers/nearby?lat=&lng=&service=&radius=

--- REVIEWS MODULE ---
POST   /api/reviews
       Body: { requestId, overallRating, qualityRating?,
               punctualityRating?, behaviorRating?,
               cleanlinessRating?, comment?, images? }
GET    /api/reviews/my-reviews
GET    /api/reviews/received

--- COMPLAINTS MODULE ---
POST   /api/complaints
       Body: { requestId, type, title, description, evidence[] }
GET    /api/complaints
GET    /api/complaints/:id
POST   /api/complaints/:id/respond

--- PAYMENTS MODULE ---
POST   /api/payments/initiate
       Body: { requestId, method, amount }
POST   /api/payments/webhook  (from payment gateway)
GET    /api/payments/history
GET    /api/payments/:id

--- CHAT MODULE ---
GET    /api/chat/conversations
GET    /api/chat/conversations/:userId/messages
POST   /api/chat/messages
       Body: { receiverId, content, type?, attachments? }
PATCH  /api/chat/messages/:id/read

--- NOTIFICATIONS MODULE ---
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id

--- PROMOTIONS MODULE ---
POST   /api/promotions/validate
       Body: { code, serviceId?, amount? }
GET    /api/promotions/active

--- ADMIN MODULE ---
GET    /api/admin/dashboard
GET    /api/admin/analytics
       Query: { period: "day"|"week"|"month"|"year", from?, to? }

// Workers Management
GET    /api/admin/workers
       Query: { status?, search?, page, limit, sort }
GET    /api/admin/workers/:id
GET    /api/admin/workers/pending
PATCH  /api/admin/workers/:id/verify
       Body: { status: "VERIFIED"|"REJECTED", notes? }
PATCH  /api/admin/workers/:id/suspend
PATCH  /api/admin/workers/:id/ban
PATCH  /api/admin/workers/:id/activate
PUT    /api/admin/workers/:id/commission

// Clients Management
GET    /api/admin/clients
GET    /api/admin/clients/:id
PATCH  /api/admin/clients/:id/suspend
PATCH  /api/admin/clients/:id/ban

// Requests Management
GET    /api/admin/requests
GET    /api/admin/requests/:id
GET    /api/admin/requests/stats

// Complaints Management
GET    /api/admin/complaints
GET    /api/admin/complaints/:id
PATCH  /api/admin/complaints/:id/assign
PATCH  /api/admin/complaints/:id/resolve
       Body: { resolution, compensationAmount? }
PATCH  /api/admin/complaints/:id/escalate

// Finance
GET    /api/admin/finance/revenue
GET    /api/admin/finance/commissions
GET    /api/admin/finance/escrow
GET    /api/admin/finance/withdrawals
PATCH  /api/admin/finance/withdrawals/:id/approve
PATCH  /api/admin/finance/withdrawals/:id/reject
GET    /api/admin/finance/reports
       Query: { type, from, to, format: "json"|"csv"|"pdf" }

// Categories & Services
POST   /api/admin/categories
PUT    /api/admin/categories/:id
DELETE /api/admin/categories/:id
POST   /api/admin/services
PUT    /api/admin/services/:id
DELETE /api/admin/services/:id

// Areas
GET    /api/admin/areas
POST   /api/admin/areas
PUT    /api/admin/areas/:id
DELETE /api/admin/areas/:id

// Promotions
GET    /api/admin/promotions
POST   /api/admin/promotions
PUT    /api/admin/promotions/:id
DELETE /api/admin/promotions/:id

// Content
GET    /api/admin/content/pages
PUT    /api/admin/content/pages/:slug
GET    /api/admin/content/faq
POST   /api/admin/content/faq
PUT    /api/admin/content/faq/:id
DELETE /api/admin/content/faq/:id

// Notifications
POST   /api/admin/notifications/broadcast
       Body: { target: "all"|"clients"|"workers", title, body }

// Settings
GET    /api/admin/settings
PUT    /api/admin/settings
GET    /api/admin/audit-logs

// Upload
POST   /api/upload/image
POST   /api/upload/document
POST   /api/upload/multiple


IMPORTANT BACKEND REQUIREMENTS:
- Every endpoint must have input validation using Zod
- Use proper HTTP status codes
- Standardized response format:
  { success: boolean, data?: any, message?: string,
    error?: string, pagination?: { page, limit, total, pages } }
- Rate limiting on sensitive endpoints (auth: 5/min, general: 100/min)
- Request logging with Winston
- All file uploads go to AWS S3 with signed URLs
- Implement cursor-based pagination for large lists
- Socket.io events for real-time:
  - "request:new" — notify nearby workers
  - "request:accepted" — notify client
  - "request:status" — status change updates
  - "worker:location" — live tracking
  - "message:new" — new chat message
  - "notification:new" — push notification
  - "worker:online" — online status


=============================================================
PHASE 4: DESIGN SYSTEM & STYLING
=============================================================

TAILWIND CONFIG — tailwind.config.ts:

const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',  // <-- MAIN PRIMARY
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        dark: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',  // <-- MAIN DARK
        },
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
      },
      // Golden Ratio spacing: 1.618
      fontSize: {
        'hero':    ['3rem',    { lineHeight: '1.2', fontWeight: '800' }],
        'h1':      ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2':      ['1.875rem',{ lineHeight: '1.35', fontWeight: '700' }],
        'h3':      ['1.5rem',  { lineHeight: '1.4', fontWeight: '600' }],
        'h4':      ['1.125rem',{ lineHeight: '1.5', fontWeight: '600' }],
        'body':    ['1rem',    { lineHeight: '1.6' }],
        'small':   ['0.875rem',{ lineHeight: '1.5' }],
        'xs':      ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        'golden-sm': '0.618rem',
        'golden':    '1rem',
        'golden-md': '1.618rem',
        'golden-lg': '2.618rem',
        'golden-xl': '4.236rem',
        'golden-2xl': '6.854rem',
      },
      borderRadius: {
        'golden': '0.618rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-gentle': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
}

GOLDEN RATIO LAYOUT RULES:
- Main content area: 61.8% width
- Sidebar: 38.2% width
- Section padding: Use Fibonacci (8, 13, 21, 34, 55, 89)
- Card aspect ratios: 1:1.618
- Image containers: 1:1.618 ratio
- Button padding: px=golden-md, py=golden-sm
- Grid gaps: golden-md (1.618rem)
- Section vertical spacing: golden-2xl (6.854rem)
- Border radius: golden (0.618rem)

COMPONENT DESIGN RULES:
- All cards: white bg, subtle shadow, rounded-golden, hover elevation
- Buttons: Primary=bg-primary-600 text-white rounded-lg
           hover:bg-primary-700, active:bg-primary-800
           Size lg: py-3 px-6, md: py-2 px-4, sm: py-1.5 px-3
- Inputs: border-dark-200, focus:ring-2 focus:ring-primary-500,
          rounded-lg, py-3 px-4
- RTL: Use logical properties (ps, pe, ms, me instead of pl, pr)
       text-start, text-end instead of text-left, text-right
- Dark section backgrounds: bg-dark-950 text-white
- Light section backgrounds: bg-white or bg-dark-50
- Section transitions: alternate between light and dark backgrounds
- All interactive elements must have focus-visible styles
- Transitions: transition-all duration-300 ease-in-out
- Shadows: shadow-sm for cards, shadow-md on hover, shadow-lg for modals
- Status colors:
  * Pending: yellow/amber
  * Active/In Progress: blue
  * Completed/Success: green
  * Cancelled/Error: red
  * Suspended: orange
  * Banned: dark red


=============================================================
PHASE 5: FRONTEND PAGES — DETAILED SPECIFICATIONS
=============================================================

--- LANDING PAGE (/) ---

Build an impressive, conversion-optimized landing page with
these sections IN ORDER:

1. HEADER (sticky, glassmorphism on scroll):
   - Logo "أُسطى | OSTA" (left on LTR, right on RTL)
   - Nav links: Home, Services, How It Works, Join as Worker, Contact
   - Language toggle (AR/EN)
   - CTA buttons: "Login" (outlined), "Get Started" (filled primary)
   - Mobile: hamburger menu with slide-in drawer
   - On scroll: header becomes smaller, adds backdrop-blur bg

2. HERO SECTION:
   - Split layout (Golden Ratio: 61.8% text, 38.2% visual)
   - Headline AR: "أُسطى في بيتك... بضغطة زر"
   - Headline EN: "Your Trusted Worker... One Click Away"
   - Subtitle: "Verified skilled workers at your doorstep.
                Your satisfaction is guaranteed."
   - PROMINENT SEARCH BAR:
     [🔍 What service do you need?  |  📍 Your area  |  Search]
     Dropdown suggestions as user types
   - Quick service buttons (icon + label):
     ⚡Electrician 🚿Plumber 🪵Carpenter ❄️AC Tech 🎨Painter
   - Background: subtle geometric pattern or animated dots
   - Hero image: illustration of worker with tools (or 3D render)
   - Floating badges: "✅ Verified Workers" "🛡️ Guaranteed"
   - Framer Motion: staggered fade-in animation for elements

3. TRUST BAR (numbers counter animation on scroll):
   - 5,000+ Verified Workers
   - 50,000+ Completed Services
   - 4.8★ Average Rating
   - 100% Satisfaction Guarantee
   - Background: primary-600, white text
   - Counter animation: numbers count up when scrolled into view

4. SERVICES GRID:
   - Section title: "Our Services" / "خدماتنا"
   - 3-column grid (responsive: 1 on mobile, 2 on tablet, 3 on desktop)
   - Each card: Icon + Service Name + "X workers available" + arrow
   - Hover: card lifts up, shadow increases, icon animates
   - Categories: Electrical, Plumbing, Carpentry, Painting,
                  AC & Appliances, Aluminum & Welding, General Services
   - "View All Services" button at bottom

5. HOW IT WORKS (step-by-step):
   - 4 steps in horizontal timeline (vertical on mobile)
   - Step 1: 📝 Describe Your Problem (icon + title + description)
   - Step 2: 👷 Choose Your Worker (icon + title + description)
   - Step 3: 🔧 Work Gets Done (icon + title + description)
   - Step 4: ✅ Rate & Guarantee (icon + title + description)
   - Connecting line/dots between steps
   - Animate steps appearing on scroll

6. WHY OSTA:
   - 2x3 grid of benefit cards
   - ✅ Security Verified Workers — 5-step verification process
   - 💰 Fair & Transparent Pricing — No hidden fees
   - 🛡️ Work Guarantee — Warranty on every service
   - 💳 Secure Payment — Escrow system protects your money
   - ⭐ Real Reviews — From verified customers only
   - 📍 Live Tracking — Track your worker in real-time
   - Each card: icon, title, brief description
   - Alternating card backgrounds for visual interest

7. FEATURED WORKERS (carousel):
   - Title: "Top Rated Workers" / "أفضل الصنايعية"
   - Swiper carousel with worker cards
   - Each card: Photo, Name, Specialty, Rating, Jobs Completed,
                 Verified badge, "Book Now" button
   - Auto-scroll, draggable, pagination dots

8. TESTIMONIALS:
   - Title: "What Our Customers Say" / "آراء عملائنا"
   - Carousel of testimonial cards
   - Each: Customer photo, name, service type, rating stars,
           quote text, date
   - Mix of Arabic testimonials

9. JOIN AS WORKER CTA:
   - Dark background section (dark-950)
   - Split layout: text left, illustration right
   - Title: "Turn Your Skills Into Income" / "حوّل صنعتك لدخل ثابت"
   - Benefits list: Steady income, Flexible hours, Training,
                     Support, Tools marketplace
   - CTA: "Register as a Worker" / "سجّل كأُسطى"
   - Worker registration stats: "Join 5,000+ workers earning
     an average of 8,000 EGP/month"

10. DOWNLOAD APP (future):
    - Mockup phones showing the app
    - App Store + Google Play buttons
    - "Coming Soon" badge

11. FAQ SECTION:
    - Accordion with 6-8 common questions
    - Smooth expand/collapse animation
    - Questions like: How does verification work?
      How is my payment protected? What if I'm not satisfied?
      How do I become a worker? What are the fees?

12. FOOTER:
    - 4-column layout (responsive)
    - Col 1: Logo, brief description, social media links
    - Col 2: Quick Links (Services, How It Works, About, Contact)
    - Col 3: For Workers (Register, FAQ, Training, Support)
    - Col 4: Contact Info (Email, Phone, Address)
    - Bottom bar: © 2025 OSTA, Terms, Privacy, Language toggle
    - Background: dark-950


--- AUTH PAGES ---

LOGIN PAGE (/login):
- Clean centered card layout
- Logo at top
- Phone number input (with country code +20)
- Password input (with show/hide toggle)
- "Remember me" checkbox
- "Forgot Password?" link
- Login button (primary, full width)
- Divider: "or"
- "Don't have an account?" with Register links:
  - "Register as Client" button
  - "Register as Worker" button
- Background: subtle gradient or pattern

REGISTER CLIENT (/register/client):
- Multi-step form with progress indicator
- Step 1: Phone + OTP verification
- Step 2: Personal info (name, email, password)
- Step 3: Default address (optional)
- Form validation with real-time error messages
- Terms & Conditions checkbox
- Success screen with redirect to dashboard

REGISTER WORKER (/register/worker):
- Multi-step form with progress indicator (5 steps)
- Step 1: Phone + OTP verification
- Step 2: Personal info (name, email, password, DOB)
- Step 3: Professional info
  - Select specializations (multi-select from categories)
  - Years of experience
  - Bio/description
  - Work areas (select governorate, city, areas)
  - Work schedule setup
  - Tools available
- Step 4: Identity verification
  - Upload National ID (front)
  - Upload National ID (back)
  - Take/Upload selfie with ID
  - Upload utility bill
  - Guarantor info
- Step 5: Review & Submit
  - Summary of all entered data
  - Terms & Conditions checkbox
  - Submit for verification
- Success screen: "Your application is under review.
  We'll notify you within 24-48 hours."
- Each step must save progress (don't lose data on refresh)

FORGOT PASSWORD (/forgot-password):
- Phone input
- Send OTP button
- OTP input (6-digit)
- New password + confirm
- Success redirect to login

VERIFY OTP (/verify-otp):
- 6-digit OTP input (individual boxes)
- Timer (60s countdown)
- "Resend OTP" button (enabled after timer)
- Auto-submit when 6 digits entered


--- CLIENT DASHBOARD ---

Layout: Sidebar (left/right based on locale) + Main content area
Sidebar: Navigation links with icons, active state highlighting
Top bar: Search, notifications bell (with unread count badge),
         user avatar dropdown (profile, settings, logout)

CLIENT HOME (/client):
- Welcome message: "مرحبًا، [Name]"
- Quick action card: "Need a service?" with big CTA button
- Active requests summary (if any)
  - Card for each active request with status badge, worker info,
    service type, time
- Recent completed requests (last 5)
- Favorite workers (quick access)
- Suggested services based on area
- Quick stats: Total requests, Active warranties, Wallet balance

NEW REQUEST (/client/new-request):
- Multi-step form:
  Step 1: Select service category → specific service
  Step 2: Describe the problem
    - Title input
    - Description textarea
    - Upload images (drag & drop, max 5)
    - Record voice note (optional)
    - Upload video (optional, max 30s)
  Step 3: Select address
    - Choose from saved addresses
    - Or add new address with map pin
  Step 4: Select timing
    - Emergency (within 1 hour — extra fee shown)
    - Today
    - Tomorrow
    - Pick a date/time
  Step 5: Choose worker (optional)
    - "Auto-assign best available" (default)
    - Or browse available workers:
      - Filter by rating, price, distance
      - Worker cards with: photo, name, rating, price range,
        distance, availability
      - Click to see full profile
  Step 6: Review & Confirm
    - Summary of everything
    - Estimated price range
    - Apply promo code
    - Select payment method
    - Terms checkbox
    - Confirm & Pay button
  - After confirm: Show request confirmation with tracking

MY REQUESTS (/client/my-requests):
- Tabs: Active | Completed | Cancelled
- Filter by service type, date range
- Request cards:
  - Request number, service icon, title
  - Status badge (color coded)
  - Worker name + photo (if assigned)
  - Date, estimated price
  - Action buttons based on status
- Pagination or infinite scroll

REQUEST DETAIL (/client/request/[id]):
- Full request details
- Status timeline (visual step-by-step):
  Placed → Accepted → Worker En Route → In Progress →
  Completed → Confirmed
  Each step shows timestamp
- Worker card (if assigned):
  Photo, name, phone (masked), rating, specialization
  Chat button, Track button
- Request info: Service, description, images, address, timing
- Map: Worker location (live if en route) + client address
- Before/After images (if work completed)
- Invoice (if completed): labor + materials + fees = total
- Actions:
  - Cancel (if pending/accepted — with confirmation dialog)
  - Confirm completion (if completed by worker)
  - File complaint (if issue)
  - Rate & Review (if confirmed)
- Chat window (inline or modal)

FAVORITES (/client/favorites):
- Grid of favorite worker cards
- Each card: Photo, name, specialty, rating, total jobs
- "Book" button, "Remove from favorites" button
- Empty state: "No favorites yet" with CTA to browse workers

WALLET (/client/wallet):
- Current balance (large number)
- Quick top-up buttons: 100, 200, 500, Custom
- Top-up form: amount, payment method, confirm
- Transaction history (table):
  Date, description, type (credit/debit), amount, balance
  Filter by type, date range
  Export as CSV

WARRANTIES (/client/warranties):
- Tabs: Active | Expired
- Warranty cards:
  Service type, worker name, request date, warranty period,
  expiry date, status badge
- "Claim warranty" button → opens form:
  Describe issue, upload evidence, submit

COMPLAINTS (/client/complaints):
- List of complaints with status badges
- "New complaint" button → form:
  Select request, type (dropdown), title, description,
  upload evidence, submit
- Complaint detail: timeline of updates, admin responses

MESSAGES (/client/messages):
- Left panel: conversation list (sorted by recent)
  Each: worker avatar, name, last message preview, timestamp,
  unread count badge
- Right panel: chat window
  Messages with timestamps, read receipts
  Text input, image attachment, send button
  Scroll to load older messages
- Mobile: conversation list → tap → full screen chat

NOTIFICATIONS (/client/notifications):
- List of notifications (grouped by date)
- Each: icon based on type, title, body, timestamp
- Click: navigates to relevant page
- "Mark all as read" button
- Unread highlighted with accent color

CLIENT SETTINGS (/client/settings):
- Profile: Edit name, email, phone, avatar
- Addresses: CRUD for saved addresses with map
- Notifications: Toggle push, email, SMS for each type
- Payment Methods: Saved cards/wallets
- Privacy: Account visibility, data download
- Language: AR/EN toggle
- Delete Account: with confirmation flow


--- WORKER DASHBOARD ---

Layout: Same sidebar layout but different navigation items
Color accent: slightly different shade for worker areas

WORKER HOME (/worker):
- Status toggle: 🟢 Available / 🔴 Not Available (prominent)
- Today's summary cards:
  - Incoming requests (count)
  - Active jobs (count)
  - Today's earnings (amount)
  - Current rating (stars)
- Incoming request alerts (real-time, with accept/reject)
- Schedule for today (timeline view)
- Quick stats chart (earnings last 7 days - bar chart)
- Tips/reminders from the platform

INCOMING REQUESTS (/worker/requests/incoming):
- Real-time updating list
- Each request card:
  - Service type + icon
  - Description (truncated)
  - Client name + rating
  - Location + distance from worker
  - Preferred timing
  - Estimated price range
  - Images (thumbnails)
  - Accept / Reject buttons
  - "Make offer" option (custom price + message)
  - Timer: auto-reject after X minutes
- Sort by: nearest, newest, highest price
- Sound notification for new requests

ACTIVE JOBS (/worker/requests/active):
- Current active job (prominent card):
  - Client info + contact
  - Service details
  - Address with navigation button (opens maps)
  - Status actions:
    * "I'm on my way" → shows to client
    * "I've arrived"
    * "Start work" (starts timer)
    * Upload "before" photos
    * "Complete work"
    * Upload "after" photos
    * Generate invoice (labor + materials form)
  - In-app chat with client
- Other accepted jobs (queue)

EARNINGS (/worker/earnings):
- Summary cards: Today | This Week | This Month | Total
- Earnings chart (line chart - last 30 days)
- Breakdown: Total earned vs Commission vs Net
- Transaction list: date, request#, amount, commission, net
- Pending payouts
- Withdraw button → form:
  Amount (max: wallet balance), bank account, confirm
- Withdrawal history with status (pending/processing/completed)

RATINGS (/worker/ratings):
- Overall rating (large, with stars)
- Breakdown:
  - Quality: ★★★★☆ 4.5
  - Punctuality: ★★★★★ 4.8
  - Behavior: ★★★★★ 4.9
  - Cleanliness: ★★★★☆ 4.3
- Rating distribution bar chart (5★: 80%, 4★: 15%, etc.)
- Recent reviews list:
  Client avatar, name, rating, comment, date, service type
- Filter by rating, date
- "Most praised for: Punctuality" highlight

PORTFOLIO (/worker/portfolio):
- Grid of portfolio items
- Each: Before/After images side by side, title, description
- Add new: title, description, before image, after image, category
- Reorder capability (drag & drop)

SCHEDULE (/worker/schedule):
- Weekly calendar view
- Set available hours for each day
- Block specific dates
- View upcoming bookings on calendar
- Toggle days on/off

STATS (/worker/stats):
- Comprehensive analytics:
  - Jobs completed (total + trend chart)
  - Acceptance rate (percentage + trend)
  - Cancellation rate
  - Average response time
  - Average job duration by service type
  - Earnings per service type (pie chart)
  - Busiest days (bar chart)
  - Customer retention rate
  - Ranking among workers in area
- Time period selector: 7d, 30d, 90d, 1y

WORKER SETTINGS (/worker/settings):
- Profile: name, bio, avatar, years of experience
- Documents: re-upload or update verification documents
  Show verification status for each document
- Work Areas: Add/remove governorates/cities/areas (multi-select with map)
- Specializations: Toggle services on/off
- Bank Account: Add/edit bank details
- Schedule: Link to schedule page
- Notifications: Toggle preferences
- Subscription: Current plan, upgrade options


--- ADMIN DASHBOARD ---

Layout: Full sidebar with collapsible sections
Color accent: Dark theme option available

ADMIN OVERVIEW (/admin):
- Stats cards row 1:
  - Total Users (clients + workers)
  - Active Workers Now
  - Requests Today
  - Revenue Today
- Stats cards row 2:
  - Pending Verifications (⚠️ action needed)
  - Open Complaints (⚠️ action needed)
  - Pending Withdrawals (⚠️ action needed)
  - Active Requests Now
- Charts row:
  - Revenue chart (line, last 30 days)
  - Requests chart (bar, last 30 days)
  - User growth chart (line, last 12 months)
- Top workers table (top 5 by rating + earnings)
- Top requested services (pie chart)
- Recent activity feed (live updates)
- Geographic heatmap of requests

WORKERS MANAGEMENT (/admin/workers):
- Data table with columns:
  Avatar, Name, Phone, Specialization, Rating, Status,
  Verified, Jobs, Earnings, Joined, Actions
- Filters: status, verification, specialization, area, rating range
- Search by name, phone, ID
- Sort by any column
- Bulk actions: suspend, activate
- Row click: navigate to worker detail
- "Pending Verification" tab with count badge

WORKER DETAIL (/admin/workers/[id]):
- Full worker profile view
- Verification documents (viewable/downloadable):
  - National ID front/back (zoomable)
  - Selfie with ID
  - Criminal record
  - Utility bill
  - Guarantor info
- Verification actions:
  - Approve (with optional note)
  - Reject (with required reason)
  - Request additional documents
- Worker stats: all analytics
- Job history table
- Reviews received
- Complaints against
- Earnings & payouts
- Admin notes (internal)
- Action buttons: Verify, Suspend, Ban, Edit commission,
  Send notification, Impersonate (view as worker)

CLIENTS MANAGEMENT (/admin/clients):
- Similar data table as workers
- Columns: Avatar, Name, Phone, Requests, Rating, Spending,
  Status, Joined, Actions
- Client detail: profile, request history, complaints,
  payments, admin notes

REQUESTS MANAGEMENT (/admin/requests):
- Data table: Request#, Client, Worker, Service, Status,
  Amount, Date, Actions
- Filters: status, service, date range, area
- Request detail: full info, timeline, payment status,
  override capabilities
- Admin can: reassign worker, cancel request, issue refund,
  add notes

COMPLAINTS MANAGEMENT (/admin/complaints):
- Priority queue view
- Columns: ID, Type, Client, Worker, Request, Status, Priority,
  Date, Assigned To
- Complaint detail:
  - Full complaint info
  - Evidence (images/files)
  - Related request details
  - Both party profiles
  - Timeline of actions
  - Action panel:
    * Assign to admin
    * Add internal note
    * Contact client/worker
    * Issue warning to worker
    * Issue compensation
    * Resolve with explanation
    * Escalate

FINANCE (/admin/finance):
- Revenue dashboard:
  - Total revenue, commissions, net payouts
  - Revenue chart (daily/weekly/monthly)
  - Revenue by service category (pie chart)
  - Revenue by area (bar chart)
- Escrow management:
  - Held funds list
  - Manual release capability
- Withdrawals queue:
  - Pending withdrawal requests
  - Approve / Reject with notes
  - Processing / completed history
- Reports:
  - Generate reports by date range
  - Export as CSV / PDF
  - Daily/Weekly/Monthly auto-reports

CATEGORIES & SERVICES (/admin/categories):
- Tree view: Categories → Services
- CRUD for categories:
  Name AR/EN, slug, icon, image, sort order, active toggle
- CRUD for services:
  Name AR/EN, description, icon, base price range,
  warranty days, estimated time, active toggle

AREAS MANAGEMENT (/admin/areas):
- Hierarchical: Governorate → City → Area
- CRUD operations
- Active toggle (enable/disable service areas)
- Worker count per area

PROMOTIONS (/admin/promotions):
- List of promotions with usage stats
- Create promotion form:
  Code, type (percentage/fixed), value, max uses,
  min order value, max discount, valid from/to
- Edit / Deactivate / Delete

ANALYTICS (/admin/analytics):
- Deep analytics dashboard
- Customizable date range
- Metrics:
  * User acquisition funnel
  * Request completion rate
  * Average order value
  * Peak hours/days heatmap
  * Worker utilization rate
  * Service demand trends
  * Geographic distribution
  * Client retention/churn
  * NPS score estimation
  * Revenue forecasting
- All charts interactive and exportable

CONTENT MANAGEMENT (/admin/content):
- Edit static pages (About, Terms, Privacy)
- WYSIWYG editor
- FAQ management (CRUD)
- Banner/announcement management

BROADCAST NOTIFICATIONS (/admin/notifications):
- Form: target (all/clients/workers), title, body, action URL
- Schedule for later option
- History of sent broadcasts

SYSTEM SETTINGS (/admin/settings):
- General: Platform name, contact info, social links
- Commission: Default rate, per-service overrides
- Registration: Required documents, auto-approve rules
- Payments: Gateway config, escrow auto-release hours
- Notifications: Email templates, SMS templates
- Security: Rate limiting, banned phones
- Admin management: Add/edit admin users, set permissions
- System logs: Filterable audit log viewer


=============================================================
PHASE 6: REAL-TIME FEATURES (Socket.io)
=============================================================

Implement these real-time features:

1. LIVE REQUEST TRACKING:
   - Worker shares location every 10 seconds
   - Client sees worker moving on map
   - Status updates in real-time
   - ETA calculation

2. REAL-TIME NOTIFICATIONS:
   - New request alert for workers (with sound)
   - Request status changes for clients
   - New message indicator
   - Payment confirmations
   - Admin alerts for urgent matters

3. CHAT SYSTEM:
   - Real-time message delivery
   - Typing indicator
   - Online/offline status
   - Read receipts
   - Image sharing in chat

4. ADMIN LIVE FEED:
   - Real-time activity stream
   - Live request map
   - Active workers map
   - Alert system for anomalies

Socket Events to implement:
- connection / disconnect
- worker:updateLocation
- worker:toggleAvailability
- request:create
- request:offer
- request:accept
- request:reject
- request:statusUpdate
- request:cancel
- chat:message
- chat:typing
- chat:read
- notification:send
- admin:alert


=============================================================
PHASE 7: SECURITY REQUIREMENTS
=============================================================

1. Authentication:
   - JWT access tokens (15 min expiry)
   - Refresh tokens (7 days, stored in httpOnly cookie)
   - OTP verification for registration and sensitive actions
   - Account lockout after 5 failed login attempts (30 min)
   - Password hashing with bcrypt (salt rounds: 12)
   - Password requirements: min 8 chars, 1 upper, 1 lower,
     1 number, 1 special

2. Authorization:
   - Role-based access control (RBAC)
   - Route guards on frontend
   - Middleware checks on backend
   - Resource ownership verification
   - Admin permission levels

3. Data Protection:
   - Input sanitization (XSS prevention)
   - SQL injection prevention (Prisma handles this)
   - CSRF protection
   - Rate limiting per IP and per user
   - File upload validation (type, size, malware scan)
   - Sensitive data encryption at rest
   - HTTPS only
   - CORS whitelist

4. Privacy:
   - Phone numbers masked in UI (show last 4 digits)
   - Direct communication through platform only (masked calls)
   - Data retention policies
   - GDPR-like compliance (data export, deletion)
   - Audit logging for all admin actions

5. File Security:
   - Signed URLs for S3 (expiring)
   - Image optimization and stripping EXIF data
   - Max file sizes: images 5MB, documents 10MB, video 50MB
   - Allowed types: jpg, png, webp, pdf, mp4


=============================================================
PHASE 8: SEED DATA
=============================================================

Create comprehensive seed data in prisma/seed.ts:

- 7 service categories (as detailed in the study)
- 25+ services across all categories
- 20 areas (Egyptian governorates and cities)
- 1 super admin account
- 2 admin accounts
- 10 client accounts (with addresses)
- 15 worker accounts (various statuses):
  - 8 verified and active
  - 3 pending verification
  - 2 under review
  - 1 suspended
  - 1 rejected
- 30+ service requests in various statuses
- 20+ reviews
- 5 complaints in various statuses
- 10 payments in various statuses
- Portfolio items for verified workers
- Sample promotions
- System settings defaults

All seed data should use realistic Egyptian:
- Names (Arabic)
- Phone numbers (+20 format)
- Addresses (real Egyptian areas)
- Service descriptions in Arabic


=============================================================
PHASE 9: RESPONSIVE & MOBILE DESIGN
=============================================================

Breakpoints:
- Mobile: 0 - 639px (sm)
- Tablet: 640px - 1023px (md)
- Desktop: 1024px - 1279px (lg)
- Large: 1280px+ (xl)

Mobile-specific behaviors:
- Bottom navigation bar on dashboard (instead of sidebar)
- Swipeable cards
- Pull to refresh
- Touch-friendly tap targets (min 44x44px)
- Collapsible sections
- Full-screen modals instead of side panels
- Sticky action buttons
- Optimized images (WebP, lazy loading)
- Skeleton loading states
- Smooth scroll behavior
- Haptic feedback consideration


=============================================================
PHASE 10: PERFORMANCE & SEO
=============================================================

- Next.js SSR for public pages
- Static generation for service/category pages
- Dynamic imports for heavy components
- Image optimization with next/image
- Font optimization with next/font
- Metadata for all pages (title, description, OG tags)
- Structured data (JSON-LD) for services
- Sitemap generation
- robots.txt
- Loading states (skeletons, not spinners)
- Error boundaries
- 404 and 500 custom pages
- Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Bundle analysis and code splitting


=============================================================
EXECUTION INSTRUCTIONS
=============================================================

Build this project phase by phase. For each phase:

1. Write clean, production-ready code
2. Add proper TypeScript types everywhere
3. Handle all error cases
4. Add loading and empty states
5. Make everything fully responsive
6. Support RTL (Arabic) layout
7. Add proper comments for complex logic
8. Follow REST API best practices
9. Use proper HTTP status codes
10. Implement proper form validation with user-friendly
    error messages in both Arabic and English

Start with Phase 1 (setup) and Phase 2 (database), then build
the backend API (Phase 3), then the frontend starting with the
landing page and auth pages, then dashboards.

The design should feel premium, trustworthy, and professional.
The color scheme is RED (#DC2626) + BLACK (#1A1A2E) + WHITE (#FAFAFA)
with the Golden Ratio applied to all spacing and proportions.

Every page must be immediately usable by an Arabic-speaking
Egyptian user. The UX should be as smooth as Uber or Careem.

=============================================================
END OF PROMPT
=============================================================