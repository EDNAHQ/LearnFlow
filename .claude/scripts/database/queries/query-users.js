const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpvabexbfkofaqzckmmw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmFiZXhiZmtvZmFxemNrbW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODg5MzUsImV4cCI6MjA2MTA2NDkzNX0.NatFClMQvVhR6REOgYZf-_O55r_xiehoqHF-fTTv-M8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeUsers() {
  try {
    // Get total user count
    const { count: totalUsers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting users:', countError);
      return;
    }

    // Get user data with creation dates
    const { data: users, error: dataError } = await supabase
      .from('users')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (dataError) {
      console.error('Error fetching users:', dataError);
      return;
    }

    console.log('=== EDNA Builders User Analysis ===\n');
    console.log(`Total Users: ${totalUsers}`);

    if (users && users.length > 0) {
      const lastUser = users[0];
      const firstUser = users[users.length - 1];

      console.log(`\nNewest User Joined: ${lastUser.created_at}`);
      console.log(`First User Joined: ${firstUser.created_at}`);

      // Group by date
      const usersByDate = {};
      users.forEach(user => {
        const date = new Date(user.created_at).toLocaleDateString();
        usersByDate[date] = (usersByDate[date] || 0) + 1;
      });

      console.log('\nUsers Joined by Date (last 10 days):');
      Object.entries(usersByDate)
        .slice(0, 10)
        .forEach(([date, count]) => {
          console.log(`  ${date}: ${count} users`);
        });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzeUsers();
