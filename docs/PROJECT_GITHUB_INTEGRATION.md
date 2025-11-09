# Project-Specific GitHub Integration - Refactoring Plan

## Overview
Refactoring GitHub repository connections from user-level to project-level. Each project can have its own connected GitHub repository.

## Changes Required

### Backend

#### 1. Model Updates ✅
- [x] Add `projectId` field to `IGitHubRepo` interface
- [x] Add `projectId` to `GitHubRepoSchema` with required validation
- [x] Add compound index: `{ projectId: 1, fullName: 1 }` (unique)
- [x] Add index: `{ projectId: 1, isActive: 1 }`

#### 2. Repository Updates ✅
- [x] Add `projectId` to `CreateGitHubRepoData` interface
- [x] Update `create()` to include projectId
- [x] Add `findByProjectId(projectId)` method
- [x] Add `findActiveByProjectId(projectId)` method

#### 3. Service Updates (TODO)
- [ ] Update `connectRepository()` to accept projectId
- [ ] Update validation to check project ownership

#### 4. Route Updates (TODO)
- [ ] Change routes from `/api/github/repos` to `/api/projects/:projectId/github/repos`
- [ ] Update all endpoints to use projectId from URL params
- [ ] Verify user owns the project before operations

### Frontend

#### 1. Context Updates (TODO)
- [ ] Make GitHubContext project-aware
- [ ] Accept projectId as parameter
- [ ] Store repo connection per project

#### 2. UI Updates (TODO)
- [ ] Move "Connect GitHub" button to project page
- [ ] Show connected repo in project settings
- [ ] Display GitHub insights only for projects with connected repos

#### 3. API Service Updates (TODO)
- [ ] Update all API calls to include projectId in URL
- [ ] Update method signatures

## New API Structure

### Endpoints
```
GET    /api/projects/:projectId/github/repos              - Get repos for project
POST   /api/projects/:projectId/github/repos/connect      - Connect repo to project
DELETE /api/projects/:projectId/github/repos/:id          - Disconnect repo
POST   /api/projects/:projectId/github/repos/:id/sync     - Sync repo data
GET    /api/projects/:projectId/github/repos/:id/data     - Get repo data
```

### Flow
1. User navigates to a specific project
2. User clicks "Connect GitHub" in project settings
3. Repository is connected to that specific project
4. GitHub insights show data for that project's repository
5. Different projects can have different repositories

## Benefits
- Better data organization
- Multiple projects with different repos
- Clearer ownership and permissions
- Easier to manage per-project settings

## Migration
- Existing repos in database will need projectId added
- Can be done via migration script or manual update
- Or simply require users to reconnect repositories

## Status
- ✅ Model and Repository layer updated
- 🔄 Service layer - IN PROGRESS
- ⏳ Routes - TODO
- ⏳ Frontend - TODO
