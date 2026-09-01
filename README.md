# inkdabba-hub

Minimalist operations hub and dashboard for Inkdabba, built with **React**, **Vite**, **Tailwind CSS v4**, **TypeScript**, **Node/Express**, and **MongoDB**.

## Design System & Aesthetics

- **Base Background**: `#F7F5F1` (warm off-white)
- **Text**: `#1A1A1A` (high-contrast charcoal/black)
- **Primary Accent**: `#2B4C7E` (ink-blue)
- **Aesthetic**: Light, airy, high-contrast, generous spacing, uncluttered typography.
- **Typography**: Plus Jakarta Sans & JetBrains Mono

## Architecture & Layout

- **Left Sidebar**:
  - Logo mark: **"ID"**
  - Navigation:
    - **Today**: Daily focus, priorities, shift pace, and press line statuses.
    - **Dashboard**: High-level operational metrics, live job pipeline, and highlights.
    - **My Tasks**: Interactive task checklist, status filtering, and task creation.
    - **Team View**: Read-only studio workload overview with a top summary bar (Total Active, In-Review, Due Today, Overdue) and tasks grouped by person with semantic status pills, source labels, due dates, and visual overdue flags.
    - **Completed Tasks**: Audit log of resolved print runs and deliveries with reopen support.
    - **TV Mode (`/tv`)**: Dedicated full-screen studio broadcast route designed as a fixed **2x2 grid filling the full viewport (`overflow: hidden`, no scrolling)**:
       - **Box 1 (Top-Left) — "Leave & Present"**: High-contrast ink-blue header (`text-[#1E3558]`), massive present count (`X/Y Present Today`), avatar row with non-overlapping icon-only leave badges (moon icon for full leave, half-filled circle for half leave, text shown on tooltip); navigates to `/leave` on tap.
      - **Box 2 (Top-Right) — "Clients"**: High-contrast ink-blue header, up to 4 compact client cards with status pills, industry, and colored department dots, a "+N more" badge if over 4, and a full department dot color legend key at the bottom; navigates to `/clients` on tap.
      - **Box 3 (Bottom-Left) — "Today's Team Tasks"**: High-contrast ink-blue header, three large responsive numbers (**Done, Active, Review**) that fit without overflowing at any resolution; navigates to `/team-view` on tap.
      - **Box 4 (Bottom-Right) — "Studio Culture & Host"**: High-contrast ink-blue header, `here.png` host character image sized with responsive constraints, and guaranteed quote display in bold solid text (`#1A1A1A`) from `quotes.ts` / `quotes.js` (50 quotes). Automatically rotates every 45s or toggles to a fixed "Quote of the Day" (based on date, changing at midnight), with click-to-cycle support.
      - **Layout Consistency**: All 4 boxes share the same border-radius (`rounded-3xl`), padding, and border styling with zero viewport scrollbars and 30s auto-refresh polling.
- **Main Content Area**: Clean padding, sticky header, live date, and view-specific components.
- **Animated Splash Screen (`SplashScreen.tsx`)**:
  - Shown once when the app first loads (or upon first login).
  - Built with **Framer Motion** (`AnimatePresence`, spring transitions).
  - Character (`welcome.png`) smoothly fades and slides in from the left.
  - Animated **"Welcome to InkDabba"** heading with dynamic typewriter effect next to her hands.
  - Auto-transitions into the Login page (if unauthenticated) or Dashboard (if authenticated) after ~2.4s, or immediately upon tapping/clicking anywhere.
- **Character Empty States (`hi.png`)**:
  - Replaced generic checkmark icons across all empty states with the friendly waving character illustration (`hi.png`).
  - Implemented across **My Tasks** (*"All clear! Nothing on your plate right now"*), **Dashboard Page View**, **Today View**, **Team View**, **Completed Tasks**, and the **Header Notifications Popover**.
