// Personalization utilities for content generation
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface UserProfileData {
  role?: string | null;
  industry?: string | null;
  function?: string | null;
  experience_level?: string | null;
  goals_short_term?: string | null;
  goals_long_term?: string | null;
  immediate_challenge?: string | null;
  business_context?: string | null;
  learning_style?: string | null;
  preferred_pace?: string | null;
  content_complexity?: string | null;
  preferred_formats?: any;
  skill_data?: number | null;
  skill_apps?: number | null;
  skill_automation?: number | null;
  skill_ai_reasoning?: number | null;
  current_tools?: string[] | null;
}

export interface ContentPreferences {
  content_style?: 'conversational' | 'formal' | 'technical' | 'storytelling' | 'practical' | null;
  content_length?: 'brief' | 'standard' | 'detailed' | 'comprehensive' | null;
  content_complexity?: 'simplified' | 'balanced' | 'advanced' | 'expert' | null;
  preferred_examples?: 'real-world' | 'theoretical' | 'code-focused' | 'business-focused' | 'mixed' | null;
  learning_approach?: 'hands-on' | 'conceptual' | 'visual' | 'analytical' | 'balanced' | null;
}

// Fetch user profile data
export async function getUserProfile(
  userId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<UserProfileData | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.log('No user profile found or error:', error?.message);
    return null;
  }

  return data as UserProfileData;
}

// Fetch content preferences from learning path
export async function getContentPreferences(
  pathId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<ContentPreferences | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('learning_paths')
    .select('content_style, content_length, content_complexity, preferred_examples, learning_approach')
    .eq('id', pathId)
    .single();

  if (error || !data) {
    console.log('No content preferences found or error:', error?.message);
    return null;
  }

  return data as ContentPreferences;
}

// Build personalized context string for prompts
export function buildPersonalizationContext(
  userProfile: UserProfileData | null,
  preferences: ContentPreferences | null
): string {
  const contextParts: string[] = [];

  if (userProfile) {
    // Role and context
    if (userProfile.role) {
      contextParts.push(`Role: ${userProfile.role}`);
    }
    if (userProfile.industry) {
      contextParts.push(`Industry: ${userProfile.industry}`);
    }
    if (userProfile.function) {
      contextParts.push(`Function: ${userProfile.function}`);
    }

    // Experience level
    if (userProfile.experience_level) {
      const levelMap: { [key: string]: string } = {
        'beginner': 'Beginner - new to this domain',
        'competent': 'Competent - has foundational knowledge',
        'builder': 'Builder - experienced practitioner'
      };
      contextParts.push(`Experience Level: ${levelMap[userProfile.experience_level] || userProfile.experience_level}`);
    }

    // Goals and challenges
    if (userProfile.goals_short_term) {
      contextParts.push(`Short-term Goal: ${userProfile.goals_short_term}`);
    }
    if (userProfile.immediate_challenge) {
      contextParts.push(`Current Challenge: ${userProfile.immediate_challenge}`);
    }
    if (userProfile.business_context) {
      contextParts.push(`Business Context: ${userProfile.business_context}`);
    }

    // Learning preferences
    if (userProfile.learning_style) {
      contextParts.push(`Learning Style: ${userProfile.learning_style}`);
    }
    if (userProfile.preferred_pace) {
      contextParts.push(`Preferred Pace: ${userProfile.preferred_pace}`);
    }

    // Skills
    const skills: string[] = [];
    if (userProfile.skill_data) skills.push(`Data Skills: ${userProfile.skill_data}/5`);
    if (userProfile.skill_apps) skills.push(`Apps Skills: ${userProfile.skill_apps}/5`);
    if (userProfile.skill_automation) skills.push(`Automation Skills: ${userProfile.skill_automation}/5`);
    if (userProfile.skill_ai_reasoning) skills.push(`AI Reasoning Skills: ${userProfile.skill_ai_reasoning}/5`);
    if (skills.length > 0) {
      contextParts.push(`Skill Levels: ${skills.join(', ')}`);
    }

    // Tools
    if (userProfile.current_tools && userProfile.current_tools.length > 0) {
      contextParts.push(`Familiar Tools: ${userProfile.current_tools.join(', ')}`);
    }
  }

  if (preferences) {
    // Content style
    if (preferences.content_style) {
      const styleMap: { [key: string]: string } = {
        'conversational': 'Write in a friendly, conversational tone as if talking directly to the learner',
        'formal': 'Use a formal, academic writing style',
        'technical': 'Focus on technical precision and terminology',
        'storytelling': 'Use storytelling and narrative techniques to explain concepts',
        'practical': 'Emphasize practical, actionable advice and real-world application'
      };
      contextParts.push(`Writing Style: ${styleMap[preferences.content_style] || preferences.content_style}`);
    }

    // Content length
    if (preferences.content_length) {
      const lengthMap: { [key: string]: string } = {
        'brief': 'Keep content concise (300-400 words)',
        'standard': 'Use standard length (600-700 words)',
        'detailed': 'Provide detailed explanations (800-1000 words)',
        'comprehensive': 'Create comprehensive coverage (1000+ words)'
      };
      contextParts.push(`Content Length: ${lengthMap[preferences.content_length] || preferences.content_length}`);
    }

    // Complexity
    if (preferences.content_complexity) {
      const complexityMap: { [key: string]: string } = {
        'simplified': 'Simplify concepts, avoid jargon, use analogies',
        'balanced': 'Balance simplicity with depth, explain technical terms',
        'advanced': 'Assume prior knowledge, use technical terminology',
        'expert': 'Write for experts, dive deep into nuances'
      };
      contextParts.push(`Complexity Level: ${complexityMap[preferences.content_complexity] || preferences.content_complexity}`);
    }

    // Example preferences
    if (preferences.preferred_examples) {
      const exampleMap: { [key: string]: string } = {
        'real-world': 'Use real-world scenarios and practical examples',
        'theoretical': 'Focus on theoretical concepts and principles',
        'code-focused': 'Include code examples and technical implementations',
        'business-focused': 'Use business cases and professional scenarios',
        'mixed': 'Mix different types of examples'
      };
      contextParts.push(`Example Style: ${exampleMap[preferences.preferred_examples] || preferences.preferred_examples}`);
    }

    // Learning approach
    if (preferences.learning_approach) {
      const approachMap: { [key: string]: string } = {
        'hands-on': 'Emphasize hands-on practice and exercises',
        'conceptual': 'Focus on understanding concepts and principles',
        'visual': 'Use visual descriptions and analogies',
        'analytical': 'Break down concepts analytically',
        'balanced': 'Balance different learning approaches'
      };
      contextParts.push(`Learning Approach: ${approachMap[preferences.learning_approach] || preferences.learning_approach}`);
    }
  }

  if (contextParts.length === 0) {
    return '';
  }

  return `\n\n**Personalization Context:**\n${contextParts.join('\n')}\n`;
}

// Get word count target based on preferences
export function getWordCountTarget(preferences: ContentPreferences | null): { min: number; max: number } {
  if (!preferences || !preferences.content_length) {
    return { min: 600, max: 700 }; // Default
  }

  const targets: { [key: string]: { min: number; max: number } } = {
    'brief': { min: 300, max: 400 },
    'standard': { min: 600, max: 700 },
    'detailed': { min: 800, max: 1000 },
    'comprehensive': { min: 1000, max: 1500 }
  };

  return targets[preferences.content_length] || { min: 600, max: 700 };
}

