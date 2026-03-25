# Route Migration Table

## URL Changes

| Old URL | New URL | Status |
|---------|---------|--------|
| `/` (landing) | `/` (landing) | ✅ Unchanged |
| `/auth` | `/auth` | ✅ Unchanged |
| `/callback` | `/callback` | ✅ Unchanged |
| **`/` (dashboard)** | **`/dashboard`** | ⚠️ **CHANGED** |
| **`/projects`** | **`/dashboard/projects`** | ⚠️ **CHANGED** |
| **`/projects/new`** | **`/dashboard/projects/new`** | ⚠️ **CHANGED** |
| **`/projects/:id`** | **`/dashboard/projects/[projectId]`** | ⚠️ **CHANGED** |
| **`/projects/:id/board/:id`** | **`/dashboard/projects/[projectId]/board/[boardId]`** | ⚠️ **CHANGED** |
| **`/projects/:id/members`** | **`/dashboard/projects/[projectId]/members`** | ⚠️ **CHANGED** |
| **`/projects/:id/settings`** | **`/dashboard/projects/[projectId]/settings`** | ⚠️ **CHANGED** |
| N/A | **`/dashboard/notifications`** | ✅ **NEW** |
| **`/admin/users`** | **`/dashboard/admin/users`** | ⚠️ **CHANGED** |

## File Structure Changes

| Old Path | New Path | Status |
|----------|----------|--------|
| `app/page.tsx` | `app/page.tsx` | ✅ Unchanged |
| `app/(auth)/*` | `app/(auth)/*` | ✅ Unchanged |
| **`app/(dashboard)/page.tsx`** | **`app/dashboard/page.tsx`** | 🔄 **MOVED** |
| **`app/(dashboard)/layout.tsx`** | **`app/dashboard/layout.tsx`** | 🔄 **MOVED** |
| **`app/(dashboard)/projects/*`** | **`app/dashboard/projects/*`** | 🔄 **MOVED** |
| **`app/(dashboard)/admin/*`** | **`app/dashboard/admin/*`** | 🔄 **MOVED** |

## Parameter Naming Consistency

| Context | Old Format | New Format |
|---------|-----------|------------|
| Documentation | `:id` | `[projectId]` |
| Code | `[projectId]` | `[projectId]` ✅ |
| Documentation | `:id` (board) | `[boardId]` |
| Code | `[boardId]` | `[boardId]` ✅ |

## Impact Analysis

### ✅ No Impact (Still Works)
- Public landing page at `/`
- Authentication flows (`/auth`, `/callback`)
- Auth layout and components
- OAuth redirects (automatically updated to `/dashboard`)

### ⚠️ Requires User Action
- **Bookmarks:** Users need to update bookmarked URLs
  - Old: `/projects/xyz123` 
  - New: `/dashboard/projects/xyz123`

### ✅ Auto-Fixed by Code Changes
- Navigation menu links
- Component internal routing
- Project cards
- Back buttons
- Success/cancel redirects
- Search functionality

## Testing Checklist

- [ ] Landing page loads at `/`
- [ ] Login redirects to `/dashboard` (not `/`)
- [ ] Dashboard home accessible at `/dashboard`
- [ ] Project list at `/dashboard/projects`
- [ ] Create project at `/dashboard/projects/new`
- [ ] Project details at `/dashboard/projects/[id]`
- [ ] Board view at `/dashboard/projects/[id]/board/[boardId]`
- [ ] Members page accessible
- [ ] Settings page accessible
- [ ] Admin panel at `/dashboard/admin/users`
- [ ] All navigation links work correctly
- [ ] Back buttons navigate properly
- [ ] OAuth callback redirects to `/dashboard`
- [ ] Direct URL access works
- [ ] Browser refresh works on all routes