- **Frontend Authentication & Protected Routes**:
  - **`AuthContext` (`src/context/AuthContext.tsx` & `src/context/useAuth.ts`)**: Manages session state (`currentUser`, `token`, `isAuthenticated`, `login`, `logout`), decodes and validates JWT expiration in the browser.
  - **`LoginPage` (`/login`)**: Calls `POST /api/auth/login`, persists JWT in `localStorage`, and redirects to `/dashboard`. Includes 1-click demo access for both Admin and Member roles.
  - **`RegisterPage` (`/register`)**: Calls `POST /api/auth/register`, creates account, saves JWT, and redirects to `/dashboard`.
  - **`ProtectedRoute` (`/dashboard`)**: Guard component that verifies the JWT token; automatically redirects unauthenticated traffic to `/login`.
  - **Sign Out**: Clean logout button integrated in the sidebar profile footer and the greeting header.
- **Unified Dashboard Page (`DashboardPageView.tsx`)**:
  - **Greeting Header**: Personalized greeting with logged-in user name, role badge (`admin` / `member`), date, and sign-out action.
  - **Four Stat Cards (Total, Done, Active, Overdue)**: Computed strictly from the logged-in user's own queue (`GET /api/tasks/mine`).
  - **Quick-Add Task Bar**: Inline input posting to `POST /api/tasks`. Defaults category to `Design` matching established agency taxonomy (Social, Shoot, Video, Design, Ads, Meeting, Web Dev, App Dev). Defaults assignee to caller; admins can optionally assign to any operator.
  - **User Selector ("Viewing as:")**: Clearly labeled in the top header and on the Today page (`Viewing as: [Avatar Name ▼]`) to allow admins/operators to inspect another user's schedule and focus.
  - **Admin Tab Toggle**: When logged in as `admin`, displays a tab toggle between **My Tasks** (`GET /api/tasks/mine`) and **Everyone's Tasks** (`GET /api/tasks`). Non-admin members see only their tasks without the toggle.
  - **Status Pills**:
    - 🟢 **Green**: Completed
    - 🔵 **Blue**: Active
    - 🟠 **Amber**: Review / Revisions
    - 🔴 **Red**: Overdue (past `dueDate` and uncompleted)
- **Attendance & Leave Status Visuals (Team View & TV Mode)**:
  - **Full-day leave (`type: "full"`)**:
    - Grayscale + reduced-opacity (`grayscale opacity-60`) filter applied to whole person card.
    - Small pulsing "Away" badge with icon and subtle fade in/out animation (`animate-pulse-subtle`).
  - **Half-day leave (`type: "half"`)**:
    - Person card split into two vertical halves: left half normal colorful styling, right half grayscale.
    - Thin animated highlight line that slowly sweeps left-to-right across the divider on a continuous loop (`animate-sweep-divider`).
- **Team View Contrast Audit & Category-Color-Coding**:
  - **Text Contrast Audit**: Employee names render in solid `#1A1A1A` (`font-black text-xl`) with high-contrast text across all subheadings, badges, and card backgrounds.
  - **Category Color System**:
    - `social` / `content` = **Purple** (`#A855F7`)
    - `shoot` = **Coral** (`#F47266`)
    - `video` = **Orange** (`#F97316`)
    - `design` = **Pink** (`#EC4899`)
    - `ads` = **Teal** (`#14B8A6`)
    - `meetings` = **Amber** (`#F59E0B`)
    - `web dev` = **Blue** (`#3B82F6`)
    - `app dev` = **Indigo** (`#6366F1`)
  - **Visual Elements**:
    - **Task Cards**: Left colored border (`border-l-4`) and matching category badge tag.
    - **Operator Names**: Small colored dots next to each operator's name representing the specific categories they are actively working in.

## Backend & Database (Node / Express / MongoDB)

### MongoDB Models
- **`Client`** (`server/models/Client.js`):
  - `name` (String, required, trim)
  - `industry` (String, required, trim)
  - `status` (Enum: `["active", "onboarding", "paused"]`, default: `"active"`)
  - `createdAt` (Date, default: `Date.now`)
