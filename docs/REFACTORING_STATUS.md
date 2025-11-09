# Project-Specific GitHub Integration - Refactoring Status

## ✅ Completed

### Backend
1. **Model Layer** - `server/src/models/GitHubRepo.ts`
   - ✅ Added `projectId` field to interface
   - ✅ Added `projectId` to schema with validation
   - ✅ Added compound indexes for projectId

2. **Repository Layer** - `server/src/repositories/GitHubRepoRepository.ts`
   - ✅ Added `projectId` to CreateGitHubRepoData
   - ✅ Updated `create()` method
   - ✅ Added `findByProjectId()` method
   - ✅ Added `findActiveByProjectId()` method

3. **Service Layer** - `server/src/services/GitHubService.ts`
   - ✅ Updated `connectRepository()` to accept projectId
   - ✅ Updated repository creation to include projectId

4. **Routes** - `server/src/routes/github.ts`
   - ✅ Changed all routes to `/api/projects/:projectId/github/*`
   - ✅ Updated all handlers to use projectId from params

5. **Server Index** - `server/src/index.ts`
   - ✅ Updated route mounting

### Frontend
1. **API Service** - `client/src/services/api.ts`
   - ✅ Updated all methods to accept projectId parameter
   - ✅ Updated all URLs to include projectId

2. **Context** - `client/src/components/GitHubContext.tsx`
   - ✅ Made GitHubProvider accept projectId prop
   - ✅ Updated fetchRepoData to use projectId

## 🔄 Remaining Work

### Frontend Components

1. **Update GitHubConnectionModal** - `client/src/components/GitHubConnectionModal.tsx`
   - Need to accept projectId prop
   - Update all API calls to pass projectId
   - Update loadRepositories() method

2. **Update App.tsx** - Wrap GitHubProvider with projectId
   - Currently wraps entire app
   - Should be moved to project-specific pages

3. **Update Project Pages** - Where GitHub features are used
   - ProjectPage should provide projectId to GitHubProvider
   - Dashboard/Insights views should be project-aware

4. **Update TopBar** - `client/src/components/TopBar.tsx`
   - Connect GitHub button should be project-aware
   - Or move to project settings

## 📝 Implementation Steps

### Step 1: Update GitHubConnectionModal
```typescript
// Accept projectId
export function GitHubConnectionModal({ 
  isOpen, 
  onClose,
  projectId 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  projectId: string;
}) {
  // Update all API calls
  await api.getAvailableGitHubRepos(projectId);
  await api.getGitHubRepos(projectId);
  await api.connectGitHubRepo(projectId, selectedAvailableRepo);
}
```

### Step 2: Move GitHubProvider to Project Context
```typescript
// In ProjectPage.tsx
<GitHubProvider projectId={projectId}>
  {/* Project-specific content */}
</GitHubProvider>
```

### Step 3: Update Component Usage
- Remove GitHubProvider from App.tsx
- Add it to ProjectPage.tsx with projectId
- Update all components that use GitHub data

## 🎯 Benefits After Completion

1. **Better Organization**: Each project has its own repository
2. **Multiple Projects**: Users can have different repos per project
3. **Clearer Permissions**: Project-level access control
4. **Scalability**: Easier to manage as projects grow

## ⚠️ Breaking Changes

- Old API endpoints (`/api/github/*`) no longer work
- Need to provide projectId for all GitHub operations
- Existing data in database needs projectId added

## 🔧 Database Migration

Existing repositories in database will need projectId. Options:
1. Delete all existing repos (users reconnect)
2. Run migration script to add default projectId
3. Mark old repos as inactive

## 📊 Progress: ~70% Complete

- Backend: 100% ✅
- Frontend API: 100% ✅
- Frontend Context: 80% 🔄
- Frontend Components: 30% 🔄
- Testing: 0% ⏳
