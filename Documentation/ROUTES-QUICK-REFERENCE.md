# NexBoard Routes - Quick Reference

## Public Routes (No Authentication Required)
- `/` - Landing page with hero and features
- `/auth` - Login/Register page
- `/callback` - OAuth callback handler

## Dashboard Routes (Authentication Required)
All dashboard routes are prefixed with `/dashboard`

### Main Dashboard
- `/dashboard` - Dashboard home with project overview and stats

### Projects
- `/dashboard/projects` - List all projects
- `/dashboard/projects/new` - Create new project
- `/dashboard/projects/[projectId]` - Project details/overview
- `/dashboard/projects/[projectId]/board/[boardId]` - Kanban board view
- `/dashboard/projects/[projectId]/members` - Manage project members
- `/dashboard/projects/[projectId]/settings` - Project settings

### Admin (Admin Role Required)
- `/dashboard/admin/users` - User management
- `/dashboard/admin/settings` - System settings (planned)

### Other Dashboard Features (Planned)
- `/dashboard/notifications` - User notifications
- `/dashboard/profile` - User profile settings
- `/dashboard/projects/[projectId]/analytics` - Project analytics

## Route Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `[projectId]` | MongoDB ObjectId of project | `65a1b2c3d4e5f6a7b8c9d0e1` |
| `[boardId]` | MongoDB ObjectId of board | `65a1b2c3d4e5f6a7b8c9d0e2` |

## Examples

### Creating a Link to a Project
```tsx
import Link from 'next/link';

<Link href={`/dashboard/projects/${project._id}`}>
  {project.name}
</Link>
```

### Programmatic Navigation
```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate to project
router.push(`/dashboard/projects/${projectId}`);

// Navigate to board
router.push(`/dashboard/projects/${projectId}/board/${boardId}`);
```

### Getting Route Parameters
```tsx
import { useParams } from 'next/navigation';

const { projectId, boardId } = useParams<{ 
  projectId: string; 
  boardId: string;
}>();
```
