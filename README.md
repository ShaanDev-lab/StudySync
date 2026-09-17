# 📚 StudySync

> An intelligent student productivity app — manage assignments, detect deadline collisions, get automated reschedule suggestions, and track study sessions with a built-in Pomodoro timer.

---

## Table of Contents

- [Literature Survey](#literature-survey)
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
  - [Production Build](#production-build)
- [Authentication](#authentication)
- [Contributing](#contributing)

---

## Literature Survey

**Intelligent Academic Workload Balancing, Conflict Scheduling, and Focused Time Tracking**

> *Minor Project — Academic Documentation*

### 1. Introduction & Background Context

Higher education students routinely manage overlapping demands across multiple courses, including continuous assessments, laboratory evaluations, semester projects, quizzes, and end-term examinations. As academic workloads become increasingly decentralized across diverse Learning Management Systems (LMS) and communication channels, students face significant cognitive overload, suboptimal time allocation, and elevated stress levels.

Traditional productivity tools fall broadly into two categories:

- **Generic Task Management Applications** (e.g., Todoist, Notion, Trello), which lack academic context, treat all deadlines uniformly, and provide no automated collision detection.
- **Institutional Learning Management Systems** (e.g., Canvas, Moodle, Blackboard), which act as passive submission portals without cross-course conflict analysis, personal prioritization models, or focus-tracking capabilities.

**StudySync** bridges this gap by introducing an automated, academic-aware scheduling platform equipped with:

- **Relational Deadline Collision Detection** (≤ 24 hours thresholding via SQL self-joins)
- **Multicriteria Priority Computation** (`category_weight × estimated_effort`)
- **Automated Non-Conflicting Rescheduling via Greedy Heuristic Algorithm**
- **Integrated Pomodoro Time-Boxing with Analytics**

This survey provides a comprehensive review of existing literature, algorithmic paradigms, comparative analysis with commercial tools, and an identification of research gaps that justify the architecture of StudySync.

---

### 2. Theoretical Foundations

| Theory / Model | Proponents / Foundation | Relevance to StudySync |
|---|---|---|
| **Cognitive Load Theory (CLT)** | Sweller (1988), Paas et al. (2003) | When students manage multiple conflicting deadlines simultaneously, *extraneous cognitive load* spikes, impairing retention and task execution. Visual analytics and proactive clash alerts reduce extraneous processing. |
| **Temporal Motivation Theory (TMT)** | Steel (2007) | Perceived utility drops when deadlines are distant or vague. Automated priority scoring and relative countdown timers mitigate procrastination by increasing perceived urgency. |
| **Eisenhower Decision Matrix & MCDM** | Eisenhower (1954), Covey (1989) | Separates tasks along urgency and importance axes. StudySync operationalizes this into a deterministic numeric function: `Priority = f(Category Weight, Estimated Effort)`. |
| **Time-Boxing & Attention Restoration** | Cirillo (2006), Kaplan (1995) | The Pomodoro Technique segments sustained mental effort into 25-minute intervals with structured breaks, preventing cognitive fatigue and task abandonment. |

---

### 3. Thematic Literature Review

#### 3.1 Academic Task Scheduling & Resource-Constrained Project Scheduling (RCPSP)

In operations research and computer science, student workload management maps to the classical **Resource-Constrained Project Scheduling Problem (RCPSP)** (Brucker et al., 1999). A student represents a single resource with finite daily cognitive capacity measured in focused hours.

When multiple academic deliverables demand overlapping cognitive allocations within the same time window, conventional static calendars fail because they treat time purely as a container rather than a constrained cognitive resource (Bedworth & Bailey, 1982). Research demonstrates that uncoordinated deadline clustering leads to the *"student syndrome"* (Goldratt, 1997), where effort is postponed until the absolute temporal boundary, causing substandard work and academic burnout.

#### 3.2 Temporal Conflict & Collision Detection in Scheduling Systems

Collision detection has been widely studied in spatial computing and distributed workflow systems (Allen, 1983; Chittaro & Doerr, 2000). Allen's **Interval Temporal Logic** formalizes relationships between time intervals (e.g., *Before*, *Meets*, *Overlaps*, *During*, *Finishes*).

In academic workflows, deadlines are point timestamps, but the preparation interval is an extended prior envelope. A **temporal collision** occurs when two deadlines fall within a 24-hour window of each other. While enterprise project management systems (such as Jira or Microsoft Project) employ complex critical path methods (CPM) and PERT charts, these systems introduce high friction and are too cumbersome for undergraduate students. StudySync resolves this by embedding collision detection directly into the relational database layer via a high-performance **self-join query**:

```sql
SELECT t1.id, t2.id
FROM tasks t1, tasks t2
WHERE t1.id < t2.id
  AND ABS(TIMESTAMPDIFF(SECOND, t1.deadline, t2.deadline)) < 86400
  AND t1.user_id = t2.user_id
```

#### 3.3 Automated Task Prioritization & Multicriteria Decision Making (MCDM)

Traditional to-do applications rank tasks solely by deadline order or manual drag-and-drop flags. However, Keeney & Raiffa (1993) establish that single-variable utility functions fail when tasks differ fundamentally in academic consequence and effort intensity.

An exam worth 40% of a final grade requiring 10 hours of study cannot be equated with a routine homework assignment due on the same day. StudySync translates MCDM principles into an automated database-stored generated column:

| Category | Weight |
|---|:---:|
| Exam | 4 |
| Quiz | 3 |
| Project | 2 |
| Assignment / Lab / Viva | 1 |

```
Priority Score = Category Weight × Estimated Effort  (Effort ∈ [1, 10])
```

This ensures that the "Start This First" recommendation engine automatically elevates high-stakes, high-effort academic obligations over trivial tasks without requiring manual re-sorting by the student.

#### 3.4 Automated Rescheduling Algorithms

When a conflict is detected, resolving the collision requires determining:

1. **Which task to shift:** Retaining the higher priority task and adjusting the lower priority one.
2. **Where to shift:** Searching forward sequentially for the nearest collision-free day — the first future date where the rescheduled task has no deadline within 24 hours of any other task.

StudySync implements this as a **greedy forward-search heuristic** directly in the backend model layer. When a clash is identified, the system evaluates consecutive future dates beginning from the original deadline, checking each proposed date against all existing user tasks. The first date with no proximity conflicts is stored as an actionable reschedule suggestion in the `reschedule_suggestions` table, which the student can accept or reject with a single click.

#### 3.5 Pomodoro Technique & Attention Restoration in Digital Workspaces

Digital environments are characterized by frequent context-switching and digital distractions (Mark et al., 2008). Cirillo's Pomodoro Technique enforces focused cognitive bursts (typically 25 minutes) punctuated by short restorative breaks (5 minutes). Empirical research by Biwer et al. (2020) demonstrates that students who utilize structured time-boxing maintain higher self-regulation and report lower fatigue during intensive exam preparation.

Existing standalone timer apps (e.g., Forest, Pomofocus) operate in isolation from the student's task registry. StudySync closes this feedback loop by logging each timer session directly against a task ID, enabling rolling 7-day effort distributions per subject.

---

### 4. Comparative Analysis of Existing Systems

| Feature / Dimension | Google Calendar | Todoist | Notion / Trello | Canvas / Moodle LMS | MyStudyLife | **StudySync** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Automated Deadline Collision Detection** | ❌ None | ❌ None | ❌ None | ❌ None | ⚠️ Manual overlap view | ✅ SQL Self-Join Alerting (≤ 24 h) |
| **Weighted Academic Priority Scoring** | ❌ None | ⚠️ Static tags (P1–P4) | ⚠️ Requires manual formula build | ❌ None | ❌ None | ✅ Automated (W_cat × Effort) |
| **Heuristic Reschedule Suggestions** | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Greedy forward slot search |
| **Built-in Task-Linked Pomodoro Timer** | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Integrated with per-task DB logging |
| **Weekly Study Analytics & Time Tracking** | ❌ None | ⚠️ Karma streaks only | ⚠️ Custom DB rollups | ⚠️ Course-level logins only | ❌ None | ✅ Rolling 7-day focused minutes aggregation |
| **Cross-Course Conflict Visualization** | ⚠️ Color blocks only | ❌ None | ⚠️ Custom views | ❌ Isolated by course | ⚠️ Timetable only | ✅ Clash Banners & Clashing Badges |

---

### 5. Critical Research & Industry Gaps

From the literature and market review, four primary gaps are identified:

1. **Gap 1 — Absence of Proactive Collision Detection:** Standard digital calendars treat deadlines as isolated calendar points. They do not calculate temporal density metrics to alert the user when two high-stakes deliverables occur within 24 hours of each other.
2. **Gap 2 — Superficial Task Prioritization:** Generic to-do lists treat all tasks equally or depend on manual P1–P4 tags, ignoring the actual academic weight (an exam vs. a homework) and required effort intensity.
3. **Gap 3 — Lack of Proactive Conflict Resolution:** When a clash occurs, conventional software places the entire rescheduling burden on the student. A well-designed system should automatically evaluate open time windows and present one-click actionable remedies.
4. **Gap 4 — Disconnected Task Registry and Execution Timer:** Students plan in one app (Todoist/Trello) and track time in another (Pomofocus/Forest). Study time metrics are never mapped back to academic deliverables, preventing reflection on actual vs. planned effort.

---

### 6. How StudySync Addresses These Gaps

1. **Database-Engineered Urgency (MySQL Generated Columns):** Category weights and composite priority scores are computed directly inside the relational schema (`STORED GENERATED ALWAYS AS`), eliminating sorting bottlenecks on the client.
2. **Deterministic Collision Detection:** A relational self-join query filtered by `ABS(TIMESTAMPDIFF(SECOND, a.deadline, b.deadline)) < 86400` automatically identifies conflicting task pairs for the authenticated user.
3. **Automated Non-Conflicting Slot Discovery:** When clashes are detected, the backend heuristic searches future calendar dates sequentially until a date with zero proximity conflicts is found, storing the result in `reschedule_suggestions`.
4. **Closed-Loop Pomodoro Logging:** Timer sessions write directly to `pomodoro_sessions(task_id, user_id, duration_minutes)`. The rolling 7-day aggregation enables immediate weekly focus audits per task and subject.
5. **High-Performance Client Architecture:** React 19 with route-level code-splitting (`React.lazy`), memoized calendar day lookups, and `useCallback`-stabilized context functions ensure zero UI lag.

---

### 7. Conclusion & Future Research Directions

This literature survey establishes that while digital task management is a mature market, intelligent domain-specific academic scheduling remains severely underserved. Traditional applications fail to mitigate cognitive overload because they lack automated deadline collision detection, structured priority scoring, and integrated focus analytics. StudySync synthesizes concepts from Operations Research, Cognitive Load Theory, Multicriteria Decision Making, and the Pomodoro Technique into a cohesive web application appropriate in scope for a minor project.

**Future research directions:**

1. **ML-Based Effort Prediction:** Dynamically adjusting `estimated_effort` based on a student's historical Pomodoro duration logs for similar course categories.
2. **Two-Way CalDAV / iCalendar Synchronization:** Bi-directional sync with Google Calendar, Apple Calendar, and Canvas iCal feeds to automatically import syllabus deadlines.
3. **Multi-User Collaborative Clash Detection:** Extending conflict queries across study groups or university cohorts to prevent scheduling clashes for collaborative team deliverables.
4. **Wearable Integration:** Correlating focus session completion rates with biometric markers (e.g., sleep quality from smartwatches) to optimize recommended daily study windows.

---

### 8. Academic References (IEEE Style)

1. J. Sweller, "Cognitive load during problem solving: Effects on learning," *Cognitive Science*, vol. 12, no. 2, pp. 257–285, 1988.
2. P. Steel, "The nature of procrastination: A meta-analytic and theoretical review of quintessential self-regulatory failure," *Psychological Bulletin*, vol. 133, no. 1, pp. 65–94, 2007.
3. P. Brucker, A. Drexl, R. Möhring, K. Neumann, and E. Pesch, "Resource-constrained project scheduling: Notation, classification, models, and methods," *European Journal of Operational Research*, vol. 112, no. 1, pp. 3–41, 1999.
4. J. F. Allen, "Maintaining knowledge about temporal intervals," *Communications of the ACM*, vol. 26, no. 11, pp. 832–843, 1983.
5. F. Cirillo, *The Pomodoro Technique: The Acclaimed Time-Management System That Has Transformed How We Work*, New York: Currency, 2006.
6. E. M. Goldratt, *Critical Chain*, Great Barrington, MA: North River Press, 1997.
7. T. L. Saaty, "What is the Analytic Hierarchy Process?," in *Mathematical Models for Decision Support*, Berlin, Heidelberg: Springer, 1988, pp. 109–121.
8. R. L. Keeney and H. Raiffa, *Decisions with Multiple Objectives: Preferences and Value Trade-Offs*, Cambridge University Press, 1993.
9. F. Biwer, M. G. A. de Bruin, E. Schreurs, and L. de Grave, "Fostering students' self-regulation in higher education: Evaluation of a time-management intervention," *Frontiers in Education*, vol. 5, p. 117, 2020.
10. G. Mark, D. Gudith, and U. Klocke, "The cost of interrupted work: More speed and stress," in *Proc. SIGCHI Conf. on Human Factors in Computing Systems (CHI 08)*, pp. 107–110, 2008.

---

## Overview

StudySync is a full-stack web application built for students to stay on top of their academic workload. It allows you to organise tasks by subject, spot deadline conflicts before they become a problem, and get automated reschedule suggestions powered by an algorithmic conflict-resolution heuristic. A built-in **Pomodoro timer** lets you log focused study sessions directly against tasks.

The app uses **Clerk** for authentication and a **MySQL** database to persist all data. The backend follows an **MVC (Model-View-Controller)** architecture served by an **Express** server, while the frontend is a **React 19 + Vite** single-page application styled with **Tailwind CSS**.

---

## Features

| Feature | Description |
|---|---|
| 🗂️ **Task Management** | Create, edit, delete and filter tasks by subject, type (`Assignment`, `Exam`, `Lab`, `Viva`), and category. |
| ⚠️ **Deadline Collision Detection** | Automatically detects pairs of tasks whose deadlines fall within 24 hours of each other and raises alerts. |
| 💡 **Smart Reschedule Suggestions** | Evaluates priority scores and searches for the nearest non-conflicting time slots for clashing tasks. Accept or reject them with one click. |
| 📅 **Calendar View** | Visualises all upcoming deadlines on an interactive monthly calendar. |
| 📊 **Analytics Dashboard** | Breaks down your tasks by category and priority score (Critical / Moderate / Routine) with visual bar charts. |
| ⏱️ **Pomodoro Timer** | Configurable focus / short-break / long-break timer with automatic session logging per task. |
| 🌙 **Dark Mode** | System-aware dark/light theme with manual toggle. |
| 🔐 **Authentication** | Secure sign-in/sign-up via Clerk. All API endpoints are protected by a custom email-based auth middleware. |

---

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [React Router DOM v7](https://reactrouter.com/) | Client-side routing |
| [Vite 6](https://vite.dev/) | Build tool & dev server |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Clerk React](https://clerk.com/docs/references/react/overview) | Authentication UI & session management |
| [Motion (Framer Motion)](https://motion.dev/) | Animations |
| [Lucide React](https://lucide.dev/) | Icon set |
| [date-fns](https://date-fns.org/) | Date formatting utilities |

### Backend
| Library | Purpose |
|---|---|
| [Express 4](https://expressjs.com/) | HTTP server & routing |
| [mysql2](https://github.com/sidorares/node-mysql2) | MySQL client with promise support |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable loading |
| [cors](https://github.com/expressjs/cors) | Cross-Origin Resource Sharing |
| [tsx](https://github.com/privatenumber/tsx) | TypeScript execution for Node.js |

### Language & Tooling
- **TypeScript 5.8** — end-to-end type safety
- **MySQL** — relational database

---

## Project Structure

```
StudySync/
├── server.ts               # Express entry point — mounts middleware, routes, and Vite dev server
├── vite.config.ts          # Vite build configuration (React plugin, Tailwind, path aliases)
├── tsconfig.json           # TypeScript configuration
├── schema.sql              # Database DDL — tables, generated columns, collision query
├── .env.example            # Template for required environment variables
│
├── config/
│   └── db.ts               # MySQL connection pool factory
│
├── models/                 # Data access layer (raw SQL queries)
│   ├── taskModel.ts        # CRUD + deadline clash detection & heuristic rescheduling
│   ├── subjectModel.ts     # Subject CRUD
│   ├── userModel.ts        # User lookup / upsert
│   ├── pomodoroModel.ts    # Pomodoro session logging & weekly stats
│   ├── alertModel.ts       # Collision alert persistence
│   └── suggestionModel.ts  # Reschedule suggestion CRUD
│
├── controllers/            # Request handlers (MVC controllers)
│   ├── taskController.ts
│   ├── subjectController.ts
│   ├── suggestionController.ts
│   └── pomodoroController.ts
│
├── routes/                 # Express routers
│   ├── taskRoutes.ts
│   ├── subjectRoutes.ts
│   ├── userRoutes.ts
│   ├── suggestionRoutes.ts
│   └── pomodoroRoutes.ts
│
└── src/                    # React frontend (SPA)
    ├── main.tsx            # App entry — wraps with ClerkProvider & ThemeProvider
    ├── App.tsx             # Route definitions with lazy loading & Suspense
    ├── types.ts            # Shared TypeScript types
    │
    ├── pages/
    │   ├── DashboardPage.tsx   # Overview stats, task list, collision alerts, suggestions
    │   ├── TasksPage.tsx       # Full task list with filters and CRUD
    │   ├── CalendarPage.tsx    # Monthly calendar view of deadlines
    │   ├── AnalyticsPage.tsx   # Category & priority breakdown charts
    │   ├── PomodoroPage.tsx    # Pomodoro timer with session logging
    │   └── LoginPage.tsx       # Clerk sign-in/sign-up landing
    │
    ├── contexts/
    │   └── CollisionContext.tsx # Global data provider — tasks, subjects, clashes, suggestions
    │
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.tsx       # Shared navigation bar
    │   │   └── ThemeToggle.tsx  # Dark/light mode switcher
    │   ├── dashboard/
    │   │   └── SectionStat.tsx  # Metric card component
    │   └── tasks/
    │       ├── TaskCard.tsx               # Task display card
    │       ├── TaskFormModal.tsx          # Task creation/editing dialog
    │       ├── RecommendationCard.tsx     # High priority recommendation
    │       ├── SubjectModal.tsx           # Subject management dialog
    │       └── DeleteConfirmationModal.tsx # Delete confirmation dialog
    │
    ├── hooks/              # Custom React hooks
    ├── providers/          # ThemeProvider (dark/light mode)
    ├── types/              # Additional TypeScript type definitions
    └── utils/              # Shared utility functions
```

---

## Database Schema

The MySQL database (`deadline_db`) contains five tables:

```
users ──┐
        └── subjects ──┐
                       └── tasks ──┬── collision_alerts (self-join on tasks)
                                   └── reschedule_suggestions
```

### Key design decisions

- **`tasks.priority_score`** — a MySQL **generated stored column** that multiplies a `category_weight` by `estimated_effort` (1–10 scale), so sorting by urgency requires no application logic.
- **`tasks.category_weight`** — also a generated column: `Exam=4`, `Quiz=3`, `Project=2`, `Assignment/other=1`.
- **Collision detection** — performed via a self-join on the `tasks` table, finding pairs where `ABS(DATEDIFF(deadline1, deadline2)) <= 1`.
- **Cascade deletes** — deleting a user cascades to their subjects → tasks → alerts/suggestions, keeping the database clean.

Initialize the database by running `schema.sql` against your MySQL server:

```bash
mysql -u root -p < schema.sql
```

---

## API Reference

All routes are prefixed with `/api`. Every route (except `/api/users/sync` and `/api/health`) requires the `x-user-email` request header for authentication.

### Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ status: "ok" }` |

### Users
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/sync` | Upsert a Clerk user into the database |

### Subjects
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subjects` | List all subjects for the authenticated user |
| `POST` | `/api/subjects` | Create a new subject |
| `DELETE` | `/api/subjects/:id` | Delete a subject (cascades to its tasks) |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List all tasks for the authenticated user |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/tasks/detect-clashes` | Detect and log deadline collisions & generate suggestions |

### Reschedule Suggestions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suggestions` | List pending reschedule suggestions |
| `POST` | `/api/suggestions/:id/accept` | Accept a suggestion (updates the task deadline) |
| `POST` | `/api/suggestions/:id/reject` | Reject a suggestion |

### Pomodoro
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/pomodoro/log` | Log a completed Pomodoro session for a task |
| `GET` | `/api/pomodoro/weekly-stats` | Retrieve weekly study-time statistics |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MySQL** >= 8.0 running locally (or a remote instance)
- A **Clerk** account and application — [clerk.com](https://clerk.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/StudySync.git
cd StudySync

# Install all dependencies
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```dotenv
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=deadline_db

# App Configuration
PORT=3000

# Clerk Authentication (used client-side via Vite)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

> **Note:** `VITE_*` prefixed variables are injected into the frontend bundle by Vite. Keep your Clerk **secret key** out of the frontend; it is not required here since the backend uses email-based auth.

### Running the App

```bash
# Start the development server (Express + Vite HMR on the same port)
npm run dev
```

The app will be available at **http://localhost:3000**.

The Express server serves the Vite dev middleware in development, so a single `npm run dev` command boots both the backend API and the React frontend with Hot Module Replacement.

### Production Build

```bash
# 1. Build the React frontend
npm run build

# 2. Start the Express server in production mode
NODE_ENV=production npm run dev
```

In production mode, the server serves the compiled assets from the `dist/` folder instead of running Vite middleware.

---

## Authentication

StudySync uses **Clerk** for identity management:

1. The React app wraps everything in `<ClerkProvider>`.
2. After sign-in, the frontend calls `POST /api/users/sync` to upsert the Clerk user (name + email) into the MySQL `users` table.
3. Every subsequent API request includes the `x-user-email` header, which the Express auth middleware uses to resolve a `userId` and attach it to `res.locals` for downstream controllers.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request.

Please follow the existing TypeScript & ESLint conventions and keep the MVC layer separation intact (models handle SQL, controllers handle HTTP concerns).

---

<p align="center">Built with ❤️ for students who always leave things to the last minute.</p>
