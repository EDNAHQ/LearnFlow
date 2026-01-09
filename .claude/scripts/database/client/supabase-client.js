/**
 * Supabase Client Library for EDNA Analytics
 * Handles connection pooling, caching, error handling, and query execution
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

class SupabaseConnection {
  constructor(projectConfig) {
    this.projectConfig = projectConfig;
    this.client = null;
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTTL = 300000; // 5 minutes default
    this.stats = {
      queriesExecuted: 0,
      cacheHits: 0,
      cacheErrors: 0,
    };
  }

  /**
   * Initialize connection with project configuration
   */
  async initialize() {
    try {
      const url = this.projectConfig.supabase_url;
      const apiKey = process.env[this.projectConfig.api_key_env] || process.env.SUPABASE_API_KEY;

      if (!apiKey) {
        throw new Error(
          `Missing API key. Set ${this.projectConfig.api_key_env} environment variable`
        );
      }

      this.client = createClient(url, apiKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
          detectSessionInUrl: false,
        },
      });

      console.log(`✓ Connected to ${this.projectConfig.name}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to connect to ${this.projectConfig.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Execute a query with caching and error handling
   */
  async query(sql, params = {}, options = {}) {
    const { cache = true, cacheTTL = this.cacheTTL } = options;

    // Generate cache key
    const cacheKey = `${sql}:${JSON.stringify(params)}`;

    // Check cache
    if (cache && this.cache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey);
      if (expiry && Date.now() < expiry) {
        this.stats.cacheHits++;
        return {
          data: this.cache.get(cacheKey),
          cached: true,
          source: this.projectConfig.name,
        };
      }
      // Cache expired
      this.cache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
    }

    try {
      this.stats.queriesExecuted++;

      // Execute query via RPC or raw SQL
      const { data, error } = await this.client.rpc('execute_sql', {
        query: sql,
        params: params,
      });

      if (error) {
        throw error;
      }

      // Cache result
      if (cache) {
        this.cache.set(cacheKey, data);
        this.cacheExpiry.set(cacheKey, Date.now() + cacheTTL);
      }

      return {
        data,
        cached: false,
        source: this.projectConfig.name,
      };
    } catch (error) {
      this.stats.cacheErrors++;
      console.error(`Query error in ${this.projectConfig.name}:`, error.message);
      throw {
        message: error.message,
        project: this.projectConfig.name,
        query: sql,
      };
    }
  }

  /**
   * Execute multiple queries in batch
   */
  async batchQuery(queries, options = {}) {
    const { parallel = false } = options;

    try {
      let results;
      if (parallel) {
        results = await Promise.all(
          queries.map((q) => this.query(q.sql, q.params, q.options))
        );
      } else {
        results = [];
        for (const q of queries) {
          const result = await this.query(q.sql, q.params, q.options);
          results.push(result);
        }
      }
      return results;
    } catch (error) {
      console.error('Batch query failed:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log(`✓ Cache cleared for ${this.projectConfig.name}`);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      project: this.projectConfig.name,
      queriesExecuted: this.stats.queriesExecuted,
      cacheHits: this.stats.cacheHits,
      cacheMissRate: (this.stats.cacheErrors / this.stats.queriesExecuted || 0).toFixed(2),
      cacheSize: this.cache.size,
    };
  }
}

/**
 * Multi-project connection manager
 */
class SupabaseManager {
  constructor(configPath) {
    this.configPath = configPath;
    this.connections = new Map();
    this.config = null;
  }

  /**
   * Load configuration from projects.json
   */
  loadConfig() {
    try {
      const content = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(content);
      console.log(`✓ Loaded config with ${this.config.projects.length} projects`);
      return this.config;
    } catch (error) {
      console.error('Failed to load config:', error.message);
      throw error;
    }
  }

  /**
   * Get or create connection for a project
   */
  async getConnection(projectId) {
    if (this.connections.has(projectId)) {
      return this.connections.get(projectId);
    }

    const project = this.config.projects.find((p) => p.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found in config`);
    }

    const connection = new SupabaseConnection(project);
    await connection.initialize();
    this.connections.set(projectId, connection);
    return connection;
  }

  /**
   * Query across multiple projects
   */
  async queryMultiProject(projectIds, sql, params = {}) {
    const results = {};

    for (const projectId of projectIds) {
      try {
        const connection = await this.getConnection(projectId);
        results[projectId] = await connection.query(sql, params);
      } catch (error) {
        results[projectId] = {
          error: error.message,
          project: projectId,
        };
      }
    }

    return results;
  }

  /**
   * Get all active projects
   */
  getActiveProjects() {
    return this.config.projects.filter((p) => p.active);
  }

  /**
   * Get statistics for all connections
   */
  getStats() {
    const stats = {
      totalConnections: this.connections.size,
      projects: {},
    };

    for (const [projectId, connection] of this.connections) {
      stats.projects[projectId] = connection.getStats();
    }

    return stats;
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    for (const connection of this.connections.values()) {
      connection.clearCache();
    }
    console.log(`✓ Cleared caches for ${this.connections.size} projects`);
  }
}

module.exports = {
  SupabaseConnection,
  SupabaseManager,
};
