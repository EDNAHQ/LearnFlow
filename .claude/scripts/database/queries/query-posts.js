const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpvabexbfkofaqzckmmw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmFiZXhiZmtvZmFxemNrbW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODg5MzUsImV4cCI6MjA2MTA2NDkzNX0.NatFClMQvVhR6REOgYZf-_O55r_xiehoqHF-fTTv-M8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzePostActivity() {
  try {
    // Get total post count
    const { count: totalPosts, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting posts:', countError);
      return;
    }

    // Get posts with time series
    const { data: posts, error: dataError } = await supabase
      .from('posts')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (dataError) {
      console.error('Error fetching posts:', dataError);
      return;
    }

    console.log('=== EDNA Builders Post Analysis ===\n');
    console.log(`Total Posts: ${totalPosts}`);

    if (posts && posts.length > 0) {
      const lastPost = posts[0];
      const firstPost = posts[posts.length - 1];

      console.log(`\nMost Recent Post: ${lastPost.created_at}`);
      console.log(`Oldest Post: ${firstPost.created_at}`);

      // Group by date
      const postsByDate = {};
      posts.forEach(post => {
        const date = new Date(post.created_at).toLocaleDateString();
        postsByDate[date] = (postsByDate[date] || 0) + 1;
      });

      console.log('\nPosts by Date (last 10 days):');
      Object.entries(postsByDate)
        .slice(0, 10)
        .forEach(([date, count]) => {
          console.log(`  ${date}: ${count} posts`);
        });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzePostActivity();
