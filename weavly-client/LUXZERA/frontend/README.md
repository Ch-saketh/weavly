# 💎 LUXZERA Frontend — Modern AI Fashion Commerce Client

> **High-fidelity, responsive fashion commerce and interactive styling client built with Next.js 14, React 19, Tailwind CSS, Motion, and Three.js.**

---

## 🏛️ 1. Architecture & Design System

**LUXZERA** is the user-facing storefront, interactive stylist studio, and creator atelier platform for the **Weavly** ecosystem. It connects directly with the Spring Boot backend (`weavly-server`) on port `8081` and integrates with the Zyra AI Intelligence Engine (`core-model`) on port `5001`.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       LUXZERA CLIENT (PORT 3000)                                 │
├────────────────────────────────┬────────────────────────────────┬────────────────────────────────┤
│ 🛍️ Storefront & Catalog        │ 🧠 Zyra Stylist & Wardrobe     │ 🎨 Designer & Atelier Studio   │
│ • Next.js 14 App Router        │ • Live Occasion Switcher       │ • Creator Portfolio Pages      │
│ • Faceted Filtering & Search   │ • On-Demand AI Recommendations │ • Bespoke Custom Requests      │
│ • Responsive Product Grids     │ • 3D/Interactive Fit Studio    │ • Atelier Application Flow     │
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
│ 👤 User Identity & Fit         │ 🛡️ Admin & Governance Portal   │ 🛒 ZeraCart & Checkout         │
│ • 15-Point Fit Questionnaire   │ • Designer Vetting & Approval  │ • Synchronized Cart State      │
│ • Multi-Image Style Moodboard  │ • Product Catalog Moderation   │ • Escrow Order Management      │
│ • Dynamic Account Sidebar      │ • Threat & Metric Dashboard    │ • Secure Payment Pipeline      │
└────────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
                                 │                                │
                                 ▼                                ▼
                 ┌───────────────────────────────┐┌───────────────────────────────┐
                 │    WEAVLY SERVER (PORT 8081)  ││    ZYRA CORE MODEL (PORT 5001)│
                 │   Spring Boot 3.3 REST API    ││   FastAPI / Flask PyTorch ML  │
                 └───────────────────────────────┘└───────────────────────────────┘
```

### 🎨 Wireframe Box Design Aesthetics
LUXZERA follows a minimalist, high-fashion architectural wireframe aesthetic:
- **Primary Color**: `#183B56` (Deep Obsidian / Navy)
- **Background**: `#F5EFEB` (Alabaster Warm Paper) & `#FFFFFF` (Crisp White)
- **Borders & Framing**: 1px crisp structural grid lines, rounded corners (`rounded-2xl`, `rounded-3xl`), and subtle elevation shadows.
- **Typography**: Clean, sans-serif typography with high contrast hierarchy.
- **Motion & Micro-interactions**: Smooth transitions powered by `motion` (Framer Motion) and GSAP.

---

## 🗺️ 2. Comprehensive Routing Matrix

| Route | Page / Feature | Access | Description |
| :--- | :--- | :---: | :--- |
| `/` | **Hero & Storefront** | Public | Dynamic hero, Bespoke Fit trigger, featured designers, and live lookbook drops |
| `/wardrobe` | **ZeraCollection Stylist** | Public / Auth | AI recommendation studio with 8-occasion switcher, live fit advisor, and interactive wardrobe |
| `/men` | **Men's Collection** | Public | Filterable catalog for menswear with category, style, and price controls |
| `/women` | **Women's Collection** | Public | Filterable catalog for womenswear with luxury and contemporary filters |
| `/unisex` | **Unisex Collection** | Public | Gender-neutral streetwear, oversized silhouettes, and essentials |
| `/product/[id]` | **Product Detail Page** | Public | High-res imagery, sizing advisor, fabric breakdown, and designer attribution |
| `/designers` | **Designers Directory** | Public | Showcase of independent creators and bespoke ateliers |
| `/designer/[id]` | **Designer Portfolio** | Public | Creator bio, active drop catalog, and custom commission request modal |
| `/designer-studio`| **Designer Dashboard** | Designer | Atelier management, custom order proposals, and garment upload portal |
| `/onboarding` | **User Onboarding** | Auth | Complete 15-point profile, biometrics, style preferences, and multi-image photo upload |
| `/account` | **Account & Settings** | Auth | User profile, biometrics, measurement manager, and style moodboard gallery |
| `/admin` | **Governance Portal** | Admin | Designer verification workflow, product status review, and audit logs |
| `/cart` | **ZeraCart** | Public / Auth | Slide-out and dedicated bag with item summary and checkout triggers |
| `/orders` | **Orders & Tracking** | Auth | Order history, tracking status, and milestone tracking for bespoke pieces |
| `/custom-design` | **Bespoke Request** | Auth | Custom garment configuration and direct designer commissioning |

---

## ⚡ 3. Key Feature Modules Breakdown

