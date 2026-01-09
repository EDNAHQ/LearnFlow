const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpvabexbfkofaqzckmmw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmFiZXhiZmtvZmFxemNrbW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODg5MzUsImV4cCI6MjA2MTA2NDkzNX0.NatFClMQvVhR6REOgYZf-_O55r_xiehoqHF-fTTv-M8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    // Try to query information_schema to get available tables
    const { data, error } = await supabase
      .rpc('get_tables', {});

    if (error && error.code !== 'PGRST204') {
      // If RPC doesn't exist, try direct schema query
      console.log('Attempting to query available tables...\n');

      // Try querying each expected table from config
      const tables = ['projects', 'tasks', 'ideas', 'analysis_results', 'query_cache'];

      for (const table of tables) {
        const { count, error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!tableError) {
          console.log(`✓ ${table}: ${count} rows`);
        } else {
          console.log(`✗ ${table}: Not accessible`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listTables();
