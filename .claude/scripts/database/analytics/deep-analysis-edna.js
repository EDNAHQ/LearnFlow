const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpvabexbfkofaqzckmmw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmFiZXhiZmtvZmFxemNrbW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4ODkzNSwiZXhwIjoyMDYxMDY0OTM1fQ.gf98CCoaE-es6DCIuX5asrv4-Tqh36HjNv45ApfYMdg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deepAnalysis() {
  console.log('=== EDNA Builders Deep Dive Analysis ===\n');

  try {
    // Check posts table (we know this has data)
    console.log('📝 POSTS & ENGAGEMENT');
    const { count: postCount, data: posts } = await supabase
      .from('posts')
      .select('*', { count: 'exact' });
    console.log(`Total Posts: ${postCount}`);

    if (posts && posts.length > 0) {
      // Activity timeline
      const postsByDate = {};
      posts.forEach(p => {
        const date = new Date(p.created_at).toLocaleDateString();
        postsByDate[date] = (postsByDate[date] || 0) + 1;
      });

      const sortedDates = Object.entries(postsByDate)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]));

      console.log('\nPosty Activity Over Time:');
      sortedDates.slice(0, 15).forEach(([date, count]) => {
        const bar = '█'.repeat(Math.ceil(count / 2));
        console.log(`  ${date}: ${bar} ${count}`);
      });

      // Daily average
      const daySpan = (new Date(posts[posts.length - 1].created_at) - new Date(posts[0].created_at)) / (1000 * 60 * 60 * 24);
      const postsPerDay = (postCount / daySpan).toFixed(2);
      console.log(`\nAverage Posts per Day: ${postsPerDay}`);

      // Engagement patterns
      const hourlyBreakdown = {};
      posts.forEach(p => {
        const hour = new Date(p.created_at).getHours();
        hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + 1;
      });

      const peakHour = Object.entries(hourlyBreakdown)
        .sort((a, b) => b[1] - a[1])[0];
      console.log(`Peak Activity Hour: ${peakHour[0]}:00 (${peakHour[1]} posts)`);

      // Most prolific posters (if user_id exists)
      if (posts[0].user_id) {
        const postsByUser = {};
        posts.forEach(p => {
          postsByUser[p.user_id] = (postsByUser[p.user_id] || 0) + 1;
        });

        const topPosters = Object.entries(postsByUser)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        console.log('\nTop Contributors:');
        topPosters.forEach(([userId, count], idx) => {
          console.log(`  ${idx + 1}. User ${userId.substring(0, 8)}... (${count} posts)`);
        });
      }
    }

    // Check for comments or reactions
    console.log('\n\n💬 CHECKING OTHER TABLES...');
    const tableNames = ['comments', 'reactions', 'members', 'likes', 'follows', 'messages'];

    for (const table of tableNames) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        if (count !== null && count > 0) {
          console.log(`✓ ${table}: ${count} records`);
        }
      } catch (e) {
        // Table doesn't exist
      }
    }

    // User engagement
    console.log('\n\n👥 USER ENGAGEMENT');
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const usersWithPosts = new Set(posts?.map(p => p.user_id) || []);
    const engagementRate = (usersWithPosts.size / authUsers.users.length * 100).toFixed(1);
    console.log(`Total Users: ${authUsers.users.length}`);
    console.log(`Users with Posts: ${usersWithPosts.size}`);
    console.log(`Engagement Rate: ${engagementRate}%`);

    // Content distribution
    const postsPerUser = (postCount / usersWithPosts.size).toFixed(1);
    console.log(`Average Posts per Active User: ${postsPerUser}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

deepAnalysis();
