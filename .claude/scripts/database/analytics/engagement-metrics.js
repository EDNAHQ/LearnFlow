const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpvabexbfkofaqzckmmw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmFiZXhiZmtvZmFxemNrbW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4ODkzNSwiZXhwIjoyMDYxMDY0OTM1fQ.gf98CCoaE-es6DCIuX5asrv4-Tqh36HjNv45ApfYMdg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function engagementMetrics() {
  console.log('=== EDNA Builders - Detailed Engagement Metrics ===\n');

  try {
    // Get all data
    const [postsRes, commentsRes, messagesRes] = await Promise.all([
      supabase.from('posts').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('messages').select('*')
    ]);

    const posts = postsRes.data || [];
    const comments = commentsRes.data || [];
    const messages = messagesRes.data || [];

    console.log('📊 CONTENT DISTRIBUTION');
    console.log(`Posts: ${posts.length}`);
    console.log(`Comments: ${comments.length}`);
    console.log(`Messages: ${messages.length}`);
    console.log(`Total Interactions: ${posts.length + comments.length + messages.length}`);

    // Comments per post
    console.log('\n💬 COMMENT ANALYSIS');
    const commentsPerPost = (comments.length / posts.length).toFixed(2);
    console.log(`Comments per Post: ${commentsPerPost}`);

    // Most commented posts
    if (comments.length > 0) {
      const commentsByPost = {};
      comments.forEach(c => {
        const postId = c.post_id;
        commentsByPost[postId] = (commentsByPost[postId] || 0) + 1;
      });

      const topCommentedPosts = Object.entries(commentsByPost)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      console.log('\nMost Discussed Posts:');
      topCommentedPosts.forEach(([postId, count], idx) => {
        console.log(`  ${idx + 1}. Post ${postId.substring(0, 8)}... (${count} comments)`);
      });

      // Comment activity
      const commentsByDate = {};
      comments.forEach(c => {
        const date = new Date(c.created_at).toLocaleDateString();
        commentsByDate[date] = (commentsByDate[date] || 0) + 1;
      });

      console.log('\nComment Activity (last 7 days):');
      Object.entries(commentsByDate)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .slice(0, 7)
        .forEach(([date, count]) => {
          console.log(`  ${date}: ${count} comments`);
        });
    }

    // Message analysis
    console.log('\n\n✉️ MESSAGING');
    if (messages.length > 0) {
      const uniqueSenders = new Set(messages.map(m => m.sender_id || m.from_id)).size;
      const uniqueReceivers = new Set(messages.map(m => m.recipient_id || m.to_id)).size;
      console.log(`Active Conversations: ${uniqueSenders + uniqueReceivers} unique users`);
      console.log(`Messages Exchanged: ${messages.length}`);
      console.log(`Avg Messages per User: ${(messages.length / uniqueSenders).toFixed(1)}`);

      // Message timeline
      const messagesByDate = {};
      messages.forEach(m => {
        const date = new Date(m.created_at).toLocaleDateString();
        messagesByDate[date] = (messagesByDate[date] || 0) + 1;
      });

      console.log('\nMessage Activity (top 5 days):');
      Object.entries(messagesByDate)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([date, count]) => {
          console.log(`  ${date}: ${count} messages`);
        });
    }

    // Overall platform metrics
    console.log('\n\n🎯 PLATFORM HEALTH');
    const totalInteractions = posts.length + comments.length + messages.length;
    const uniqueUsers = new Set([
      ...posts.map(p => p.user_id),
      ...comments.map(c => c.user_id),
      ...messages.map(m => m.sender_id || m.from_id)
    ]).size;

    console.log(`Unique Content Creators: ${uniqueUsers}`);
    console.log(`Total Interactions: ${totalInteractions}`);
    console.log(`Interactions per User: ${(totalInteractions / uniqueUsers).toFixed(1)}`);

    // Activity trend
    const allActivity = [];
    posts.forEach(p => allActivity.push({ type: 'post', date: p.created_at }));
    comments.forEach(c => allActivity.push({ type: 'comment', date: c.created_at }));
    messages.forEach(m => allActivity.push({ type: 'message', date: m.created_at }));

    const activityByDate = {};
    allActivity.forEach(a => {
      const date = new Date(a.date).toLocaleDateString();
      activityByDate[date] = (activityByDate[date] || 0) + 1;
    });

    console.log('\nActivity Trend (last 10 days):');
    const sortedActivity = Object.entries(activityByDate)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .slice(0, 10);

    sortedActivity.forEach(([date, count]) => {
      const bar = '█'.repeat(Math.ceil(count / 10));
      console.log(`  ${date}: ${bar} ${count}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

engagementMetrics();
