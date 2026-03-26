'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Search, FileText, FolderKanban, AlertCircle } from 'lucide-react';
import type { Task, Project } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    Promise.all([
      api.get('/tasks/search', { params: { q: query } }),
      api.get('/projects', { params: { search: query } })
    ])
      .then(([tasksRes, projectsRes]) => {
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
      })
      .catch((error) => {
        console.error('Search error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  const totalResults = tasks.length + projects.length;

  if (!query.trim()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter a search query to find tasks and projects</p>
        </div>

        <div className="card p-12 text-center">
          <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-1">No search query</h3>
          <p className="text-sm text-muted-foreground">Use the search bar above to find tasks and projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Search Results</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? 'Searching...' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="card p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4" />
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && totalResults === 0 && (
        <div className="card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-1">No results found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search query or searching for different keywords
          </p>
        </div>
      )}

      {/* Tasks Section */}
      {!loading && tasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Tasks ({tasks.length})
            </h2>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <Link
                key={task._id}
                href={`/dashboard/projects/${task.project}/board/${task.board}`}
                className="card p-4 hover:bg-accent transition-colors block"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1 truncate">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {task.assignee && (
                        <span>Assigned to {task.assignee.displayName || task.assignee.username}</span>
                      )}
                      <span className="capitalize">{task.status.replace('_', ' ')}</span>
                      <span className="capitalize">{task.priority}</span>
                    </div>
                  </div>
                  {task.color && (
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: task.color }}
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {!loading && projects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Projects ({projects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project._id}
                href={`/dashboard/projects/${project._id}`}
                className="card p-5 hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3">
                  {project.color && (
                    <div
                      className="w-10 h-10 rounded-lg shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
