# 📐 System Design Document: High-Level (HLD) & Low-Level Design (LLD)

**Project:** StudySync — Student Academic Workload Balancing, Collision Scheduling & Focused Time Tracking  
**Context:** Minor Project — Software Engineering Architecture  
**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS v4, Express 4, MySQL 8.0, Clerk Auth  

---

## Table of Contents

1. [High-Level Design (HLD)](#1-high-level-design-hld)
   - [1.1 End-to-End System Architecture](#11-end-to-end-system-architecture)
   - [1.2 Data Flow & Request-Response Pipeline](#12-data-flow--request-response-pipeline)
   - [1.3 Runtime & Deployment Topology](#13-runtime--deployment-topology)
2. [Low-Level Design (LLD)](#2-low-level-design-lld)
   - [2.1 Database Schema & Entity Relationship Diagram (ERD)](#21-database-schema--entity-relationship-diagram-erd)
   - [2.2 Backend Class & Module Architecture](#22-backend-class--module-architecture)
   - [2.3 Sequence Diagram: Deadline Collision & Greedy Rescheduling](#23-sequence-diagram-deadline-collision--greedy-rescheduling)
   - [2.4 Sequence Diagram: Authentication & API Authorization](#24-sequence-diagram-authentication--api-authorization)
   - [2.5 System State Machines](#25-system-state-machines)
3. [Algorithmic Specifications](#3-algorithmic-specifications)
4. [Source Mermaid Files](#4-source-mermaid-files)

---

## 1. High-Level Design (HLD)

The High-Level Design defines the 4-tier architecture of StudySync:
- **Presentation Tier:** React 19 Single-Page Application (SPA) with route-level code splitting (`React.lazy`), memoized context state (`CollisionContext`), and Neo-Brutalist styling.
- **Identity Tier:** Clerk Cloud Authentication handling identity verification, user sessions, and JWT tokens.
- **Application Tier:** Express 4 REST API in TypeScript utilizing the Model-View-Controller (MVC) pattern, featuring a custom email-based authorization middleware, SQL self-join clash detection, and a greedy heuristic forward-search rescheduler.
- **Persistence Tier:** MySQL 8.0 with foreign key cascade guarantees, connection pooling (`mysql2/promise`), and schema-level generated columns for urgency computation.

### 1.1 End-to-End System Architecture

```mermaid
flowchart TB
    %% Presentation Layer
    subgraph FrontendTier ["🎨 1. Presentation Tier (React 19 + Vite 6 + Tailwind CSS)"]
        User(["🎓 Student User"])

        subgraph ClientAuth ["Auth & Session Management"]
            ClerkReact["Clerk React Provider\n(<ClerkProvider>, useUser, useAuth)"]
            TokenStorage["Session JWT & Email State\n(x-user-email Header Injection)"]
        end

        subgraph StateManagement ["Context & Cache Layer"]
            CollisionContext["CollisionContext\n• tasks: Task[]\n• subjects: Subject[]\n• clashes: Clash[]\n• suggestions: Suggestion[]\n• memoized actions (useCallback)"]
        end

        subgraph PageRoutes ["Client-Side Routing (React Router DOM v7)"]
            RouteDashboard["/ (DashboardPage)\n• SectionStat metrics\n• Clash Alert Banner\n• RecommendationCard\n• TaskCard grid"]
            RouteTasks["/tasks (TasksPage)\n• Filter by Subject & Type\n• Search & Sort\n• Modals: Add, Edit, Delete"]
            RouteCalendar["/calendar (CalendarPage)\n• Precomputed tasksByDay Map\n• Monthly interactive grid"]
            RouteAnalytics["/analytics (AnalyticsPage)\n• Category Breakdown\n• Priority Distribution\n• Pomodoro Rolling 7-Day"]
            RoutePomodoro["/pomodoro (PomodoroPage)\n• 25m Focus / 5m Break / 15m Long\n• Task Association & DB Session Log"]
        end

        subgraph ReusableComponents ["Modular UI Components"]
            CompTaskCard["TaskCard.tsx"]
            CompTaskModal["TaskFormModal.tsx"]
            CompSubjectModal["SubjectModal.tsx"]
            CompDeleteModal["DeleteConfirmationModal.tsx"]
            CompSectionStat["SectionStat.tsx"]
            CompNavbar["Navbar.tsx (Responsive Nav)"]
            CompThemeToggle["ThemeToggle.tsx (Dark/Light)"]
        end
    end

    %% External Identity
    subgraph ExternalServices ["☁️ 2. External Services Tier"]
        ClerkCloud["Clerk Identity Platform\n• User Authentication & OAuth\n• Session Token Issuance"]
    end

    %% Application Layer
    subgraph BackendTier ["⚙️ 3. Application Tier (Express 4 + TypeScript + Node.js)"]
        ServerCore["server.ts\n• HTTP Server Listener (:3000)\n• Vite Dev HMR / Prod Static Dist"]

        subgraph MiddlewarePipeline ["HTTP Middleware Chain"]
            MW_CORS["CORS Middleware"]
            MW_JSON["express.json() Body Parser"]
            MW_Auth["Custom Auth Middleware\n• Validates x-user-email\n• Queries users table\n• Injects res.locals.userId"]
        end

        subgraph RouterLayer ["Express API Routers"]
            RouterTasks["/api/tasks (taskRoutes.ts)"]
            RouterSubjects["/api/subjects (subjectRoutes.ts)"]
            RouterSuggestions["/api/suggestions (suggestionRoutes.ts)"]
            RouterPomodoro["/api/pomodoro (pomodoroRoutes.ts)"]
            RouterUsers["/api/users (userRoutes.ts)"]
        end

        subgraph ControllerLayer ["Controllers (Request Orchestration)"]
            CtrlTask["taskController.ts\n• getAllTasks, createTask\n• updateTask, deleteTask\n• getClashes"]
            CtrlSubject["subjectController.ts\n• getSubjects, createSubject, deleteSubject"]
            CtrlSuggestion["suggestionController.ts\n• getPendingSuggestions\n• acceptSuggestion, rejectSuggestion"]
            CtrlPomodoro["pomodoroController.ts\n• logSession, getWeeklyStats"]
            CtrlUser["userController.ts\n• syncUser (Upsert)"]
        end

        subgraph AlgorithmicEngines ["Algorithmic & Heuristic Engine"]
            EngineClash["Self-Join Collision Engine\n• Window: ABS(diff(d1, d2)) < 86400s\n• Cross-subject detection"]
            EnginePriority["Academic Prioritization Evaluator\n• Exam=4, Quiz=3, Project=2, Other=1\n• Priority = CategoryWeight * Effort"]
            EngineReschedule["Greedy Forward Slot Search\n• Loops proposedDate = deadline + 1 day\n• Validates no conflict (|diff| < 24h)\n• Emits pending suggestion"]
        end

        subgraph ModelLayer ["Data Access Layer (Models - raw SQL)"]
            ModelTask["TaskModel.ts"]
            ModelSubject["SubjectModel.ts"]
            ModelSuggestion["SuggestionModel.ts"]
            ModelPomodoro["PomodoroModel.ts"]
            ModelUser["UserModel.ts"]
        end
    end

    %% Persistence Layer
    subgraph DatabaseTier ["🗄️ 4. Persistence Tier (MySQL 8.0 - deadline_db)"]
        DBPool["mysql2 Connection Pool (config/db.ts)"]

        subgraph DatabaseSchema ["Relational Schema & Constraints"]
            T_Users[("users\n• user_id (PK)\n• email (UK)\n• name, password")]
            T_Subjects[("subjects\n• subject_id (PK)\n• user_id (FK -> users)\n• subject_name")]
            T_Tasks[("tasks\n• id (PK)\n• subject_id (FK -> subjects)\n• title, description, deadline\n• category, estimated_effort (1-10)\n• category_weight (STORED GENERATED)\n• priority_score (STORED GENERATED)\n• status (Pending, Completed)")]
            T_Alerts[("collision_alerts\n• alert_id (PK)\n• task1_id, task2_id (FK -> tasks)\n• message, created_at")]
            T_Suggestions[("reschedule_suggestions\n• id (PK)\n• task_id (FK -> tasks)\n• suggested_date\n• status (Pending, Accepted, Rejected)")]
            T_Pomodoro[("pomodoro_sessions\n• session_id (PK)\n• task_id (FK -> tasks)\n• user_id (FK -> users)\n• duration_minutes, created_at")]
        end
    end

    %% Wiring
    User -->|"Interacts with Views"| PageRoutes
    PageRoutes --> ReusableComponents
    PageRoutes --> CollisionContext
    
    User -->|"Signs in / Signs up"| ClerkReact
    ClerkReact <-->|"OAuth2 / OIDC Token Exchange"| ClerkCloud
    ClerkReact --> TokenStorage

    CollisionContext -->|"Async Axios / Fetch with x-user-email"| ServerCore
    ServerCore --> MW_CORS --> MW_JSON --> MW_Auth

    MW_Auth -->|"Verifies email & extracts user_id"| T_Users
    MW_Auth --> RouterLayer

    RouterTasks --> CtrlTask
    RouterSubjects --> CtrlSubject
    RouterSuggestions --> CtrlSuggestion
    RouterPomodoro --> CtrlPomodoro
    RouterUsers --> CtrlUser

    CtrlTask --> ModelTask
    CtrlSubject --> ModelSubject
    CtrlSuggestion --> ModelSuggestion
    CtrlPomodoro --> ModelPomodoro
    CtrlUser --> ModelUser

    ModelTask --> EngineClash
    EngineClash --> EnginePriority
    EnginePriority --> EngineReschedule
    EngineReschedule --> ModelSuggestion

    ModelTask --> DBPool
    ModelSubject --> DBPool
    ModelSuggestion --> DBPool
    ModelPomodoro --> DBPool
    ModelUser --> DBPool

    DBPool --> DatabaseSchema

    %% DB Cascades
    T_Users -->|"1 : N (CASCADE)"| T_Subjects
    T_Subjects -->|"1 : N (CASCADE)"| T_Tasks
    T_Tasks -->|"1 : N (CASCADE)"| T_Alerts
    T_Tasks -->|"1 : N (CASCADE)"| T_Suggestions
    T_Tasks -->|"1 : N (CASCADE)"| T_Pomodoro
    T_Users -->|"1 : N (CASCADE)"| T_Pomodoro
```

---

## 2. Low-Level Design (LLD)

### 2.1 Database Schema & Entity Relationship Diagram (ERD)

The relational schema implements clean normalization with referential integrity rules (ON DELETE CASCADE) and schema-generated fields:

```mermaid
erDiagram
    USERS ||--o{ SUBJECTS : "owns"
    USERS ||--o{ POMODORO_SESSIONS : "performs"
    SUBJECTS ||--o{ TASKS : "contains"
    TASKS ||--o{ COLLISION_ALERTS : "involved_as_task1"
    TASKS ||--o{ COLLISION_ALERTS : "involved_as_task2"
    TASKS ||--o{ RESCHEDULE_SUGGESTIONS : "generates"
    TASKS ||--o{ POMODORO_SESSIONS : "logs_effort_against"

    USERS {
        int user_id PK "Auto Increment"
        string name "Student Full Name"
        string email UK "Unique Student Email"
        string password "Hashed Credentials / Clerk Ref"
    }

    SUBJECTS {
        int subject_id PK "Auto Increment"
        int user_id FK "References users.user_id (ON DELETE CASCADE)"
        string subject_name "Course / Subject Title"
    }

    TASKS {
        int id PK "Auto Increment Task Identifier"
        int subject_id FK "References subjects.subject_id (ON DELETE CASCADE)"
        string title "Task Title / Name"
        string description "Detailed description or notes"
        string task_type "ENUM: Assignment, Exam, Lab, Viva"
        datetime deadline "Target Due Date & Time"
        string category "Exam, Quiz, Project, Assignment"
        int estimated_effort "Cognitive Effort Scale (1 to 10)"
        int category_weight "STORED GENERATED: Exam=4, Quiz=3, Project=2, Other=1"
        int priority_score "STORED GENERATED: category_weight * estimated_effort"
        string status "ENUM: Pending, Completed"
    }

    COLLISION_ALERTS {
        int alert_id PK "Auto Increment"
        int task1_id FK "References tasks.id (ON DELETE CASCADE)"
        int task2_id FK "References tasks.id (ON DELETE CASCADE)"
        string message "Warning alert details"
        timestamp created_at "Detection Timestamp"
    }

    RESCHEDULE_SUGGESTIONS {
        int id PK "Auto Increment"
        int task_id FK "References tasks.id (ON DELETE CASCADE)"
        datetime suggested_date "First Clash-Free Future Date"
        string status "Pending, Accepted, Rejected"
        timestamp created_at "Generation Timestamp"
    }

    POMODORO_SESSIONS {
        int session_id PK "Auto Increment"
        int task_id FK "References tasks.id (ON DELETE CASCADE)"
        int user_id FK "References users.user_id (ON DELETE CASCADE)"
        int duration_minutes "Completed focus block (e.g. 25 min)"
        timestamp created_at "Logged Timestamp"
    }
```

---

### 2.2 Backend Class & Module Architecture

The backend strictly adheres to the MVC separation of concerns:
- **Controllers** handle HTTP requests, input validation, and HTTP response codes.
- **Models** contain raw parameterized SQL queries via `mysql2/promise`.
- **Middlewares** authenticate requests and inject user context into `res.locals`.

```mermaid
classDiagram
    class DBConnection {
        -Pool pool
        +getDB() Promise~Pool~
    }

    class TaskModel {
        +getAll(userId: number) Promise~Task[]~
        +getById(id: number) Promise~Task~
        +create(taskData: Omit~Task, id~) Promise~number~
        +update(id: number, taskData: Partial~Task~) Promise~boolean~
        +delete(id: number) Promise~boolean~
        +detectClashes(userId: number) Promise~Clash[]~
    }

    class SubjectModel {
        +getAll(userId: number) Promise~Subject[]~
        +create(name: string, userId: number) Promise~number~
        +delete(id: number, userId: number) Promise~boolean~
    }

    class UserModel {
        +findOrCreate(name: string, email: string) Promise~User~
        +getByEmail(email: string) Promise~User~
    }

    class SuggestionModel {
        +getPending(userId: number) Promise~Suggestion[]~
        +getSuggestionByTaskId(taskId: number) Promise~Suggestion~
        +createSuggestion(taskId: number, date: string) Promise~number~
        +acceptSuggestion(id: number) Promise~boolean~
        +rejectSuggestion(id: number) Promise~boolean~
    }

    class PomodoroModel {
        +logSession(taskId: number, userId: number, duration: number) Promise~number~
        +getWeeklyStats(userId: number) Promise~WeeklyStat[]~
    }

    class TaskController {
        +getAllTasks(req: Request, res: Response) Promise~void~
        +createTask(req: Request, res: Response) Promise~void~
        +updateTask(req: Request, res: Response) Promise~void~
        +deleteTask(req: Request, res: Response) Promise~void~
        +getClashes(req: Request, res: Response) Promise~void~
    }

    class SubjectController {
        +getSubjects(req: Request, res: Response) Promise~void~
        +createSubject(req: Request, res: Response) Promise~void~
        +deleteSubject(req: Request, res: Response) Promise~void~
    }

    class SuggestionController {
        +getPendingSuggestions(req: Request, res: Response) Promise~void~
        +acceptSuggestion(req: Request, res: Response) Promise~void~
        +rejectSuggestion(req: Request, res: Response) Promise~void~
    }

    class PomodoroController {
        +logSession(req: Request, res: Response) Promise~void~
        +getWeeklyStats(req: Request, res: Response) Promise~void~
    }

    class UserController {
        +syncUser(req: Request, res: Response) Promise~void~
    }

    class AuthMiddleware {
        +authenticate(req: Request, res: Response, next: NextFunction) Promise~void~
    }

    class CollisionContext {
        +Task[] tasks
        +Subject[] subjects
        +Clash[] clashes
        +Suggestion[] suggestions
        +boolean loading
        +string error
        +fetchTasks() Promise~void~
        +fetchSubjects() Promise~void~
        +fetchClashes() Promise~void~
        +createTask(task: TaskInput) Promise~void~
        +updateTask(id: number, task: Partial~Task~) Promise~void~
        +deleteTask(id: number) Promise~void~
        +acceptSuggestion(id: number) Promise~void~
        +rejectSuggestion(id: number) Promise~void~
        +logPomodoro(taskId: number, duration: number) Promise~void~
    }

    TaskController --> TaskModel : delegates to
    SubjectController --> SubjectModel : delegates to
    SuggestionController --> SuggestionModel : delegates to
    PomodoroController --> PomodoroModel : delegates to
    UserController --> UserModel : delegates to

    TaskModel ..> DBConnection : uses
    SubjectModel ..> DBConnection : uses
    SuggestionModel ..> DBConnection : uses
    PomodoroModel ..> DBConnection : uses
    UserModel ..> DBConnection : uses

    TaskModel ..> SuggestionModel : invokes on clash detection
    AuthMiddleware ..> DBConnection : verifies email

    CollisionContext ..> TaskController : HTTP REST
    CollisionContext ..> SubjectController : HTTP REST
    CollisionContext ..> SuggestionController : HTTP REST
    CollisionContext ..> PomodoroController : HTTP REST
    CollisionContext ..> UserController : HTTP REST
```

---

### 2.3 Sequence Diagram: Deadline Collision & Greedy Rescheduling

This diagram outlines the complete sequence triggered whenever tasks are refreshed or created:

```mermaid
sequenceDiagram
    autonumber
    actor Student as 🎓 Student
    participant UI as 💻 Frontend (CollisionContext)
    participant Auth as 🛡️ AuthMiddleware
    participant Ctrl as 🎛️ TaskController
    participant Model as ⚙️ TaskModel
    participant DB as 🗄️ MySQL (deadline_db)
    participant Sugg as 💡 SuggestionModel

    Student->>UI: Opens Dashboard or creates/updates Task
    UI->>Auth: GET /api/tasks/detect-clashes (Header: x-user-email)
    Auth->>DB: SELECT user_id FROM users WHERE email = ?
    DB-->>Auth: Returns user_id
    Auth->>Ctrl: getClashes(req, res) with res.locals.userId
    Ctrl->>Model: detectClashes(userId)

    Note over Model,DB: Step 1: Self-Join Query for Deadline Clashes (<= 24h)
    Model->>DB: SELECT a.id, b.id FROM tasks a JOIN tasks b ON a.id < b.id WHERE ABS(TIMESTAMPDIFF(SECOND, a.deadline, b.deadline)) < 86400
    DB-->>Model: Returns clashing task pairs

    Model->>DB: SELECT * FROM tasks WHERE user_id = ? ORDER BY deadline ASC
    DB-->>Model: Returns all active user tasks

    Note over Model: Step 2: Algorithmic Resolution for each Clash Pair
    loop For each (Task1, Task2) in Clashes
        Model->>Model: Compare priority_score: P1 vs P2
        alt P1 < P2
            Model->>Model: Select Task1 for rescheduling
        else P1 >= P2
            Model->>Model: Select Task2 for rescheduling
        end

        Model->>Sugg: getSuggestionByTaskId(taskId)
        Sugg->>DB: SELECT * FROM reschedule_suggestions WHERE task_id = ?
        DB-->>Sugg: Return existing suggestion (or null)

        opt No pending suggestion exists
            Note over Model: Step 3: Greedy Forward Slot Search
            loop While proposedDate has 24h conflict
                Model->>Model: proposedDate = proposedDate + 1 day
                Model->>Model: Check if ABS(task.deadline - proposedDate) < 24h for any task
            end
            Model->>Sugg: createSuggestion(taskId, clashFreeDate)
            Sugg->>DB: INSERT INTO reschedule_suggestions (task_id, suggested_date, status) VALUES (?, ?, 'Pending')
            DB-->>Sugg: insertId
        end
    end

    Model-->>Ctrl: Returns clash list
    Ctrl-->>UI: 200 OK [clashes, updated suggestions]
    UI-->>Student: Displays Clash Alert Banner & One-Click Reschedule Cards
```

---

### 2.4 Sequence Diagram: Authentication & API Authorization

```mermaid
sequenceDiagram
    autonumber
    actor Student as 🎓 Student
    participant ReactApp as ⚛️ React SPA (ClerkProvider)
    participant Clerk as ☁️ Clerk Auth Service
    participant Express as 🌐 Express Server (server.ts)
    participant AuthMW as 🛡️ Custom Auth Middleware
    participant UserCtrl as 👤 UserController / UserModel
    participant DB as 🗄️ MySQL (deadline_db)

    Student->>ReactApp: Visits Application & signs in
    ReactApp->>Clerk: Submit credentials / OAuth
    Clerk-->>ReactApp: JWT Session Token + User Profile (name, email)

    Note over ReactApp,Express: Step 1: User Sync with Backend
    ReactApp->>Express: POST /api/users/sync { name, email }
    Express->>UserCtrl: syncUser(req, res)
    UserCtrl->>DB: INSERT INTO users (name, email) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?
    DB-->>UserCtrl: user_id
    UserCtrl-->>ReactApp: 200 OK { user_id, email, name }

    Note over ReactApp,DB: Step 2: Protected Request Pipeline
    Student->>ReactApp: Navigates to Dashboard / Tasks / Pomodoro
    ReactApp->>Express: GET /api/tasks (Header: x-user-email = student@college.edu)
    Express->>AuthMW: Intercepts request
    AuthMW->>DB: SELECT user_id FROM users WHERE email = 'student@college.edu'
    
    alt User found
        DB-->>AuthMW: { user_id: 101 }
        AuthMW->>AuthMW: Set res.locals.userId = 101
        AuthMW->>Express: next() -> Route Controller
        Express-->>ReactApp: 200 OK [Task List Data]
    else Missing or invalid user
        DB-->>AuthMW: Empty Result
        AuthMW-->>ReactApp: 401 Unauthorized { message: "Unauthorized" }
    end
```

---

### 2.5 System State Machines

```mermaid
stateDiagram-v2
    state "Pomodoro Focus Timer States" as PomodoroLifecycle {
        [*] --> Idle
        Idle --> Running : Click Start Timer (25m)
        Running --> Paused : Click Pause
        Paused --> Running : Click Resume
        Running --> SessionComplete : Timer ticks to 00:00
        SessionComplete --> Logging : Auto trigger POST /api/pomodoro/log
        Logging --> ShortBreak : Break starts (5m)
        Logging --> LongBreak : After 4 focus cycles (15m)
        ShortBreak --> Idle : Break ends
        LongBreak --> Idle : Break ends
        Paused --> Idle : Click Reset
    }

    state "Reschedule Suggestion States" as SuggestionLifecycle {
        [*] --> ConflictIdentified : SQL Self-Join detects <= 24h gap
        ConflictIdentified --> Pending : Heuristic proposes clash-free date
        Pending --> Accepted : User clicks "Accept" (Updates Task Deadline)
        Pending --> Rejected : User clicks "Reject" (Dismisses suggestion)
        Accepted --> [*]
        Rejected --> [*]
    }

    state "Task Lifecycle States" as TaskLifecycle {
        [*] --> TaskCreated : POST /api/tasks
        TaskCreated --> ConflictFree : No task within 24 hours
        TaskCreated --> Clashing : Task within 24h of another task
        Clashing --> ConflictFree : Suggestion Accepted or Task Updated
        ConflictFree --> TaskCompleted : PUT /api/tasks/:id (status: Completed)
        Clashing --> TaskCompleted : Completed despite clash
        TaskCompleted --> [*]
    }
```

---

## 3. Algorithmic Specifications

### Priority Score Formulation (MCDM)
The priority score $P_s$ is calculated by combining qualitative category importance with quantitative effort:

$$\text{Category Weight } (W_c) = \begin{cases} 4 & \text{Exam} \\ 3 & \text{Quiz} \\ 2 & \text{Project} \\ 1 & \text{Assignment / Lab / Viva} \end{cases}$$

$$\text{Priority Score } (P_s) = W_c \times \text{Estimated Effort} \quad (\text{Effort} \in [1, 10])$$

### Clash Detection Formulation
$$\text{Clash}(T_i, T_j) \iff |T_i.\text{deadline} - T_j.\text{deadline}| < 86,400 \text{ seconds} \quad (i \ne j)$$

### Greedy Reschedule Search
$$\min \Delta d \in \{1, 2, 3, \dots\} \quad \text{s.t.} \quad \forall T_k \in \mathcal{T} \setminus \{T_{\text{target}}\}, \; |(T_{\text{target}}.\text{deadline} + \Delta d) - T_k.\text{deadline}| \ge 86,400 \text{ s}$$

---

## 4. Source Mermaid Files

All raw Mermaid `.mmd` diagram source files are located in the `docs/` folder:
- **HLD Architecture Diagram:** [docs/HLD.mmd](file:///c:/Users/Shivam%20Anand/OneDrive/Desktop/Projects/StudySync/docs/HLD.mmd)
- **Database ERD:** [docs/LLD_ERD.mmd](file:///c:/Users/Shivam%20Anand/OneDrive/Desktop/Projects/StudySync/docs/LLD_ERD.mmd)
- **Backend Class Diagram:** [docs/LLD_Class.mmd](file:///c:/Users/Shivam%20Anand/OneDrive/Desktop/Projects/StudySync/docs/LLD_Class.mmd)
- **Collision & Rescheduling Sequence:** [docs/LLD_Sequence_Clash.mmd](file:///c:/Users/Shivam%20Anand/OneDrive/Desktop/Projects/StudySync/docs/LLD_Sequence_Clash.mmd)
- **Authentication Lifecycle Sequence:** [docs/LLD_Sequence_Auth.mmd](file:///c:/Users/Shivam%20Anand/OneDrive/Desktop/Projects/StudySync/docs/LLD_Sequence_Auth.mmd)
- **System State Machines:** [docs/LLD_State.mmd](file:///c:/Users/Shivam%20Anand/OneDrive/Desktop/Projects/StudySync/docs/LLD_State.mmd)
- **Root Master Diagram:** [HLD_LLD.mmd](file:///c:/Users/Shivam%20Anand/OneDrive/Desktop/Projects/StudySync/HLD_LLD.mmd)
