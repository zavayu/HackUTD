# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All project and issue endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Auth Endpoints

#### POST `/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST `/auth/login`
Login with existing credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET `/auth/me`
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Projects

### GET `/projects`
Get all projects for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "AI ProductHub",
      "description": "AI-powered product management platform",
      "status": "active",
      "stats": {
        "stories": 24,
        "sprints": 0,
        "members": 1
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET `/projects/:projectId`
Get a single project by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "AI ProductHub",
    "description": "AI-powered product management platform",
    "status": "active",
    "stats": {
      "stories": 24,
      "sprints": 0,
      "members": 1
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### POST `/projects`
Create a new project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "My New Project",
  "description": "Project description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "My New Project",
    "description": "Project description",
    "status": "active",
    "stats": {
      "stories": 0,
      "sprints": 0,
      "members": 1
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT `/projects/:projectId`
Update a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "project": { ... }
}
```

### DELETE `/projects/:projectId`
Delete a project (also deletes all associated issues).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Issues (Backlog Stories)

### GET `/issues/project/:projectId`
Get all issues for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "issues": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "projectId": "507f1f77bcf86cd799439012",
      "title": "User authentication with SSO",
      "description": "Implement single sign-on authentication",
      "type": "story",
      "status": "backlog",
      "priority": "high",
      "assignee": "Sarah Chen",
      "estimatedHours": 8,
      "acceptanceCriteria": [
        "Users can login with Google",
        "Users can login with GitHub"
      ],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET `/issues/:issueId`
Get a single issue by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "issue": { ... }
}
```

### POST `/issues`
Create a new issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "projectId": "507f1f77bcf86cd799439012",
  "title": "User authentication with SSO",
  "description": "Implement single sign-on authentication",
  "type": "story",
  "status": "backlog",
  "priority": "high",
  "assignee": "Sarah Chen",
  "estimatedHours": 8,
  "acceptanceCriteria": [
    "Users can login with Google",
    "Users can login with GitHub"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "issue": { ... }
}
```

### PUT `/issues/:issueId`
Update an issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "critical"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "issue": { ... }
}
```

### DELETE `/issues/:issueId`
Delete an issue.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## Field Enums

### Issue Type
- `story` - User story
- `task` - Technical task
- `bug` - Bug fix

### Issue Status
- `backlog` - In backlog
- `todo` - Ready to start
- `in_progress` - Currently being worked on
- `done` - Completed

### Issue Priority
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `critical` - Critical priority

### Project Status
- `active` - Active project
- `archived` - Archived project

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
