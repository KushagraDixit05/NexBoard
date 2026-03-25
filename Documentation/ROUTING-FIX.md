# Routing Structure Fix - March 2026

## Summary of Changes

This document outlines the routing structure improvements made to resolve path conflicts and standardize route parameter naming in NexBoard.

## Problems Resolved

### 1. Root Path Conflict ✅
**Issue:** Two pages were resolving to the same URL path `/`:
- `client/app/page.tsx` (LandingPage - public)
- `client/app/(dashboard)/page.tsx` (DashboardPage - authenticated)

**Root Cause:** Next.js route groups like `(dashboard)` don't affect the URL path—they're only for code organization. Both files were competing for the same route.

**Solution:** Moved all dashboard routes from `(dashboard)` route group to a proper `/dashboard` path segment.

### 2. Route Parameter Naming Inconsistency ✅
**Issue:** Documentation and code used different naming conventions:
- Documentation used Express.js style: `/projects/:id/board/:id`
- Code used Next.js style: `/projects/[projectId]/board/[boardId]`

**Solution:** Standardized all documentation to use Next.js `[param]` syntax consistently, matching the actual implementation.

## Changes Made

### Directory Structure Changes

**Before:**
```
client/app/
├── (auth)/
│   ├── auth/page.tsx          → /auth
│   ├── callback/page.tsx      → /callback
│   └── layout.tsx
├── (dashboard)/               ← Route group (doesn't affect URL)
│   ├── page.tsx              → / (CONFLICT!)
│   ├── projects/...          → /projects
│   ├── admin/...             → /admin
│   └── layout.tsx
└── page.tsx                   → / (CONFLICT!)
```

**After:**
```
client/app/
├── (auth)/
│   ├── auth/page.tsx          → /auth
│   ├── callback/page.tsx      → /callback
│   └── layout.tsx
├── dashboard/                 ← Actual route segment
│   ├── page.tsx              → /dashboard ✓
│   ├── projects/...          → /dashboard/projects ✓
│   ├── admin/...             → /dashboard/admin ✓
│   └── layout.tsx
└── page.tsx                   → / (Landing page) ✓
```

### Updated Routes Table

| Route | Purpose | File | Component |
|-------|---------|------|-----------|
| `/` | Public landing page | `app/page.tsx` | LandingPage |
| `/auth` | Login/register | `app/(auth)/auth/page.tsx` | AuthPage |
| `/callback` | OAuth callback | `app/(auth)/callback/page.tsx` | OAuthCallbackPage |
| `/dashboard` | Dashboard home | `app/dashboard/page.tsx` | DashboardPage |
| `/dashboard/projects` | Projects list | `app/dashboard/projects/page.tsx` | ProjectsListPage |
| `/dashboard/projects/new` | Create project | `app/dashboard/projects/new/page.tsx` | CreateProjectPage |
| `/dashboard/projects/[projectId]` | Project details | `app/dashboard/projects/[projectId]/page.tsx` | ProjectDetailsPage |
| `/dashboard/projects/[projectId]/board/[boardId]` | Kanban board | `app/dashboard/projects/[projectId]/board/[boardId]/page.tsx` | KanbanBoardPage |
| `/dashboard/projects/[projectId]/members` | Team members | `app/dashboard/projects/[projectId]/members/page.tsx` | ProjectMembersPage |
| `/dashboard/projects/[projectId]/settings` | Project settings | `app/dashboard/projects/[projectId]/settings/page.tsx` | ProjectSettingsPage |
| `/dashboard/notifications` | Notifications | `app/dashboard/notifications/page.tsx` | NotificationsPage |
| `/dashboard/admin/users` | User management | `app/dashboard/admin/users/page.tsx` | AdminUsersPage |
| `/dashboard/notifications` | Notifications | Planned | NotificationsPage |

### Code Changes

#### Files Updated:
1. **Navigation Components:**
   - `client/components/ui/Sidebar.tsx` - Updated all nav links to `/dashboard/*`
   - `client/components/ui/Header.tsx` - Updated search and notification links
   
2. **Page Components:**
   - `client/app/dashboard/page.tsx` - Updated project creation links
   - `client/app/dashboard/projects/new/page.tsx` - Updated cancel/success redirects
   - `client/app/dashboard/projects/[projectId]/settings/page.tsx` - Updated archive/delete redirects
   - `client/app/(auth)/callback/page.tsx` - Changed OAuth success redirect to `/dashboard`

3. **Feature Components:**
   - `client/components/project/ProjectCard.tsx` - Updated project detail links
   - `client/components/board/BoardHeader.tsx` - Updated back navigation

4. **Documentation:**
   - `Documentation/roadmap.md` - Updated route table and file naming conventions
   - `Documentation/file-naming-updates.md` - Updated all route paths
   - `Documentation/phase3-frontend-development.md` - Updated file paths
   - `Documentation/phase4-enhancements.md` - Updated planned feature paths

### Route Parameter Naming Convention

All dynamic routes now consistently use descriptive parameter names in Next.js syntax:

| Old (Docs) | New (Consistent) | Description |
|------------|------------------|-------------|
| `:id` | `[projectId]` | Project identifier |
| `:id` | `[boardId]` | Board identifier |
| N/A | `[taskId]` | Task identifier (future) |
| N/A | `[userId]` | User identifier (future) |

**Pattern:** Use `[resourceId]` format, not generic `[id]`, to avoid ambiguity in nested routes.

## Benefits

### 1. **No More Route Conflicts**
- Public landing page clearly at `/`
- Dashboard and all authenticated routes under `/dashboard`
- Clear separation of public vs. authenticated content

### 2. **SEO-Friendly**
- Landing page remains at root path for better SEO
- Dashboard content properly gated under `/dashboard`

### 3. **Better Developer Experience**
- Clear URL structure matches mental model
- No confusion about which page serves which route
- Consistent parameter naming across codebase

### 4. **Future-Proof**
- Easy to add more public pages (about, pricing, etc.) at root level
- Dashboard can grow independently under `/dashboard`
- Clear namespace prevents conflicts

## Migration Notes

### For Users
- **Action Required:** Update any bookmarks from `/projects/*` to `/dashboard/projects/*`
- OAuth callbacks automatically redirect to `/dashboard` after authentication
- All existing functionality preserved

### For Developers
- When creating new dashboard pages, place them under `app/dashboard/`
- Use descriptive parameter names like `[projectId]`, not `[id]`
- Update internal links to use `/dashboard` prefix
- Keep public pages at root level (`app/`)

## Verification Checklist

- [x] All pages accessible at new routes
- [x] Navigation links updated
- [x] Redirects and router.push() calls updated
- [x] Component internal links updated
- [x] Documentation updated
- [x] No broken links in UI
- [x] OAuth callback redirects correctly
- [x] No route conflicts

## Testing Recommendations

1. **Manual Testing:**
   - Visit `/` - should show landing page
   - Visit `/dashboard` - should redirect to auth if not logged in
   - Login and verify redirect to `/dashboard`
   - Navigate through all dashboard sections
   - Test all create/edit/delete flows
   - Verify back buttons and breadcrumbs

2. **URL Testing:**
   - Direct URL access to `/dashboard/projects/[id]`
   - Refresh on nested routes
   - Browser back/forward navigation
   - Copy/paste URLs

## Related Documentation

- See `file-naming-updates.md` for component naming conventions
- See `roadmap.md` for complete application structure
- See `phase3-frontend-development.md` for implementation details

---

**Changes Applied:** March 2026  
**Breaking Changes:** URL structure (requires bookmark updates)  
**Status:** ✅ Complete
