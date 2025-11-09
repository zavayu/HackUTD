# Application Architecture

## Routing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (React Router)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─── / ──────────────────────────┐
                              │                                 │
                              ├─── /login ──────────────────────┤
                              │                                 │
                              ├─── /projects (protected) ───────┤
                              │                                 │
                              └─── /project/:id (protected) ────┤
                                                                │
┌───────────────────────────────────────────────────────────────┘
│
├─── HomePage (pages/HomePage.tsx)
│    └─── HomePageComponent (components/HomePage.tsx)
│
├─── LoginPage (pages/LoginPage.tsx)
│    ├─── useAuth hook
│    └─── LoginPageComponent (components/LoginPage.tsx)
│
├─── ProjectsPage (pages/ProjectsPage.tsx)
│    └─── LandingPage (components/LandingPage.tsx)
│
└─── ProjectPage (pages/ProjectPage.tsx)
     ├─── useTheme hook
     ├─── useParams (projectId)
     └─── ProjectView (views/ProjectView.tsx)
          ├─── Sidebar
          ├─── TopBar
          ├─── DashboardView (activeTab === 'dashboard')
          ├─── BacklogView (activeTab === 'backlog')
          ├─── SprintsView (activeTab === 'sprints')
          ├─── InsightsView (activeTab === 'insights')
          ├─── SettingsView (activeTab === 'settings')
          ├─── AICopilot
          └─── NewStoryModal
```

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages Layer                          │
│  (Routing logic, URL params, navigation)                    │
│  - HomePage, LoginPage, ProjectsPage, ProjectPage           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Views Layer                          │
│  (Complex UI compositions, tab management)                  │
│  - ProjectView, DashboardView, BacklogView, etc.            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Components Layer                        │
│  (Reusable UI components)                                   │
│  - Sidebar, TopBar, BacklogCard, KanbanBoard, etc.          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hooks & Utils Layer                       │
│  (Business logic, state management, helpers)                │
│  - useAuth, useTheme, handlers, constants                   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action
    │
    ▼
Page Component (handles routing)
    │
    ▼
View Component (manages local state)
    │
    ▼
UI Component (renders UI)
    │
    ▼
Hook/Util (business logic)
    │
    ▼
State Update
    │
    ▼
Re-render
```

## Key Patterns

### 1. Container/Presentational Pattern
- **Pages** = Smart containers with routing logic
- **Views** = Smart containers with state management
- **Components** = Presentational components

### 2. Custom Hooks Pattern
- `useAuth` - Authentication state
- `useTheme` - Theme management
- Encapsulate reusable logic

### 3. Protected Routes Pattern
```tsx
<ProtectedRoute>
  <ProjectsPage />
</ProtectedRoute>
```

### 4. URL-based State
- Project ID in URL: `/project/1`
- No prop drilling
- Shareable links

## State Management

### Local State (useState)
- Component-specific UI state
- Form inputs
- Modal open/close

### URL State (useParams)
- Current project ID
- Current route

### LocalStorage State (via hooks)
- Authentication status
- Theme preferences
- Persisted across sessions

### Context State (GitHubProvider)
- GitHub integration data
- Shared across components

## File Naming Conventions

- **Pages**: `[Name]Page.tsx` (e.g., `HomePage.tsx`)
- **Views**: `[Name]View.tsx` (e.g., `DashboardView.tsx`)
- **Components**: `[Name].tsx` (e.g., `Sidebar.tsx`)
- **Hooks**: `use[Name].ts` (e.g., `useAuth.ts`)
- **Utils**: `[name].ts` (e.g., `handlers.ts`)
- **Types**: `index.ts` (centralized)
- **Constants**: `data.ts` (centralized)
