# GitHub OAuth Integration - Testing Guide

## Overview
The GitHub OAuth integration has been successfully connected between the backend and frontend. This allows users to authenticate with GitHub and connect their repositories to the project.

## What Was Implemented

### Backend Changes
1. **Updated `server/src/index.ts`**
   - Added passport initialization
   - Registered GitHub OAuth routes (`/api/auth/github` and `/api/auth/github/callback`)
   - Registered GitHub API routes (`/api/github/*`)

2. **Existing Backend Files Used**
   - `server/src/routes/auth.ts` - GitHub OAuth flow handlers
   - `server/src/config/passport.ts` - Passport GitHub strategy configuration
   - `server/src/routes/github.ts` - GitHub repository management endpoints

### Frontend Changes
1. **Created `client/src/services/api.ts`**
   - API service for GitHub OAuth and repository management
   - Methods: `initiateGitHubAuth()`, `getGitHubRepos()`, `connectGitHubRepo()`, etc.

2. **Created `client/src/pages/AuthCallbackPage.tsx`**
   - Handles OAuth callback from GitHub
   - Extracts and stores JWT token
   - Redirects user back to the app

3. **Updated `client/src/components/GitHubConnectionModal.tsx`**
   - Now uses real GitHub OAuth instead of mock data
   - Shows authentication button if not authenticated
   - Allows users to connect repositories by entering "owner/repo" format
   - Displays list of connected repositories

4. **Updated `client/src/App.tsx`**
   - Added route for `/auth/callback` to handle OAuth redirect

## How to Test

### Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- MongoDB connected
- GitHub OAuth app configured with:
  - Client ID: `Ov23linvJPo2DENDmoac`
  - Client Secret: `2e3635f47618149798829545164dd08914364cf7`
  - Callback URL: `http://localhost:5000/api/auth/github/callback`

### Testing Steps

1. **Start the servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

2. **Navigate to the app**
   - Open `http://localhost:3000` in your browser
   - Log in to the application (if not already logged in)

3. **Connect GitHub**
   - Click the "Connect GitHub" button in the top bar
   - A modal will open showing "GitHub Authentication Required"
   - Click "Authenticate with GitHub"
   - You'll be redirected to GitHub's OAuth page
   - Authorize the application
   - You'll be redirected back to the app with a success message

4. **Connect a Repository**
   - Click "Connect GitHub" button again
   - The modal now shows a dropdown with all your GitHub repositories
   - Select a repository from the dropdown
   - You'll see the repository description below the dropdown
   - Click "Connect"
   - The repository will be added to your connected repositories list

5. **Select a Repository**
   - Click on any connected repository in the list
   - It will be set as the active repository for the project
   - The modal will close and show the repository name in the top bar

### API Endpoints Available

- `GET /api/auth/github` - Initiate GitHub OAuth flow
- `GET /api/auth/github/callback` - Handle OAuth callback
- `GET /api/github/available-repos` - Get user's available GitHub repositories (NEW)
- `GET /api/github/repos` - Get user's connected repositories
- `POST /api/github/repos/connect` - Connect a new repository
- `DELETE /api/github/repos/:id` - Disconnect a repository
- `POST /api/github/repos/:id/sync` - Trigger manual sync
- `GET /api/github/repos/:id/data` - Get repository data

### Expected Behavior

1. **Before Authentication**
   - "Connect GitHub" button shows in top bar
   - Clicking it shows authentication prompt

2. **After Authentication**
   - JWT token is stored in localStorage as `auth_token`
   - User's GitHub repositories are fetched and displayed in dropdown
   - Only repositories not yet connected are shown in the dropdown
   - Connected repositories are displayed below

3. **After Connecting Repository**
   - Repository appears in the connected list
   - Repository is removed from the available dropdown
   - Can be selected as active repository
   - Repository name shows in top bar with green checkmark

### Troubleshooting

**Issue: OAuth redirect fails**
- Check that `FRONTEND_URL` in server `.env` is `http://localhost:3000` (no trailing slash)
- Verify GitHub OAuth app callback URL is `http://localhost:5000/api/auth/github/callback`

**Issue: "GitHub access token not found"**
- Make sure you've completed the OAuth flow
- Check that the token is stored in localStorage

**Issue: Cannot connect repository**
- Verify you have access to the repository on GitHub
- Check that your GitHub token has `repo` scope
- Make sure the repository isn't already connected

**Issue: Dropdown is empty**
- Verify you have repositories in your GitHub account
- Check that the OAuth token has proper permissions
- Try refreshing by closing and reopening the modal

**Issue: CORS errors**
- Verify backend CORS settings include frontend URL
- Check that both servers are running on correct ports

## Next Steps

After successful testing, you can:
1. Sync repository data to get commits, PRs, and issues
2. Use the synced data in the dashboard and AI insights
3. Set up automatic syncing with webhooks (future enhancement)
