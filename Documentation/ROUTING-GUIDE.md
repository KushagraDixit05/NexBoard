# NexBoard Routing Guide

**Last Updated:** March 27, 2026  
**Status:** ✅ Current and Accurate

---

## Table of Contents

1. [Overview](#overview)
2. [Route Structure](#route-structure)
3. [Complete Routes Reference](#complete-routes-reference)
4. [Route Parameters](#route-parameters)
5. [Migration from Old Structure](#migration-from-old-structure)
6. [Usage Examples](#usage-examples)
7. [Testing Checklist](#testing-checklist)

---

## Overview

NexBoard uses Next.js 14 App Router with a clear separation between public and authenticated routes. All dashboard/authenticated routes are prefixed with `/dashboard` for better organization and SEO.

### Key Principles

- **Public routes** at root level (`/`, `/auth`)
- **Authenticated routes** under `/dashboard` prefix
- **Descriptive parameters** (`[projectId]`, `[boardId]`, not generic `[id]`)
- **No route conflicts** between public and private areas

---

## Route Structure

### Directory Organization

```
client/app/
├── page.tsx                           → /
├── (auth)/                            (route group - no URL impact)
│   ├── auth/page.tsx                 → /auth
│   ├── callback/page.tsx             → /callback
│   └── layout.tsx
└── dashboard/                         (actual route segment)
    ├── page.tsx                      → /dashboard
    ├── layout.tsx
    ├── projects/
    │   ├── page.tsx                  → /dashboard/projects
    │   ├── new/page.tsx              → /dashboard/projects/new
    │   └── [projectId]/
    │       ├── page.tsx              → /dashboard/projects/[projectId]
    │       ├── analytics/page.tsx    → /dashboard/projects/[projectId]/analytics
    │       ├── automation/page.tsx   → /dashboard/projects/[projectId]/automation
    │       ├── board/[boardId]/page.tsx → /dashboard/projects/[projectId]/board/[boardId]
    │       ├── members/page.tsx      → /dashboard/projects/[projectId]/members
    │       └── settings/page.tsx     → /dashboard/projects/[projectId]/settings
    ├── notifications/page.tsx        → /dashboard/notifications
    ├── search/page.tsx               → /dashboard/search
    ├── settings/page.tsx             → /dashboard/settings
    └── admin/
        └── users/page.tsx            → /dashboard/admin/users
```

### Why This Structure?

**Before (Route Group Approach):**
```
app/(dashboard)/page.tsx → /        ❌ CONFLICT with landing page
app/page.tsx             → /        ❌ CONFLICT with dashboard
```

**After (Dashboard Prefix):**
```
app/page.tsx             → /        ✅ Landing page
app/dashboard/page.tsx   → /dashboard ✅ Dashboard home
```

**Benefits:**
- ✅ No route conflicts
- ✅ Clear URL structure
- ✅ Better SEO (landing at root)
- ✅ Easier to understand and maintain
- ✅ Future-proof for adding public pages

---

## Complete Routes Reference

### Public Routes (No Authentication)

| URL | Purpose | Component | File Location |
|-----|---------|-----------|---------------|
| `/` | Landing page | `LandingPage` | `app/page.tsx` |
| `/auth` | Login/Register | `AuthPage` | `app/(auth)/auth/page.tsx` |
| `/callback` | OAuth callback | `OAuthCallbackPage` | `app/(auth)/callback/page.tsx` |

### Dashboard Routes (Authentication Required)

#### Main Dashboard
| URL | Purpose | Component | File Location |
|-----|---------|-----------|---------------|
| `/dashboard` | Dashboard home | `DashboardPage` | `app/dashboard/page.tsx` |
| `/dashboard/notifications` | User notifications | `NotificationsPage` | `app/dashboard/notifications/page.tsx` |
| `/dashboard/search` | Global search | `SearchPage` | `app/dashboard/search/page.tsx` |
| `/dashboard/settings` | User settings | `SettingsPage` | `app/dashboard/settings/page.tsx` |

#### Projects
| URL | Purpose | Component | File Location |
|-----|---------|-----------|---------------|
| `/dashboard/projects` | Projects list | `ProjectsListPage` | `app/dashboard/projects/page.tsx` |
| `/dashboard/projects/new` | Create project | `CreateProjectPage` | `app/dashboard/projects/new/page.tsx` |
| `/dashboard/projects/[projectId]` | Project overview | `ProjectDetailsPage` | `app/dashboard/projects/[projectId]/page.tsx` |
| `/dashboard/projects/[projectId]/board/[boardId]` | Kanban board | `KanbanBoardPage` | `app/dashboard/projects/[projectId]/board/[boardId]/page.tsx` |
| `/dashboard/projects/[projectId]/analytics` | Project analytics | `AnalyticsPage` | `app/dashboard/projects/[projectId]/analytics/page.tsx` |
| `/dashboard/projects/[projectId]/automation` | Automation rules | `AutomationPage` | `app/dashboard/projects/[projectId]/automation/page.tsx` |
| `/dashboard/projects/[projectId]/members` | Team members | `ProjectMembersPage` | `app/dashboard/projects/[projectId]/members/page.tsx` |
| `/dashboard/projects/[projectId]/settings` | Project settings | `ProjectSettingsPage` | `app/dashboard/projects/[projectId]/settings/page.tsx` |

#### Admin (Admin Role Required)
| URL | Purpose | Component | File Location |
|-----|---------|-----------|---------------|
| `/dashboard/admin/users` | User management | `AdminUsersPage` | `app/dashboard/admin/users/page.tsx` |

---

## Route Parameters

### Parameter Convention

Always use descriptive parameter names in Next.js bracket syntax:

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `[projectId]` | string | MongoDB ObjectId of project | `65a1b2c3d4e5f6a7b8c9d0e1` |
| `[boardId]` | string | MongoDB ObjectId of board | `65a1b2c3d4e5f6a7b8c9d0e2` |
| `[taskId]` | string | MongoDB ObjectId of task | `65a1b2c3d4e5f6a7b8c9d0e3` |
| `[userId]` | string | MongoDB ObjectId of user | `65a1b2c3d4e5f6a7b8c9d0e4` |

### ❌ Avoid Generic Names

```tsx
// DON'T DO THIS
app/projects/[id]/board/[id]/page.tsx  ❌ Ambiguous!

// DO THIS INSTEAD
app/dashboard/projects/[projectId]/board/[boardId]/page.tsx ✅ Clear!
```

---

## Migration from Old Structure

### URL Changes Summary

| Old URL (Before March 2026) | New URL (Current) | Status |
|------------------------------|-------------------|--------|
| `/` (dashboard) | `/dashboard` | ⚠️ **CHANGED** |
| `/projects` | `/dashboard/projects` | ⚠️ **CHANGED** |
| `/projects/new` | `/dashboard/projects/new` | ⚠️ **CHANGED** |
| `/projects/:id` | `/dashboard/projects/[projectId]` | ⚠️ **CHANGED** |
| `/projects/:id/board/:id` | `/dashboard/projects/[projectId]/board/[boardId]` | ⚠️ **CHANGED** |
| `/projects/:id/members` | `/dashboard/projects/[projectId]/members` | ⚠️ **CHANGED** |
| `/projects/:id/settings` | `/dashboard/projects/[projectId]/settings` | ⚠️ **CHANGED** |
| `/admin/users` | `/dashboard/admin/users` | ⚠️ **CHANGED** |
| N/A | `/dashboard/projects/[projectId]/analytics` | ✅ **NEW** |
| N/A | `/dashboard/projects/[projectId]/automation` | ✅ **NEW** |
| `/` (landing) | `/` | ✅ **UNCHANGED** |
| `/auth` | `/auth` | ✅ **UNCHANGED** |
| `/callback` | `/callback` | ✅ **UNCHANGED** |

### What Was Automatically Updated

✅ All navigation menu links  
✅ Component internal routing  
✅ Project cards and links  
✅ Back buttons and redirects  
✅ OAuth callback redirects  
✅ Success/cancel redirects  
✅ Search functionality  

### What Requires User Action

⚠️ **Bookmarks:** Users need to update any bookmarked URLs:
- Old: `/projects/xyz123`
- New: `/dashboard/projects/xyz123`

### Files Updated in Migration

**Navigation Components:**
- `components/ui/Sidebar.tsx` - All nav links
- `components/ui/Header.tsx` - Search and notifications

**Page Components:**
- `app/dashboard/page.tsx` - Project links
- `app/dashboard/projects/new/page.tsx` - Redirects
- `app/dashboard/projects/[projectId]/settings/page.tsx` - Redirects
- `app/(auth)/callback/page.tsx` - OAuth redirect to `/dashboard`

**Feature Components:**
- `components/project/ProjectCard.tsx` - Project links
- `components/board/BoardHeader.tsx` - Back navigation
- `components/board/BoardHeader.tsx` - Analytics/Automation links

---

## Usage Examples

### Creating Links

#### Link to Project
```tsx
import Link from 'next/link';

<Link href={`/dashboard/projects/${project._id}`}>
  {project.name}
</Link>
```

#### Link to Board
```tsx
<Link href={`/dashboard/projects/${projectId}/board/${board._id}`}>
  Open Board
</Link>
```

#### Link to Analytics
```tsx
<Link href={`/dashboard/projects/${projectId}/analytics`}>
  View Analytics
</Link>
```

### Programmatic Navigation

```tsx
'use client';

import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();

  const goToProject = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const goToBoard = (projectId: string, boardId: string) => {
    router.push(`/dashboard/projects/${projectId}/board/${boardId}`);
  };

  const goToAnalytics = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}/analytics`);
  };

  return (
    // Component JSX
  );
}
```

### Getting Route Parameters

```tsx
'use client';

import { useParams } from 'next/navigation';

function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  return <div>Project ID: {projectId}</div>;
}
```

### Multiple Parameters

```tsx
'use client';

import { useParams } from 'next/navigation';

function BoardPage() {
  const { projectId, boardId } = useParams<{ 
    projectId: string; 
    boardId: string;
  }>();

  return (
    <div>
      <p>Project: {projectId}</p>
      <p>Board: {boardId}</p>
    </div>
  );
}
```

### Server Components (Alternative)

```tsx
interface PageProps {
  params: { projectId: string; boardId: string };
}

export default async function BoardPage({ params }: PageProps) {
  const { projectId, boardId } = params;
  
  // Fetch data server-side
  const board = await fetchBoard(boardId);
  
  return <div>{board.name}</div>;
}
```

---

## Testing Checklist

### Manual Testing

#### Public Routes
- [ ] Landing page loads at `/`
- [ ] `/auth` shows login/register form
- [ ] OAuth flow redirects to `/dashboard` after login
- [ ] Unauthenticated users redirected from `/dashboard` to `/auth`

#### Dashboard Routes
- [ ] Dashboard home accessible at `/dashboard`
- [ ] Project list at `/dashboard/projects`
- [ ] Create project at `/dashboard/projects/new`
- [ ] Project details at `/dashboard/projects/[id]`
- [ ] Board view at `/dashboard/projects/[id]/board/[boardId]`
- [ ] Analytics page at `/dashboard/projects/[id]/analytics`
- [ ] Automation page at `/dashboard/projects/[id]/automation`
- [ ] Members page accessible
- [ ] Settings page accessible
- [ ] Notifications page accessible
- [ ] Search page accessible

#### Admin Routes
- [ ] Admin panel at `/dashboard/admin/users` (admin role)
- [ ] Non-admin users cannot access admin routes

### Navigation Testing
- [ ] All sidebar links work correctly
- [ ] Header navigation functional
- [ ] Back buttons navigate properly
- [ ] Breadcrumbs (if any) show correct paths
- [ ] Project cards link correctly
- [ ] Board selector works

### URL Testing
- [ ] Direct URL access works for all routes
- [ ] Browser refresh works on all routes
- [ ] Browser back/forward navigation works
- [ ] Copy/paste URLs work correctly
- [ ] Deep linking to nested routes works

### Error Cases
- [ ] Invalid project ID shows 404 or error page
- [ ] Invalid board ID shows 404 or error page
- [ ] Unauthorized access shows auth redirect
- [ ] Missing resources show appropriate error

---

## Best Practices

### For Developers

1. **Always use descriptive parameter names:**
   ```tsx
   // Good
   app/dashboard/projects/[projectId]/board/[boardId]/page.tsx
   
   // Bad
   app/dashboard/projects/[id]/board/[id]/page.tsx
   ```

2. **Keep public pages at root level:**
   ```
   app/about/page.tsx → /about ✅
   app/dashboard/about/page.tsx → /dashboard/about ❌
   ```

3. **Use dashboard prefix for authenticated content:**
   ```
   app/dashboard/feature/page.tsx → /dashboard/feature ✅
   app/feature/page.tsx → /feature ❌
   ```

4. **Type your params:**
   ```tsx
   const params = useParams<{ projectId: string; boardId: string }>();
   ```

5. **Use Link for internal navigation:**
   ```tsx
   <Link href="/dashboard/projects">Projects</Link>
   ```

### For Users

1. **Update bookmarks** from old structure to new:
   - Old: `/projects/abc123`
   - New: `/dashboard/projects/abc123`

2. **Share URLs** using the full URL structure:
   - `https://nexboard.com/dashboard/projects/[id]/board/[boardId]`

---

## Related Documentation

- [Implementation Summary](./session-docs/IMPLEMENTATION_SUMMARY.md) - Feature implementation details
- [Quick Start Guide](./session-docs/QUICK_START_GUIDE.md) - User guide for new features
- [Architecture Overview](./session-docs/ARCHITECTURE_OVERVIEW.md) - System architecture

---

## Change Log

### March 2026
- ✅ Fixed route conflict between landing page and dashboard
- ✅ Moved dashboard routes from `(dashboard)` group to `/dashboard` prefix
- ✅ Standardized parameter naming across codebase
- ✅ Updated all navigation links and redirects
- ✅ Added analytics and automation routes
- ✅ Updated all documentation

### Migration Impact
- **Breaking Change:** URL structure changed (bookmarks need updating)
- **Auto-Fixed:** All internal navigation updated automatically
- **Status:** Complete and verified

---

**Questions or Issues?**  
If you encounter routing problems, verify:
1. Using correct `/dashboard` prefix for authenticated routes
2. Parameter names match Next.js syntax (`[projectId]`, not `:id`)
3. File structure matches URL structure
4. Authentication middleware protecting dashboard routes
