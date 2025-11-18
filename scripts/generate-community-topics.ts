import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hjivfywgkiwjvpquxndg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateTopics() {
  console.log('Calling generate-daily-community-topics edge function...');
  
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-daily-community-topics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error calling function:', response.status, errorText);
    throw new Error(`Function call failed: ${response.status}`);
  }

  const result = await response.json();
  console.log('Function result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log(`\n✅ Successfully created ${result.pathsCreated} learning paths!`);
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Some errors occurred:');
      result.errors.forEach((err: string) => console.log(`  - ${err}`));
    }
    
    // Verify paths were created
    const { data: paths, error } = await supabase
      .from('learning_paths')
      .select('id, topic, is_public, published_at')
      .in('id', result.pathIds)
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Error verifying paths:', error);
    } else {
      console.log(`\n📚 Created paths:`);
      paths?.forEach((path, i) => {
        console.log(`  ${i + 1}. ${path.topic} (${path.id})`);
      });
    }
  } else {
    console.error('Function returned error:', result.error);
  }
}

generateTopics().catch(console.error);

