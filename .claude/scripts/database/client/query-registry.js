/**
 * Query Registry for EDNA Analytics
 * Pre-built, safe SQL queries organized by category
 * Prevents arbitrary SQL execution and ensures query quality
 */

const queryRegistry = {
  /**
   * PROJECT ANALYTICS QUERIES
   */
  project: {
    /**
     * Get project overview (status, metrics, health)
     */
    getProjectOverview: {
      name: 'Project Overview',
      description: 'Get high-level project status and metrics',
      sql: `
        SELECT
          p.id,
          p.name,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as in_progress_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'blocked' THEN t.id END) as blocked_tasks,
          AVG(CASE WHEN t.priority = 'p0' THEN 1 WHEN t.priority = 'p1' THEN 2 WHEN t.priority = 'p2' THEN 3 ELSE 4 END) as avg_priority,
          MAX(t.updated_at) as last_update
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.id = $1
        GROUP BY p.id, p.name
      `,
      params: ['projectId'],
      cache: true,
    },

    /**
     * List all projects with summary
     */
    listProjects: {
      name: 'List Projects',
      description: 'Get summary of all projects',
      sql: `
        SELECT
          p.id,
          p.name,
          COUNT(t.id) as task_count,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count,
          ROUND(100.0 * COUNT(CASE WHEN t.status = 'completed' THEN 1 END) / NULLIF(COUNT(t.id), 0), 1) as completion_rate,
          MAX(t.updated_at) as last_update
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id, p.name
        ORDER BY MAX(t.updated_at) DESC
      `,
      params: [],
      cache: true,
    },

    /**
     * Get project health score (0-100)
     */
    getProjectHealth: {
      name: 'Project Health',
      description: 'Calculate project health score based on multiple metrics',
      sql: `
        WITH metrics AS (
          SELECT
            p.id,
            -- Completion rate (40% weight)
            COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::float /
            NULLIF(COUNT(t.id), 0) * 40 as completion_score,

            -- On-time delivery (30% weight)
            COUNT(CASE WHEN t.due_date >= NOW() OR t.status = 'completed' THEN 1 END)::float /
            NULLIF(COUNT(CASE WHEN t.due_date IS NOT NULL THEN 1 END), 0) * 30 as on_time_score,

            -- No blockers (20% weight)
            CASE WHEN COUNT(CASE WHEN t.status = 'blocked' THEN 1 END) = 0 THEN 20 ELSE 0 END as blocker_score,

            -- Recent activity (10% weight)
            CASE WHEN MAX(t.updated_at) >= NOW() - INTERVAL '7 days' THEN 10 ELSE 0 END as activity_score
          FROM projects p
          LEFT JOIN tasks t ON p.id = t.project_id
          WHERE p.id = $1
          GROUP BY p.id
        )
        SELECT
          COALESCE(completion_score, 0) +
          COALESCE(on_time_score, 0) +
          COALESCE(blocker_score, 0) +
          COALESCE(activity_score, 0) as health_score
        FROM metrics
      `,
      params: ['projectId'],
      cache: true,
    },
  },

  /**
   * TASK ANALYTICS QUERIES
   */
  task: {
    /**
     * Get overdue tasks
     */
    getOverdueTasks: {
      name: 'Overdue Tasks',
      description: 'Find all overdue tasks across projects',
      sql: `
        SELECT
          t.id,
          t.title,
          t.project_id,
          t.priority,
          t.due_date,
          EXTRACT(DAY FROM NOW() - t.due_date) as days_overdue,
          t.assigned_to,
          t.status
        FROM tasks t
        WHERE t.due_date < NOW()
          AND t.status != 'completed'
          AND t.status != 'cancelled'
        ORDER BY t.due_date ASC
        LIMIT $1
      `,
      params: ['limit'],
      cache: false, // Always fresh
    },

    /**
     * Get blocked tasks
     */
    getBlockedTasks: {
      name: 'Blocked Tasks',
      description: 'Find tasks that are blocked and their blockers',
      sql: `
        SELECT
          t.id,
          t.title,
          t.project_id,
          t.status,
          t.blocked_by,
          bt.title as blocker_title,
          bt.status as blocker_status
        FROM tasks t
        LEFT JOIN tasks bt ON t.blocked_by = bt.id
        WHERE t.status = 'blocked'
        ORDER BY t.created_at ASC
      `,
      params: [],
      cache: false,
    },

    /**
     * Get task velocity (completed tasks by week)
     */
    getVelocity: {
      name: 'Task Velocity',
      description: 'Calculate team velocity - completed tasks per week',
      sql: `
        SELECT
          DATE_TRUNC('week', t.completed_at)::DATE as week,
          COUNT(t.id) as completed_tasks,
          ROUND(AVG(EXTRACT(DAY FROM t.completed_at - t.created_at)), 1) as avg_days_to_complete
        FROM tasks t
        WHERE t.status = 'completed'
          AND t.completed_at >= NOW() - INTERVAL '12 weeks'
          AND t.project_id = $1
        GROUP BY DATE_TRUNC('week', t.completed_at)
        ORDER BY week DESC
      `,
      params: ['projectId'],
      cache: true,
    },

    /**
     * Get cycle time analysis
     */
    getCycleTime: {
      name: 'Cycle Time',
      description: 'Analyze how long tasks take from creation to completion',
      sql: `
        SELECT
          t.priority,
          COUNT(t.id) as task_count,
          ROUND(AVG(EXTRACT(DAY FROM t.completed_at - t.created_at)), 1) as avg_days,
          ROUND(MIN(EXTRACT(DAY FROM t.completed_at - t.created_at)), 1) as min_days,
          ROUND(MAX(EXTRACT(DAY FROM t.completed_at - t.created_at)), 1) as max_days,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(DAY FROM t.completed_at - t.created_at)) as median_days
        FROM tasks t
        WHERE t.status = 'completed'
          AND t.completed_at >= NOW() - INTERVAL '90 days'
          AND t.project_id = $1
        GROUP BY t.priority
        ORDER BY CASE WHEN t.priority = 'p0' THEN 1 WHEN t.priority = 'p1' THEN 2 WHEN t.priority = 'p2' THEN 3 ELSE 4 END
      `,
      params: ['projectId'],
      cache: true,
    },
  },

  /**
   * CROSS-PROJECT ANALYTICS
   */
  cross_project: {
    /**
     * Compare metrics across all projects
     */
    compareAllProjects: {
      name: 'Compare All Projects',
      description: 'Side-by-side comparison of all projects',
      sql: `
        SELECT
          p.id,
          p.name,
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed,
          ROUND(100.0 * COUNT(CASE WHEN t.status = 'completed' THEN 1 END) / NULLIF(COUNT(t.id), 0), 1) as completion_pct,
          COUNT(CASE WHEN t.status = 'blocked' THEN 1 END) as blocked_count,
          COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'completed' THEN 1 END) as overdue_count,
          MAX(t.updated_at) as last_activity
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id, p.name
        ORDER BY p.name
      `,
      params: [],
      cache: true,
    },

    /**
     * Find common issues across projects
     */
    findCommonPatterns: {
      name: 'Common Patterns',
      description: 'Identify recurring issues and patterns across projects',
      sql: `
        SELECT
          SUBSTRING(t.title FROM 1 FOR 30) as pattern,
          COUNT(DISTINCT p.id) as projects_affected,
          COUNT(t.id) as total_occurrences,
          ARRAY_AGG(DISTINCT p.name) as project_names
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.status = 'blocked' OR t.status IN (SELECT DISTINCT status FROM tasks WHERE created_at >= NOW() - INTERVAL '30 days')
        GROUP BY SUBSTRING(t.title FROM 1 FOR 30)
        HAVING COUNT(DISTINCT p.id) > 1
        ORDER BY COUNT(t.id) DESC
        LIMIT 10
      `,
      params: [],
      cache: true,
    },
  },

  /**
   * UTILITY QUERIES
   */
  utility: {
    /**
     * Check database connection
     */
    healthCheck: {
      name: 'Health Check',
      description: 'Verify database connectivity',
      sql: 'SELECT NOW() as timestamp, 1 as status',
      params: [],
      cache: false,
    },

    /**
     * Get table statistics
     */
    getTableStats: {
      name: 'Table Statistics',
      description: 'Get row counts and sizes for main tables',
      sql: `
        SELECT
          schemaname,
          tablename,
          n_live_tup as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `,
      params: [],
      cache: true,
    },
  },
};

/**
 * Get a query by path (e.g., 'project.getProjectOverview')
 */
function getQuery(path) {
  const parts = path.split('.');
  let query = queryRegistry;

  for (const part of parts) {
    if (query && typeof query === 'object') {
      query = query[part];
    } else {
      return null;
    }
  }

  return query;
}

/**
 * List all available queries
 */
function listQueries() {
  const queries = [];

  function traverse(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && value.sql) {
        queries.push({
          path,
          name: value.name,
          description: value.description,
          cache: value.cache,
        });
      } else if (value && typeof value === 'object') {
        traverse(value, path);
      }
    }
  }

  traverse(queryRegistry);
  return queries;
}

module.exports = {
  queryRegistry,
  getQuery,
  listQueries,
};