### 👗 1. ZeraCollection AI Stylist (`/wardrobe`)
- **8-Occasion Semantic Switcher**: Instantly switch between `College`, `Casual`, `Party`, `Formal`, `Wedding`, `Date Night`, `Work`, and `Sport`.
- **Live Fresh Generation**: Directly queries Zyra V2 without stale client caching to deliver newly synthesized recommendations.
- **Biometric & Preference Conditioning**: Evaluates the user's fit profile, preferred styles, avoided categories, and budget ceiling.

### 👤 2. End-to-End User Onboarding (`/onboarding`)
- **Step 1: Personal Information**: First name, last name, mobile number, gender (`MALE`, `FEMALE`, `OTHER`), and date of birth.
- **Step 2: Fit & Biometrics**: Height, weight, top size, bottom size, shoe size, and preferred fit cut (`Relaxed`, `Slim`, `Oversized`, etc.).
- **Step 3: Fashion Archetypes**: Aesthetic affinity (Streetwear, Minimalist, Luxury, Old Money, Bohemian) and avoided categories/colors.
- **Step 4: Style Inspiration Upload**: Multi-photo upload mechanism sending moodboard and outfit reference images to Cloudflare R2.

### 🎨 3. Designer Atelier & Bespoke Studio (`/designer-studio`)
- Independent creators submit profiles, portfolios, and verify credentials.
- Customers can submit custom garment requests with reference sketches and budget constraints.
- Milestone-based escrow pipeline ensures buyer and creator protection.

### 🛡️ 4. Designer Governance & Admin (`/admin`)
- Administrative review interface for reviewing pending designer applications.
- Approve/reject buttons with status reflection and security audit logging.

---

## 🛠️ 4. State Management Architecture

```
                 ┌────────────────────────────────────────────────────────┐
                 │                      Root Providers                    │
                 └──────────────────────────┬─────────────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│     `AuthContext`     │       │   `WardrobeContext`   │       │     `CartContext`     │
├───────────────────────┤       ├───────────────────────┤       ├───────────────────────┤
│ • JWT Session Token   │       │ • Saved Items         │       │ • Cart Items & Qty    │
│ • User Profile Data   │       │ • Active Occasion     │       │ • Price Calculations  │
│ • Google OAuth State  │       │ • Real-time AI Outfits│       │ • Checkout Pipeline   │
│ • Login / Logout Flow │       │ • Inspiration Images  │       │ • LocalStorage Sync   │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

---

## 🔧 5. Resolved Issues & Technical Improvements

1. **Modal Z-Index Overlap Fix**:
   - **Problem**: Fixed navigation header (`z-[100]`) was clipping modal overlays and dialog headers.
   - **Resolution**: Elevated [BespokeFitModal.jsx](file:///Users/saketh/Desktop/Projects/weavly/weavly-client/LUXZERA/frontend/src/modules/home/components/BespokeFitModal.jsx), [OnboardingModal.jsx](file:///Users/saketh/Desktop/Projects/weavly/weavly-client/LUXZERA/frontend/src/modules/onboarding/components/OnboardingModal.jsx), and [DeveloperJoinModal.jsx](file:///Users/saketh/Desktop/Projects/weavly/weavly-client/LUXZERA/frontend/src/modules/onboarding/components/DeveloperJoinModal.jsx) to `z-[200]` with `relative z-10` modal content layers.
2. **Sidebar Text Wrapping in Account Page**:
   - **Problem**: "STYLE INSPIRATION" sidebar tab text was overflowing and clipping in the profile navigation drawer.
   - **Resolution**: Added `break-words`, `leading-tight`, and flexible width constraints in [AccountSidebar.jsx](file:///Users/saketh/Desktop/Projects/weavly/weavly-client/LUXZERA/frontend/src/modules/profile/components/account/AccountSidebar.jsx) and [LineSidebar.css](file:///Users/saketh/Desktop/Projects/weavly/weavly-client/LUXZERA/frontend/src/shared/components/ui/LineSidebar.css).
3. **Disabled Stale AI Product Caching**:
   - **Problem**: `ZeraCollection` was reusing persisted historical recommendations rather than generating fresh live outfits per occasion.
   - **Resolution**: Updated `ZeraCollection.jsx` to fetch live on-demand recommendations from `/api/recommendations/my?occasion={selected}` with fresh timestamps.
4. **Complete Onboarding Data Capture**:
   - **Problem**: Onboarding questionnaire was skipping demographic data (name, phone, DOB, gender) and image upload.
   - **Resolution**: Integrated full four-step sequence capturing all identity attributes and multi-image moodboard uploads.

---

## 🚀 6. Getting Started & Setup

### Prerequisites
- Node.js `20.x` or higher
- `npm` or `pnpm`

### Installation
```bash
# 1. Navigate to frontend directory
cd weavly-client/LUXZERA/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
```

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_ZYRA_API_URL=http://localhost:5001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Development Server
```bash
# Start Next.js development server
npm run dev
```
The application will be available at **`http://localhost:3000`**.

### Building for Production
```bash
# Build production bundle
npm run build

# Start production server
npm run start
```