- **`Task`** (`server/models/Task.js`):
  - `title` (String, required)
  - `description` (String)
  - `category` (String, enum/spec categories: `social`, `shoot`, `video`, `design`, `ads`, `meeting`, `webdev`, `appdev`)
  - `client` (ObjectId, ref: `Client`)
  - `assignee` (ObjectId, ref: `User`)
  - `status` (Enum: `["active", "review", "revisions", "completed"]`, default: `"active"`)
  - `dueDate` (Date)
  - `completedAt` (Date, default: `null`, automatically managed via Mongoose pre-save hook on status changes)
  - `createdAt` (Date, default: `Date.now`)
- **`User`** (`server/models/User.js`):
  - `name` (String, required, trim)
  - `email` (String, required, unique, lowercase, trim)
  - `password` (String, required, hashed with bcrypt via pre-save hook)
  - `role` (String, enum: `["member", "admin"]`, default: `"member"`)
  - `designation` (String, e.g. "Social Media Executive", "Video Editor", "Web Developer")
- **`Leave`** (`server/models/Leave.js`):
  - `user` (ObjectId, ref: `User`, required)
  - `date` (Date, required, defaults to start of today)
  - `type` (Enum: `["full", "half"]`, required)
  - `reason` (String)
  - `createdAt` (Date, default: `Date.now`)

### REST API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user; hashes password with bcrypt, returns 7-day JWT with `{ id, role }` |
| `POST` | `/api/auth/login` | Authenticate user; verifies password with bcrypt, returns 7-day JWT with `{ id, role }` |
| `GET` | `/api/auth/me` | Protected route (requires `Bearer <token>`); returns `userId`, `userRole`, and user profile |
| `GET` | `/api/tasks/mine` | Protected route; retrieves tasks assigned to authenticated user (`assignee = req.userId`) |
| `GET` | `/api/tasks` | Protected route; retrieves all tasks across all users (**admin only**; returns 403 for members) |
| `POST` | `/api/tasks` | Protected route; creates task (assignee defaults to `req.userId` unless admin specifies another user) |
| `PATCH` | `/api/tasks/:id/status` | Protected route; updates task status (**only assignee or admin**; returns 403 otherwise) |
| `GET` | `/api/clients` | Retrieve all clients (`name`, `industry`, `status`) |
| `POST` | `/api/clients` | Register a new client |
| `GET` | `/api/leaderboard` | Aggregates completed tasks per user (`?range=day\|week\|month`), sorted by count descending |
| `GET` | `/api/leave/today` | Retrieve today's leave entries with populated operator details |
| `POST` | `/api/leave` | Record leave entry (**admin only**; requires `{ user, type: 'full'\|'half', date?, reason? }`) |
| `GET` | `/api/users` | Retrieve all studio team members |
| `POST` | `/api/users` | Register a new user |
| `GET` | `/api/health` | Service health and uptime |

### Authentication Middleware
- Located at [`server/middleware/auth.js`](file:///E:/Inkdabba/Dashboard/server/middleware/auth.js).
- Verifies the `Authorization: Bearer <token>` header against `JWT_SECRET`.
- Attaches `req.userId` and `req.userRole` to the Express request.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or remote URI

### Environment Configuration
The application reads from `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inkdabba-hub
MONGODB_URI=mongodb://127.0.0.1:27017/inkdabba-hub
JWT_SECRET=inkdabba_jwt_secret_token_key_2026_production_vault
```

### Seeding Sample Data
Populate MongoDB with sample studio operators and tasks across all statuses:
```bash
npm run seed
```

### Running the App
- **Start both Frontend and Backend concurrently**:
  ```bash
  npm run dev:all
  ```
- **Or run them independently**:
  ```bash
  # Terminal 1: Backend API (http://localhost:5000)
  npm run server:dev

  # Terminal 2: Frontend Vite app (http://localhost:5173)
  npm run dev
  ```

### Production Build
```bash
npm run build
npm run preview
```

### Code Quality & Linting
```bash
npm run lint
```
