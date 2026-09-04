# ⚙️ Weavly Server — Enterprise Commerce & Recommendation Engine

> **High-performance, secure backend commerce engine and personalization orchestrator built on Java 21 and Spring Boot 3.3.**

---

## 🏛️ 1. Architecture & Domain Design

The **Weavly Server** (`weavly-server`) is the authoritative source of truth for user authentication, biometric fit profiles, product catalogs, designer ateliers, custom garment orders, escrow payments, and recommendation dispatching.

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                 LUXZERA CLIENT (3000)                  │
                                  │           Next.js 14 • React • Tailwind • 3D           │
                                  └──────────────────────────┬─────────────────────────────┘
                                                             │ REST / JSON (Port 8081)
                                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         WEAVLY SERVER (SPRING BOOT 3.3)                                          │
├────────────────────────────────┬────────────────────────────────┬────────────────────────────────────────────────┤
│ 🔐 Auth & Security Module      │ 👤 User & Profile Module       │ 🧠 Zyra Recommendation Module                  │
│ • JWT Tokens (HS256)           │ • User Profile & Identity      │ • Zyra V2 Proxy Client (Port 5001)             │
│ • Google OAuth2 Verification   │ • 15-Point Fit & Style Data    │ • On-Demand Occasion Generation                │
│ • Role-Based Access Control    │ • Multi-Image Style Gallery    │ • Gender & Budget Context Conditioning         │
│ • Threat & Audit Telemetry     │ • Address & Measurement Store  │ • Relational Recommendation Persistence        │
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────────────────────┤
│ 👗 Product & Catalog Module    │ 🎨 Designer & Atelier Studio   │ 💳 Orders, Cart & Escrow Module                │
│ • Categorical Taxonomy         │ • Creator Portfolios           │ • Cart & Wishlist Sync                         │
│ • Inventory & Variant Stock    │ • Custom Design Request Flow   │ • Order Lifecycle Management                   │
│ • Optimistic Locking Version   │ • Proposal & Milestone Escrow  │ • Transaction & Invoice Dispatch               │
└────────────────────────────────┴────────────────────────────────┴────────────────────────────────────────────────┘
                                 │                                │
                                 ▼                                ▼
┌─────────────────────────────────────────────────┐   ┌────────────────────────────────────────────────────────────┐
│         SUPABASE POSTGRESQL 16 (DB)             │   │             CLOUDFLARE R2 OBJECT STORAGE                   │
│ • users, user_profiles, user_fit_data           │   │ • User avatars & portraits                                 │
│ • products, product_variants, orders            │   │ • User style inspiration lookbook photos                   │
│ • user_recommendation_generations & items       │   │ • Designer garment portfolios & bespoke sketches           │
└─────────────────────────────────────────────────┘   └────────────────────────────────────────────────────────────┘
```

---

## 🚀 2. Core Modules Breakdown

### 🔐 1. Authentication & Security (`com.luxzera.server.auth`)
- **Stateless JWT Authentication**: Issues standard signed HMAC-SHA256 bearer tokens with 24-hour expiration.
- **Role-Based Access Control (RBAC)**: Enforces permissions across roles: `CUSTOMER`, `DESIGNER`, `ADMIN`, `SUPER_ADMIN`.
- **Security Audit Logger**: Records every administrative login attempt, data export, product modification, and status change.

### 👤 2. User Profiles & Fit Data (`com.luxzera.server.user`)
- **`UserProfile` Entity**: Handles phone numbers, canonical gender (`MALE`, `FEMALE`, `OTHER`), date of birth (DOB), biography, avatar URL, and onboarding completion flags.
- **`UserFitData` Entity**: Stores the comprehensive 15-point questionnaire:
  - Top size, Bottom size, Shoe size.
  - Height range & approximate weight range.
  - Fit preferences (`Relaxed`, `Regular`, `Slim`, `Oversized`, `Tailored`, `Athletic`).
  - Preferred & avoided fashion styles.
  - Preferred & avoided clothing types.
  - Preferred & avoided color palettes.
  - Occasions & primary occasion selection.
  - Budget tier & shopping priorities.
- **`UserRecommendationImage` Entity**: Ingests style inspiration and moodboard photos, uploading to Cloudflare R2 and linking to the user profile for Zyra visual conditioning.

### 🧠 3. Zyra Recommendation Service (`com.luxzera.server.zyra`)
- **Live On-Demand Generation**: When a user selects any of the 8 canonical occasions (`college`, `casual`, `party`, `formal`, `wedding`, `date`, `work`, `sport`), the service generates fresh recommendations on demand via Zyra V2 rather than serving stale historical mocks.
- **Context-Aware Gender Conditioning**: Combines the user's personal identity profile with the active browsing section (e.g. Men's vs Women's shelf) to guarantee 0% cross-gender leakage.
- **Atomic Persistence**: Persists each generation and its ranked items into `user_recommendation_generations` and `user_recommendation_generation_items`.

### 🎨 4. Designer & Customization Platform (`com.luxzera.server.designer`)
- **Atelier Onboarding**: Review and approve independent fashion designer applications.
- **Custom Design Workflow**: Structured multi-stage milestone request pipeline between customers and verified designers.

---

## 🛠️ 3. Key Issues Resolved & Engineering Hardening

1. **Entity Getter Mismatch Fix**:
   - Resolved compiler error in `ZyraRecommendationServiceImpl.java` by replacing incorrect `.getProductId()` calls with the canonical `.getRecommendedProductId()` from `UserRecommendationItemEntity`.
2. **Mock Dependency Injection in Tests**:
   - Injected missing dependencies (`UserRecommendationImageRepository`, `UserMetadataRepository`) and added an explicit constructor to `ZyraRecommendationServiceImpl` so unit tests execute cleanly across all environments.
3. **Purged Stale September 1st Mock Recommendations**:
   - Removed legacy static 98% recommendation rows from Supabase PostgreSQL, restoring live continuous similarity scoring ($60\% - 75\%$).
4. **Occasion Caching Elimination**:
   - Updated `getLatestUserRecommendations` to generate fresh items on demand per occasion query.

---

## 🧪 4. Testing & Validation

The server contains a comprehensive unit and integration test suite with **191 / 191 tests passing**:

```bash
# Execute entire test suite
./mvnw test

