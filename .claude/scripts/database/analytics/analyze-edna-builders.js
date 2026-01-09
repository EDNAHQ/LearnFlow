const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpvabexbfkofaqzckmmw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmFiZXhiZmtvZmFxemNrbW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4ODkzNSwiZXhwIjoyMDYxMDY0OTM1fQ.gf98CCoaE-es6DCIuX5asrv4-Tqh36HjNv45ApfYMdg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeEDNA() {
  console.log('=== EDNA Builders Comprehensive Analysis ===\n');

  try {
    // Get project stats
    console.log('📊 PROJECTS');
    const { count: projectCount, data: projects } = await supabase
      .from('projects')
      .select('*', { count: 'exact' });
    console.log(`Total Projects: ${projectCount}`);

    if (projects && projects.length > 0) {
      const statusBreakdown = {};
      projects.forEach(p => {
        const status = p.status || 'unknown';
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });
      console.log('Status Breakdown:', JSON.stringify(statusBreakdown));

      // Find most recent project
      const recentProjects = projects.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 3);
      console.log('\nRecent Projects:');
      recentProjects.forEach(p => {
        console.log(`  • ${p.name || p.title || 'Unnamed'} (${new Date(p.created_at).toLocaleDateString()})`);
      });
    }

    // Get task stats
    console.log('\n\n📋 TASKS');
    const { count: taskCount, data: tasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' });
    console.log(`Total Tasks: ${taskCount}`);

    if (tasks && tasks.length > 0) {
      const statusBreakdown = {};
      tasks.forEach(t => {
        const status = t.status || 'unknown';
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });
      console.log('Status Breakdown:', JSON.stringify(statusBreakdown));

      const completionRate = statusBreakdown['completed']
        ? ((statusBreakdown['completed'] / taskCount) * 100).toFixed(1)
        : 0;
      console.log(`Task Completion Rate: ${completionRate}%`);

      // Find most active days
      const tasksByDate = {};
      tasks.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString();
        tasksByDate[date] = (tasksByDate[date] || 0) + 1;
      });
      const topDays = Object.entries(tasksByDate)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      console.log('\nMost Active Days (Task Creation):');
      topDays.forEach(([date, count]) => {
        console.log(`  ${date}: ${count} tasks`);
      });
    }

    // Get idea stats
    console.log('\n\n💡 IDEAS');
    const { count: ideaCount, data: ideas } = await supabase
      .from('ideas')
      .select('*', { count: 'exact' });
    console.log(`Total Ideas: ${ideaCount}`);

    if (ideas && ideas.length > 0) {
      const recentIdeas = ideas.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5);
      console.log('\nRecent Ideas:');
      recentIdeas.forEach(i => {
        console.log(`  • ${i.title || i.name || 'Untitled'} (${new Date(i.created_at).toLocaleDateString()})`);
      });
    }

    // Get analysis results stats
    console.log('\n\n🔍 ANALYSIS RESULTS');
    const { count: analysisCount, data: analyses } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact' });
    console.log(`Total Analysis Results: ${analysisCount}`);

    if (analyses && analyses.length > 0) {
      // Group by type if available
      const typeBreakdown = {};
      analyses.forEach(a => {
        const type = a.type || a.analysis_type || 'unknown';
        typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
      });
      console.log('Analysis Types:', JSON.stringify(typeBreakdown));
    }

    // Overall engagement score
    console.log('\n\n🎯 ENGAGEMENT METRICS');
    const totalContent = (projectCount || 0) + (taskCount || 0) + (ideaCount || 0) + (analysisCount || 0);
    console.log(`Total Content Items: ${totalContent}`);
    console.log(`Average Items per User: ${(totalContent / 50).toFixed(1)}`);

    // Activity timeline
    const allActivities = [];
    if (projects) allActivities.push(...projects.map(p => ({ type: 'project', date: p.created_at })));
    if (tasks) allActivities.push(...tasks.map(t => ({ type: 'task', date: t.created_at })));
    if (ideas) allActivities.push(...ideas.map(i => ({ type: 'idea', date: i.created_at })));
    if (analyses) allActivities.push(...analyses.map(a => ({ type: 'analysis', date: a.created_at })));

    if (allActivities.length > 0) {
      const activityByDate = {};
      allActivities.forEach(a => {
        const date = new Date(a.date).toLocaleDateString();
        activityByDate[date] = (activityByDate[date] || 0) + 1;
      });

      const topActivityDates = Object.entries(activityByDate)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      console.log('\nTop Activity Days:');
      topActivityDates.forEach(([date, count]) => {
        console.log(`  ${date}: ${count} items created`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzeEDNA();
