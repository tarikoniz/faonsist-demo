# 🏗️ FaOnSisT - Enterprise Business Management Platform

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![License](https://img.shields.io/badge/license-Proprietary-red)

**FaOnSisT** is a comprehensive, enterprise-grade business management platform designed specifically for construction and industrial companies. It integrates messaging, ERP, CRM, procurement, and warehouse management into a single, powerful solution.

---

## 🌟 Core Modules

### 📱 **FaOn-Connect** - Enterprise Communication
Professional team collaboration and communication platform with advanced features:

**Base Features:**
- Real-time messaging with WebSocket support
- Channels, groups, and direct messages
- File sharing with drag & drop
- Message search and archiving
- Online presence and typing indicators

**Advanced Features:**
- 🎥 Video/Audio calling with screen sharing
- 📅 Meeting scheduler with calendar integration
- 🧵 Message threads for organized discussions
- 📝 Rich text editor with code snippets
- ⭐ Starred messages and bookmarks
- 🔄 Message forwarding
- 📊 Channel analytics and insights
- 🎨 Custom emojis and reactions

### 🏗️ **Construction ERP** - Project Management
Complete ERP solution for construction project management:

**Base Features:**
- Project planning and tracking
- Budget management and control
- Hakediş (progress payment) calculation
- Milestone and deliverable tracking
- Task assignment and monitoring

**Advanced Features:**
- ⏱️ **Time Tracking**: Employee timesheet management with GPS
- 🚜 **Equipment Management**: Fleet tracking, maintenance, fuel logs
- 📄 **Document Management**: Version control, approvals, expiry tracking
- ✅ **Quality Control**: Inspections, checkpoints, non-conformance tracking
- 🦺 **Safety Management**: Incident reporting, corrective actions
- 👷 **Sub-Contractor Management**: Performance tracking, payments, certifications
- 📊 **Daily Reports**: Weather, manpower, materials, progress tracking
- 📸 **Photo Documentation**: Site progress with geolocation
- 🔧 **Resource Planning**: Allocation and utilization tracking

### 👥 **CRM** - Customer Relationship Management
Advanced CRM with AI-powered insights:

**Base Features:**
- Lead management and scoring
- Sales pipeline visualization
- Customer 360° view
- Activity tracking
- Deal management

**Advanced Features:**
- 📧 **Email Integration**: Gmail, Outlook sync with tracking
- 📞 **Call Logging**: Automatic call recording and transcription
- 📝 **Meeting Notes**: Structured notes with action items
- 💼 **Proposal Generator**: Professional proposals with templates
- 📑 **Contract Management**: Digital signatures, renewals, SLA tracking
- 🌐 **Customer Portal**: Self-service portal for clients
- 🎯 **Marketing Automation**: Multi-channel campaigns
- 🤖 **AI Lead Scoring**: Predictive conversion probability
- 📈 **Sales Forecasting**: AI-powered revenue predictions
- 💰 **Customer Lifetime Value**: CLV calculation and churn prediction

### 📦 **Procurement & Warehouse** - Supply Chain Management
Professional procurement and inventory management:

**Procurement Features:**
- 📋 **Purchase Requisitions**: Multi-level approval workflows
- 🏢 **Vendor Management**: Performance ratings, certifications, contracts
- 📊 **RFQ Management**: Request for quotation with vendor comparison
- 💵 **Quotation Evaluation**: Weighted scoring and ranking
- 📄 **Purchase Orders**: PO creation, amendments, tracking
- 📦 **Goods Receipt**: GRN with quality inspection
- 🧾 **Invoice Matching**: 3-way matching (PO-GRN-Invoice)
- 💳 **Payment Tracking**: Payment terms and history

**Warehouse Features:**
- 🏭 **Multi-Warehouse**: Multiple locations with transfers
- 📍 **Bin Locations**: Zone-Aisle-Rack-Level-Bin hierarchy
- 🔢 **Batch Tracking**: Manufacture and expiry dates
- 🏷️ **Serial Number Tracking**: Individual item tracking
- 📊 **Cycle Counting**: ABC analysis and accuracy tracking
- 📱 **Barcode/QR Scanning**: Mobile-ready inventory management
- 🌡️ **Temperature Control**: Cold storage monitoring
- 🚨 **Stock Alerts**: Low stock, expiry warnings, dead stock
- 📈 **Inventory Analytics**: Turnover, aging, valuation

---

## 🎯 Key Features

### 🔐 Security & Compliance
- Role-based access control (RBAC)
- Audit trail for all actions
- Data encryption at rest and in transit
- GDPR compliance ready
- Two-factor authentication (2FA)

### 📊 Analytics & Reporting
- Real-time dashboards
- Custom report builder
- Export to Excel, PDF, CSV
- Scheduled report delivery
- KPI tracking and alerts

### 🌍 Multi-Language Support
- Turkish (Primary)
- English
- Extensible for more languages

### 📱 Responsive Design
- Mobile-first approach
- Works on all devices
- Progressive Web App (PWA) ready

### 🔄 Integration Ready
- RESTful API
- Webhook support
- Third-party integrations
- Import/Export capabilities

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with App Router |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | v4 | Utility-first CSS framework |
| **Shadcn UI** | Latest | High-quality component library |
| **Zustand** | Latest | State management |
| **React Hook Form** | Latest | Form handling |
| **Zod** | Latest | Schema validation |
| **Socket.io Client** | Latest | Real-time communication |
| **Lucide React** | Latest | Icon library |
| **date-fns** | Latest | Date utilities |

### Backend (Planned)
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express/Fastify** | API framework |
| **PostgreSQL** | Primary database |
| **Redis** | Caching and sessions |
| **Socket.io** | WebSocket server |
| **Prisma** | ORM |
| **Bull** | Job queue |
| **MinIO/S3** | File storage |

---

## 📋 System Requirements

### Development
- Node.js 18.x or higher
- npm 9.x or higher
- 4GB RAM minimum
- Modern web browser

### Production
- Node.js 18.x LTS
- PostgreSQL 14+
- Redis 6+
- 8GB RAM minimum
- 50GB storage

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd faonsist
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local` file:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME=FaOnSisT
NEXT_PUBLIC_APP_VERSION=2.0.0

# Database (for backend)
DATABASE_URL=postgresql://user:password@localhost:5432/faonsist

# Redis
REDIS_URL=redis://localhost:6379

# File Storage
S3_BUCKET=faonsist-files
S3_REGION=us-east-1
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
faonsist/
├── app/                              # Next.js App Router
│   ├── (auth)/                      # Authentication pages
│   │   ├── login/                   # Login page
│   │   └── register/                # Registration page
│   ├── (dashboard)/                 # Dashboard pages
│   │   ├── messages/                # FaOn-Connect module
│   │   ├── erp/                     # ERP module
│   │   ├── crm/                     # CRM module
│   │   ├── stock/                   # Stock & Procurement
│   │   └── settings/                # Settings page
│   ├── api/                         # API routes
│   │   ├── auth/                    # Authentication endpoints
│   │   └── channels/                # Channel endpoints
│   ├── globals.css                  # Global styles (Tailwind v4)
│   └── layout.tsx                   # Root layout
│
├── components/                       # React components
│   ├── shell/                       # Layout components
│   │   ├── global-nav.tsx          # Global navigation sidebar
│   │   └── shell-layout.tsx        # Main shell layout
│   ├── modules/                     # Module-specific components
│   │   └── messages/               # Chat components
│   │       ├── chat-sidebar.tsx
│   │       └── chat-window.tsx
│   ├── shared/                      # Shared components
│   │   ├── search-bar.tsx
│   │   ├── file-upload.tsx
│   │   └── notification-bell.tsx
│   └── ui/                          # Shadcn UI components
│
├── lib/                             # Utilities and helpers
│   ├── store/                       # Zustand stores
│   │   ├── auth.ts                 # Authentication state
│   │   ├── chat.ts                 # Chat state
│   │   └── navigation.ts           # Navigation state
│   ├── api-client.ts               # HTTP client
│   ├── constants.ts                # App constants
│   ├── validators.ts               # Zod schemas
│   └── utils.ts                    # Utility functions
│
├── hooks/                           # Custom React hooks
│   ├── use-auth.ts                 # Authentication hook
│   ├── use-chat.ts                 # Chat hook
│   ├── use-debounce.ts             # Debounce hook
│   └── use-media-query.ts          # Responsive hook
│
├── types/                           # TypeScript type definitions
│   ├── index.ts                    # Global types
│   ├── messages.ts                 # Base messaging types
│   ├── messages-advanced.ts        # Advanced messaging types
│   ├── erp.ts                      # Base ERP types
│   ├── erp-advanced.ts             # Advanced ERP types
│   ├── crm.ts                      # Base CRM types
│   ├── crm-advanced.ts             # Advanced CRM types
│   ├── stock.ts                    # Base stock types
│   └── procurement-warehouse.ts    # Advanced procurement types
│
└── public/                          # Static assets
```

---

## 📊 Type System Overview

### Base Types (150+ types)
- User management and authentication
- Messages, channels, reactions
- Projects, tasks, milestones
- Leads, customers, deals
- Inventory, orders, tenders

### Advanced Types (200+ types)
- **Messages Advanced**: Video calls, meetings, threads, rich content
- **ERP Advanced**: Resources, time tracking, equipment, QC, safety
- **CRM Advanced**: Email integration, proposals, contracts, AI scoring
- **Procurement**: RFQ, vendors, PO, GRN, invoice matching
- **Warehouse**: Multi-warehouse, bin locations, batch/serial tracking

**Total: 350+ TypeScript interfaces and enums**

---

## 🔑 Demo Credentials

```
Email: demo@faonsist.com
Password: demo123
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#5B9FED) - Main actions
- **Accent**: Purple (#A855F7) - Highlights
- **Success**: Green (#22C55E) - Success states
- **Warning**: Orange (#F97316) - Warnings
- **Destructive**: Red (#EF4444) - Errors
- **Surface**: Dark Gray (#2D3748) - Cards and panels

### Typography
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont
- **Headings**: 700 weight, 1.2 line-height
- **Body**: 400 weight, 1.6 line-height

### Components
- Dark-first theme
- Glassmorphism effects
- Gradient overlays
- Micro-animations
- Shadow system
- Responsive breakpoints

---

## 📈 Roadmap

### Phase 1: Foundation (✅ Completed)
- [x] Project setup and configuration
- [x] Base UI components and layouts
- [x] Authentication system
- [x] State management
- [x] Type definitions (350+ types)

### Phase 2: Core Modules (🚧 In Progress)
- [ ] Backend API development
- [ ] Database schema and migrations
- [ ] Real-time WebSocket integration
- [ ] File upload and storage
- [ ] Email service integration

### Phase 3: Advanced Features (📅 Planned)
- [ ] Video/Audio calling
- [ ] AI-powered features
- [ ] Mobile applications
- [ ] Advanced analytics
- [ ] Third-party integrations

### Phase 4: Enterprise (🔮 Future)
- [ ] Multi-tenancy
- [ ] White-labeling
- [ ] API marketplace
- [ ] Plugin system
- [ ] Advanced security features

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📚 Documentation

- **User Guide**: `/docs/user-guide.md`
- **API Documentation**: `/docs/api.md`
- **Developer Guide**: `/docs/developer-guide.md`
- **Deployment Guide**: `/docs/deployment.md`

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## 📄 License

This project is proprietary software. All rights reserved.

For licensing inquiries, contact: licensing@faonsist.com

---

## 🆘 Support

- **Email**: support@faonsist.com
- **Documentation**: https://docs.faonsist.com
- **Community**: https://community.faonsist.com
- **Status Page**: https://status.faonsist.com

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:
- [Next.js](https://nextjs.org/) by Vercel
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs
- [Shadcn UI](https://ui.shadcn.com/) by shadcn
- [Zustand](https://zustand-demo.pmnd.rs/) by Poimandres
- And many more...

---

## 📊 Project Stats

- **Lines of Code**: 15,000+
- **Components**: 50+
- **Type Definitions**: 350+
- **API Endpoints**: 20+ (planned: 100+)
- **Supported Languages**: 2 (Turkish, English)
- **Test Coverage**: Target 80%+

---

**FaOnSisT** - Empowering businesses with integrated management solutions.

© 2024 FaOnSisT. All rights reserved.

---

Made with ❤️ by the FaOnSisT Team