# Compile and package production JAR
./mvnw clean package -DskipTests
```

### Test Coverage Highlights:
- **`ZyraUserRecommendationPersistenceTest`**: Verifies user isolation, generation persistence, cross-user access prevention, and recommendation mapping.
- **`ZyraRecommendationControllerTest`**: Validates authenticated `/api/recommendations/my`, public `/api/recommendations/occasion/{occ}`, and product-based recommendation endpoints.
- **`DesignerOwnershipAndLifecycleTest`**: Tests multi-stage designer garment publishing and permissions.
- **`UserFitDataServiceImplTest`**: Ensures all 15 questionnaire dimensions serialize and persist cleanly.

---

## 🔌 5. API Reference Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT token |
| `GET` | `/api/profile/me` | Customer | Fetch current user profile |
| `PUT` | `/api/profile/me` | Customer | Update profile details (phone, DOB, gender, avatar) |
| `GET` | `/api/fit-data/me` | Customer | Retrieve 15-point user fit data |
| `PUT` | `/api/fit-data/me` | Customer | Save user fit & style preferences |
| `POST` | `/api/recommendation-images/me` | Customer | Upload style inspiration photo to R2 |
| `GET` | `/api/recommendation-images/me` | Customer | List user's uploaded inspiration images |
| `GET` | `/api/recommendations/my?occasion={occ}` | Customer | Fetch live personalized occasion recommendations |
| `POST` | `/api/recommendations/generate` | Customer | Trigger on-demand recommendation generation |
| `GET` | `/api/recommendations/occasion/{occ}?gender={g}` | Public | Public occasion recommendations |
| `GET` | `/api/recommendations/product/{productId}` | Public | Similar product recommendations |

---

## ⚙️ 6. Environment Configuration

Create a `src/main/resources/application.properties` or provide environment variables:

```properties
server.port=8081
spring.datasource.url=jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require
spring.datasource.username=postgres
spring.datasource.password=<DB_PASSWORD>
jwt.secret=<JWT_SECRET_KEY>
jwt.expiration=86400000

# Zyra Python ML Service URL
zyra.flask.base-url=http://localhost:5001
zyra.flask.connect-timeout-ms=5000
zyra.flask.read-timeout-ms=15000

# Cloudflare R2 Media Storage
cloudflare.r2.endpoint=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
cloudflare.r2.access-key=<R2_ACCESS_KEY>
cloudflare.r2.secret-key=<R2_SECRET_KEY>
cloudflare.r2.bucket-name=weavly-media
cloudflare.r2.public-url=https://media.weavly.store
```

---

## 🏃 7. Running Locally

```bash
# Start server with Maven wrapper
./mvnw spring-boot:run
```
Server boots on port **`8081`** (or configured `server.port`).