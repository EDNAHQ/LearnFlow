import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createAIClient } from "../_shared/ai-provider/index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const aiClient = createAIClient();

    console.log('Starting daily community topic generation...');

    const systemMessage = `You are an expert at identifying interesting, educational topics that would make great learning paths. 
You understand what makes a topic engaging, valuable, and worth learning.`;

    const prompt = `Generate exactly 10 diverse, interesting, and educational topics that would make excellent learning paths for a community learning platform.

CRITICAL REQUIREMENT: All topics MUST fall into one of these four categories:
1. **Data-related**: Data analysis, data engineering, data science, data visualization, data pipelines, ETL processes, data warehousing, data modeling, business intelligence, data governance, etc.
2. **Application-related**: Web applications, mobile apps, desktop applications, API development, full-stack development, microservices, cloud-native apps, progressive web apps, etc.
3. **Automation-related**: Workflow automation, CI/CD pipelines, infrastructure automation, process automation, scripting, task scheduling, robotic process automation (RPA), etc.
4. **AI-related**: Machine learning, AI agents, large language models (LLMs), computer vision, natural language processing, AI integrations, prompt engineering, AI tooling, etc.

Requirements:
- Generate a balanced mix across all four categories (aim for 2-3 topics per category)
- Topics should be UNIQUE and CREATIVE - avoid generic topics like "React Basics", "Python 101", "Docker Introduction"
- Think of CURRENT trends, emerging technologies, and practical applications
- Each topic should be specific enough to create a meaningful 10-step learning path
- Topics should be current, relevant, and valuable to learners
- Avoid topics that are too broad (like "Programming") or too narrow (like "How to use a specific button")
- Each topic should be 2-5 words
- Make topics engaging and appealing
- Focus on practical, hands-on skills that learners can apply

Examples of GOOD topics by category:
- Data: "Building Real-Time Data Pipelines", "Advanced Data Visualization Techniques", "Data Warehouse Design Patterns"
- Application: "Building Serverless Microservices", "Progressive Web App Development", "API Gateway Architecture"
- Automation: "Infrastructure as Code with Terraform", "CI/CD Pipeline Optimization", "Workflow Automation with Zapier"
- AI: "Building AI Agents with LangChain", "Fine-Tuning LLMs for Specific Tasks", "Computer Vision Applications"

You MUST return a valid JSON object with this exact structure:
{
  "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5", "Topic 6", "Topic 7", "Topic 8", "Topic 9", "Topic 10"]
}

Include exactly 10 topics. Do not include any other text, markdown, or explanation outside the JSON object.`;

    const aiResponse = await aiClient.chat({
      functionType: 'content-generation',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      responseFormat: 'json_object',
      maxTokens: 500,
    });

    let topics: string[] = [];
    try {
      const content = aiResponse.content;
      let parsed: any;
      
      if (typeof content === 'string') {
        // Try to parse as JSON
        parsed = JSON.parse(content);
      } else {
        parsed = content;
      }
      
      // Handle different response formats
      if (parsed.topics && Array.isArray(parsed.topics)) {
        topics = parsed.topics.filter((t: any) => typeof t === 'string' && t.trim().length > 0);
      } else if (Array.isArray(parsed)) {
        topics = parsed.filter((t: any) => typeof t === 'string' && t.trim().length > 0);
      } else if (parsed.topic_list && Array.isArray(parsed.topic_list)) {
        topics = parsed.topic_list.filter((t: any) => typeof t === 'string' && t.trim().length > 0);
      } else {
        console.error('Unexpected response format:', parsed);
        throw new Error('Invalid response format - expected array of topics');
      }
      
      // Validate we got topics
      if (topics.length === 0) {
        throw new Error('No valid topics found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', aiResponse.content);
      throw new Error(`Failed to parse topics: ${parseError.message}`);
    }

    console.log(`Generated ${topics.length} topics:`, topics);

    const createdPaths: string[] = [];
    const errors: string[] = [];
    let skippedCount = 0;
    
    // Generate fewer topics per run - 1-2 instead of 10
    // This spreads the load and prevents timeouts
    const topicsToGenerate = topics.slice(0, 2); // Only 2 at a time

    for (const topic of topicsToGenerate) {
      try {
        console.log(`Creating learning path for topic: ${topic}`);

        // Get a system user for AI-generated content
        // First try to find a system user, otherwise use the first available user
        let systemUserId: string | null = null;
        
        const { data: systemUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', 'system@learnflow.ai')
          .maybeSingle();
        
        if (systemUser?.id) {
          systemUserId = systemUser.id;
        } else {
          // Fallback: use the first available user
          const { data: anyUser } = await supabase
            .from('profiles')
            .select('id')
            .limit(1)
            .maybeSingle();
          
          if (anyUser?.id) {
            systemUserId = anyUser.id;
          } else {
            console.error('No users found in profiles table. Cannot create learning path without user_id.');
            errors.push(`${topic}: No system user available`);
            continue;
          }
        }

        // Check if this exact topic was created recently (last 24 hours) to avoid immediate duplicates
        // But allow similar topics - we want variety
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentDuplicate } = await supabase
          .from('learning_paths')
          .select('id')
          .eq('topic', topic.trim())
          .eq('is_public', true)
          .gte('created_at', oneDayAgo)
          .maybeSingle();
        
        if (recentDuplicate) {
          console.log(`Topic "${topic}" was created recently (last 24h), skipping...`);
          skippedCount++;
          continue;
        }

        const { data: newPath, error: pathError } = await supabase
          .from('learning_paths')
          .insert({
            topic: topic.trim(),
            title: topic.trim(),
            user_id: systemUserId,
            is_public: true,
            is_approved: true,
            published_at: new Date().toISOString(),
            is_completed: false,
            category: categorizeTopic(topic),
            difficulty_level: 'intermediate',
            tags: generateTags(topic)
          })
          .select()
          .single();

        if (pathError) {
          console.error(`Error creating path for ${topic}:`, pathError);
          errors.push(`${topic}: ${pathError.message}`);
          continue;
        }

        if (!newPath) {
          console.error(`No path returned for ${topic}`);
          errors.push(`${topic}: No path returned`);
          continue;
        }

        console.log(`Created path ${newPath.id} for topic: ${topic}`);

        // Generate learning plan (this is fast - just 10 step titles/descriptions)
        const planResponse = await fetch(`${supabaseUrl}/functions/v1/generate-learning-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            generatePlan: true,
            topic: topic.trim(),
            pathId: newPath.id
          })
        });

        if (!planResponse.ok) {
          const errorText = await planResponse.text();
          console.error(`Error generating plan for ${topic}:`, errorText);
          errors.push(`${topic}: Plan generation failed`);
          continue;
        }

        const planData = await planResponse.json();
        if (!planData.steps || !Array.isArray(planData.steps)) {
          console.error(`Invalid plan response for ${topic}`);
          errors.push(`${topic}: Invalid plan response`);
          continue;
        }

        // Create steps with just titles/descriptions - detailed content generated lazily
        const steps = planData.steps.map((step: any, index: number) => ({
          path_id: newPath.id,
          title: step.title,
          content: step.description, // Brief description only
          detailed_content: null, // Will be generated when user views the step
          order_index: index,
          completed: false
        }));

        const { error: stepsError } = await supabase
          .from('learning_steps')
          .insert(steps);

        if (stepsError) {
          console.error(`Error creating steps for ${topic}:`, stepsError);
          errors.push(`${topic}: Steps creation failed`);
          continue;
        }

        console.log(`Successfully created ${steps.length} steps for ${topic} (content will generate on-demand)`);
        createdPaths.push(newPath.id);

      } catch (error) {
        console.error(`Error processing topic ${topic}:`, error);
        errors.push(`${topic}: ${error.message}`);
      }
    }

    const result = {
      success: true,
      topicsGenerated: topicsToGenerate.length,
      topicsAttempted: topicsToGenerate,
      pathsCreated: createdPaths.length,
      pathIds: createdPaths,
      errors: errors.length > 0 ? errors : undefined,
      skipped: skippedCount,
      note: 'Detailed content will be generated when users view each step'
    };

    console.log('Daily community topic generation completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-daily-community-topics:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function categorizeTopic(topic: string): string {
  const lowerTopic = topic.toLowerCase();
  
  // AI-related keywords
  if (lowerTopic.includes('ai') || lowerTopic.includes('artificial intelligence') || 
      lowerTopic.includes('machine learning') || lowerTopic.includes('ml') ||
      lowerTopic.includes('llm') || lowerTopic.includes('large language model') ||
      lowerTopic.includes('neural network') || lowerTopic.includes('deep learning') ||
      lowerTopic.includes('computer vision') || lowerTopic.includes('nlp') ||
      lowerTopic.includes('natural language') || lowerTopic.includes('prompt engineering') ||
      lowerTopic.includes('langchain') || lowerTopic.includes('agent') ||
      lowerTopic.includes('transformer') || lowerTopic.includes('gpt') ||
      lowerTopic.includes('openai') || lowerTopic.includes('claude')) {
    return 'AI';
  }
  
  // Data-related keywords
  if (lowerTopic.includes('data') || lowerTopic.includes('database') ||
      lowerTopic.includes('etl') || lowerTopic.includes('data pipeline') ||
      lowerTopic.includes('data warehouse') || lowerTopic.includes('data visualization') ||
      lowerTopic.includes('data analysis') || lowerTopic.includes('data science') ||
      lowerTopic.includes('data engineering') || lowerTopic.includes('business intelligence') ||
      lowerTopic.includes('bi ') || lowerTopic.includes('data modeling') ||
      lowerTopic.includes('data governance') || lowerTopic.includes('data lake') ||
      lowerTopic.includes('analytics') || lowerTopic.includes('data mining')) {
    return 'Data';
  }
  
  // Automation-related keywords
  if (lowerTopic.includes('automation') || lowerTopic.includes('ci/cd') ||
      lowerTopic.includes('cicd') || lowerTopic.includes('pipeline') ||
      lowerTopic.includes('terraform') || lowerTopic.includes('infrastructure as code') ||
      lowerTopic.includes('iac') || lowerTopic.includes('ansible') ||
      lowerTopic.includes('workflow') || lowerTopic.includes('rpa') ||
      lowerTopic.includes('robotic process') || lowerTopic.includes('zapier') ||
      lowerTopic.includes('scripting') || lowerTopic.includes('scheduling') ||
      lowerTopic.includes('orchestration') || lowerTopic.includes('deployment automation')) {
    return 'Automation';
  }
  
  // Application-related keywords (web apps, mobile apps, APIs, etc.)
  if (lowerTopic.includes('application') || lowerTopic.includes('app') ||
      lowerTopic.includes('api') || lowerTopic.includes('microservice') ||
      lowerTopic.includes('web app') || lowerTopic.includes('mobile app') ||
      lowerTopic.includes('full-stack') || lowerTopic.includes('fullstack') ||
      lowerTopic.includes('serverless') || lowerTopic.includes('progressive web') ||
      lowerTopic.includes('pwa') || lowerTopic.includes('backend') ||
      lowerTopic.includes('frontend') || lowerTopic.includes('full stack') ||
      lowerTopic.includes('rest api') || lowerTopic.includes('graphql') ||
      lowerTopic.includes('cloud-native') || lowerTopic.includes('desktop app')) {
    return 'Application';
  }
  
  // Default fallback - if none match, try to infer from context
  // If it has tech keywords but doesn't fit above, likely Application
  if (lowerTopic.includes('development') || lowerTopic.includes('programming') ||
      lowerTopic.includes('code') || lowerTopic.includes('software')) {
    return 'Application';
  }
  
  return 'Application'; // Default to Application as most topics will be tech-focused
}

function generateTags(topic: string): string[] {
  const tags: string[] = [];
  const words = topic.toLowerCase().split(/\s+/);
  
  words.forEach(word => {
    if (word.length > 3) {
      tags.push(word);
    }
  });
  
  return tags.slice(0, 3);
}

