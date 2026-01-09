const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpvabexbfkofaqzckmmw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmFiZXhiZmtvZmFxemNrbW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4ODkzNSwiZXhwIjoyMDYxMDY0OTM1fQ.gf98CCoaE-es6DCIuX5asrv4-Tqh36HjNv45ApfYMdg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getRecentSignups() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    // Sort by creation date, most recent first
    const sortedUsers = users.users.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );

    // Get top 20
    const recentUsers = sortedUsers.slice(0, 20);

    console.log('=== 20 Most Recent Signups ===\n');
    console.log('No. | Email                              | Signed Up');
    console.log('-'.repeat(70));

    recentUsers.forEach((user, idx) => {
      const email = user.email || 'N/A';
      const signupDate = new Date(user.created_at).toLocaleString();
      const paddedNum = String(idx + 1).padStart(2, ' ');
      const paddedEmail = email.padEnd(35, ' ');
      console.log(`${paddedNum}. | ${paddedEmail} | ${signupDate}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log(`Total Users: ${users.users.length}`);
    console.log(`Date Range: ${new Date(sortedUsers[sortedUsers.length - 1].created_at).toLocaleDateString()} to ${new Date(sortedUsers[0].created_at).toLocaleDateString()}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

getRecentSignups();
