const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpvabexbfkofaqzckmmw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmFiZXhiZmtvZmFxemNrbW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4ODkzNSwiZXhwIjoyMDYxMDY0OTM1fQ.gf98CCoaE-es6DCIuX5asrv4-Tqh36HjNv45ApfYMdg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeAuthUsers() {
  try {
    // Query auth.users table
    const { data: users, error: dataError } = await supabase.auth.admin.listUsers();

    if (dataError) {
      console.error('Error fetching users:', dataError);
      return;
    }

    console.log('=== EDNA Builders Auth Users Analysis ===\n');
    console.log(`Total Users: ${users.users.length}`);

    if (users.users.length > 0) {
      // Sort by created_at
      const sortedUsers = users.users.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );

      const firstUser = sortedUsers[0];
      const lastUser = sortedUsers[sortedUsers.length - 1];

      console.log(`\nFirst User Created: ${firstUser.created_at}`);
      console.log(`Latest User Created: ${lastUser.created_at}`);

      // Group by date
      const usersByDate = {};
      users.users.forEach(user => {
        const date = new Date(user.created_at).toLocaleDateString();
        usersByDate[date] = (usersByDate[date] || 0) + 1;
      });

      console.log('\nUsers Created by Date (last 10 days):');
      const sortedDates = Object.entries(usersByDate)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .slice(0, 10);

      sortedDates.forEach(([date, count]) => {
        console.log(`  ${date}: ${count} users`);
      });

      // User status breakdown
      const confirmedUsers = users.users.filter(u => u.email_confirmed_at).length;
      const unconfirmedUsers = users.users.length - confirmedUsers;

      console.log(`\nUser Status:`);
      console.log(`  Confirmed: ${confirmedUsers}`);
      console.log(`  Unconfirmed: ${unconfirmedUsers}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzeAuthUsers();
