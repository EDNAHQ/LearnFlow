# LearnFlow Codebase Analysis

## Executive Summary

LearnFlow is an AI-powered personalized learning platform built with React/TypeScript frontend and Supabase backend with Deno-based edge functions. It generates personalized learning paths using Claude/OpenRouter AI, with multiple content display formats and interactive learning features.

---

## 1. How Learning Paths and Content Are Generated

### Content Generation Pipeline

```
User Input (Topic)
    ↓
generateLearningPlan()  [Frontend]
    ↓
generate-learning-content Edge Function [Deno]
    ↓
AI Provider (OpenRouter/OpenAI/Grok)
    ↓
JSON Response (10 steps with titles + descriptions)
    ↓
Save to learning_paths & learning_steps tables
    ↓
startBackgroundContentGeneration()  [Parallel step content generation]
    ↓
generateStepContent() for each step
    ↓
Save detailed_content to learning_steps
```

### Flow Stages

1. **Learning Plan Generation** (`generateLearningPlan()`)
   - Location: `/src/utils/learning/generateLearningPlan.ts`
   - Creates a 10-step learning path structure
   - Calls edge function with `generatePlan: true`
   - Returns array of Step objects with id, title, description

2. **Detailed Content Generation** (`generateStepContent()`)
   - Location: `/src/utils/learning/generateStepContent.ts`
   - Called for each step to generate 400-500 word detailed content
   - Uses step context (previous steps, step number, phase)
   - Saves to `detailed_content` field in database
   - Can be triggered immediately or in background

3. **Background Generation** (`startBackgroundContentGeneration()`)
   - Location: `/src/utils/learning/backgroundContentGeneration.ts`
   - Generates content for all steps in parallel with 100ms stagger
   - Only generates if `detailed_content` is empty
   - Non-blocking (doesn't prevent user from learning)

---

## 2. Prompt Templates and Definitions

### Learning Plan Prompt
**File**: `/supabase/functions/generate-learning-content/handlers/plan-generator.ts` (lines 13-43)

```
Create a comprehensive 10-step learning plan for topic: "{topic}"
- Laser-focused on the topic without tangential concepts
- Progress from beginner to advanced
- 5-7 word titles, one-sentence descriptions
- Returns JSON with exactly 10 steps
```

**Key Requirements:**
- Response Format: `json_object` (enforced via OpenAI/OpenRouter API)
- System Message emphasizes: no markdown, valid JSON only
- Fallback validation: checks for at least 5 steps

### Step Content Prompt
**File**: `/supabase/functions/generate-learning-content/handlers/content-generator.ts` (lines 78-110)

**Contextual Variables:**
- Step number and total steps (1/10, 5/10, etc.)
- Learning phase: foundational (1-3), intermediate (4-7), advanced (8-10)
- Previous step title (to avoid repetition)
- Current learner journey context

**Template Structure:**
```
Create 400-500 word content for Step {n} of {total}

This Step's Focus: "{title}"
Step Description: "{description}"
Learning Phase: {FOUNDATIONAL/INTERMEDIATE/ADVANCED}

Context for This Phase:
{foundational: "Assume learner encountering first time..."}
{intermediate: "Learner has fundamentals, build complexity..."}
{advanced: "Strong fundamentals, focus on edge cases..."}

Content Requirements:
- Builds on learning journey
- Addresses THIS step's unique focus
- Step-appropriate depth
- Connects forward to next concepts

Include:
- Basic/Practical/Advanced patterns based on phase
- 1/1-2/Real-world scenarios examples based on phase
- Forward connection context

Style:
- SHORT PARAGRAPHS (2-3 sentences max)
- Clear, engaging educational tone
- NO meta-references ("In this section")
- Start directly with content
- Frequent paragraph breaks
```

**Token Limits:**
- 1500 max tokens (ensures complete responses)
- Validation checks for content < 200 chars or truncation patterns

### Related Questions Prompt
**File**: `/supabase/functions/generate-learning-content/handlers/questions-generator.ts`

```
Generate exactly 5 thought-provoking questions based on SPECIFIC content

Requirements:
1. Address important concepts from THIS content
2. Encourage critical thinking, not recall
3. 15-30 words each, concise but specific
4. Each explores different aspect
5. Must end with ?
6. DIRECTLY related to content, not generic

Output: Valid JSON with "questions" array
```

### Mental Model Image Prompts
**File**: `/supabase/functions/generate-learning-content/handlers/mental-model-prompts.ts`

**Purpose:** Generate 8 distinct INFORMATIVE prompts for educational visual diagrams

**Key Requirements:**
- MUST include specific TEXT LABELS and KEY TERMS visible in image
- Include definitions, examples, explanations as text
- Diagram-heavy with annotations and arrows
- 8 varied visualization types:
  1. Flowchart with labeled stages
  2. Concept map with defined terminology
  3. Before/After comparison with bullet points
  4. Timeline with milestone labels
  5. Hierarchical pyramid with skill levels
  6. Process flow with descriptions
  7. Mind map with branches and terms
  8. Framework diagram with annotations

**Bad Examples to Avoid:**
- "Abstract visualization" (too vague)
- "Metaphorical illustration" (not informative)
- "Visual journey" (no specific text labels)

---

## 3. Learning Content Structure and Storage

### Database Schema

**Table: `learning_paths`**
```typescript
{
  id: string (UUID)
  topic: string (user's learning topic)
  title: string | null (can be customized)
  user_id: string (FK to profiles)
  is_approved: boolean | null (user approval of generated plan)
  is_completed: boolean | null
  podcast_script: string | null
  audio_script: string | null
  audio_url: string | null
  created_at: string (timestamp)
  updated_at: string (timestamp)
}
```

**Table: `learning_steps`**
```typescript
{
  id: string (UUID)
  path_id: string (FK to learning_paths)
  title: string (step title, 5-7 words)
  content: string | null (brief description)
  detailed_content: string | null (400-500 word detailed content)
  order_index: number (0-9 for 10-step paths)
  completed: boolean | null
  created_at: string (timestamp)
  updated_at: string (timestamp)
}
```

**Table: `mental_model_images` (inferred from code)**
```typescript
{
  id: string
  path_id: string (FK to learning_paths)
  prompt: string (image generation prompt)
  status: 'not_generated' | 'generating' | 'completed' | 'failed'
  image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}
```

### Content Format

**Content is stored as Markdown:**
- Learning plan titles and descriptions: Plain text
- Detailed content: Markdown formatted with:
  - Paragraphs (2-3 sentences each)
  - Bold emphasis (`**bold**`)
  - Code blocks (if technical topics)
  - Links (markdown format)

**Content Structure Example:**
```
Short paragraph intro.

**Key Concept Name**: Definition and explanation.

Another paragraph with example.

[More detailed content...]
```

---

## 4. Content Display to Users (UI)

### Display Modes

**File**: `/src/components/content/display-modes/`

1. **Text Mode** (TextModeDisplay.tsx)
   - Markdown rendered using `react-markdown`
   - Custom components for links, code, emphasis
   - Shows "Explore Further" questions
   - Text selection enabled for margin notes

2. **Slides Mode** (SlideModeDisplay.tsx)
   - Splits content into logical slide sections
   - Navigation between slides
   - Presentation-style display

3. **Audio Mode** (AudioModeDisplay.tsx)
   - Text-to-speech playback
   - Integrations: OpenAI TTS, ElevenLabs
   - Audio file storage in Supabase `audio_files` bucket
   - Cached audio for reuse

4. **Chat Mode** (ChatModeDisplay.tsx)
   - Interactive tutor mode
   - Generates context-specific conversation questions
   - Real-time speech support (WebRTC)
   - Conversation history tracking

5. **Images Mode** (ImagesModeDisplay.tsx)
   - Mental model image gallery
   - Generated via Replicate AI (Flux, etc.)
   - Images stored in Supabase storage
   - Display with explanations

### Content Display Components

**Main Entry Point**: `/src/pages/ContentPage.tsx`

**Key Components:**
```
ContentPage
├── ContentHeader (title, navigation info)
├── ContentDisplay (routes to display mode)
│   ├── TextModeDisplay
│   ├── SlideModeDisplay
│   ├── AudioModeDisplay
│   ├── ChatModeDisplay
│   └── ImagesModeDisplay
├── ContentNavigation (step navigation)
├── DeepDiveSection (related topics)
├── RelatedTopicsSidebar
├── AIContentModal (Explore Further modal)
└── ProjectCompletion (completion tracking)
```

**Content Rendering**:
- Uses `formatContent()` from `/src/utils/contentFormatter.tsx`
- ReactMarkdown with custom component handlers
- Concept highlighting
- Link handling (opens modals for deep dives)

**Interactive Features:**
- **Explore Further**: Click questions to get AI-generated insights
- **Margin Notes**: Save notes while reading
- **Text Selection**: Create margin notes from selected text
- **Related Topics**: Shows linked topics with descriptions
- **Deep Dives**: Explore related subtopics

---

## 5. External API Integrations

### AI Providers (Primary)

**OpenRouter (Unified AI Provider)**
- File: `/supabase/functions/_shared/ai-provider/client.ts`
- Default Primary Model: `x-ai/grok-code-fast-1` (from env variable)
- Fallback Model: `openai/gpt-4o-mini` (from env variable)
- Final Fallback: Direct OpenAI API

**Configuration by Function Type:**
```typescript
{
  'content-generation': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 2500,
    temperature: 0.7
  },
  'quick-insights': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 500,
    temperature: 0.7
  },
  'chat-tutor': {
    provider: 'openrouter',
    model: DEFAULT_PRIMARY_MODEL,
    maxTokens: 1500,
    temperature: 0.8
  },
  // ... more types
}
```

**API Call Flow:**
1. Try OpenRouter with primary model
2. If fails, try OpenRouter with fallback model
3. If fails, try direct OpenAI
4. JSON response validation and sanitization

### Image Generation

**Replicate API**
- File: `/supabase/functions/generate-mental-model-images/index.ts`
- Service: Flux image generation model
- Stores images in Supabase storage bucket `mental_model_images/`
- Status tracking: not_generated → generating → completed

### Text-to-Speech

**Integrations:**
1. **ElevenLabs** (Primary)
   - File: `/supabase/functions/text-to-speech/elevenlabs.ts`
   - Quality voices, realistic speech
   - Output: MP3 files

2. **OpenAI TTS** (Alternative)
   - File: `/supabase/functions/openai-tts/index.ts`
   - Simpler integration
   - Output: MP3 files

**Storage:**
- Supabase Storage: `audio_files/` bucket
- Public URLs for playback
- Caching to avoid regeneration

### Real-Time Speech (WebRTC)

**Realtime Speech Processing**
- Files: `/src/utils/realtime-speech/`
- WebRTC connection for speech input/output
- Real-time conversation with AI tutor
- Streaming responses

### Other Integrations

1. **Supabase Authentication**
   - SSO via EDNA
   - User profile management

2. **Learning Journey Generation**
   - Edge function: `generate-learning-journey`
   - Creates visual learning paths

3. **Related Topics**
   - Edge function: `generate-deep-dive-topics`
   - Recommends related learning areas

---

## 6. Edge Functions Architecture

**Unified AI Provider Pattern** (files in `/supabase/functions/_shared/`)

All edge functions use a shared AI client that:
- Abstracts provider switching (OpenRouter → OpenAI)
- Enforces JSON response formats
- Validates responses
- Logs metrics

**Edge Function Pattern:**
```typescript
// 1. Parse request
const { param1, param2 } = await req.json();

// 2. Initialize AI client
const aiClient = createAIClient();

// 3. Call AI
const response = await aiClient.chat({
  functionType: 'function-type',
  messages: [
    { role: 'system', content: systemMessage },
    { role: 'user', content: prompt }
  ],
  responseFormat: 'json_object' | undefined,
  maxTokens: number
});

// 4. Parse and validate
const parsed = JSON.parse(response.content);

// 5. Save/return
return new Response(JSON.stringify(result), { headers });
```

---

## 7. Current Limitations and Improvement Areas

### Content Generation Limitations

1. **Fixed 10-Step Format**
   - Hard-coded to always generate 10 steps
   - Doesn't adapt to topic complexity
   - Could be variable (5-15 steps based on topic)

2. **One-Pass Content Generation**
   - Content generated once, not refined iteratively
   - No learner feedback loop to improve content
   - No spaced repetition scheduling

3. **Limited Interactivity in Content**
   - Questions are static
   - No adaptive paths based on learner performance
   - No mastery assessment

### UI/UX Limitations

1. **Display Mode Switching**
   - Users must choose mode upfront
   - Could auto-suggest best mode for content type
   - Mode switching doesn't preserve scroll position

2. **Content Approval Process**
   - `is_approved` flag set by user
   - But approval doesn't trigger revisions
   - Could automatically improve unapproved paths

3. **Related Topics**
   - Limited to same learning path
   - Could recommend topics from other users' paths
   - No personalization based on learning history

### Performance Considerations

1. **Parallel Content Generation**
   - Currently generates all steps in parallel
   - Could prioritize steps user is viewing
   - Could throttle API calls to manage costs

2. **Image Generation Costs**
   - Generating 8 mental model images per path
   - Could be on-demand instead of automatic
   - Could reuse/share images across similar topics

3. **Database Queries**
   - Fetches full step list frequently
   - Could paginate or cache
   - Could denormalize step counts

### Future Enhancement Opportunities

1. **Adaptive Difficulty**
   - Adjust step depth based on learner responses
   - Faster progression for advanced learners
   - Extra scaffolding for struggling learners

2. **Multi-Modal Learning**
   - Combine text, audio, video, images more seamlessly
   - Adaptive mode selection based on content type
   - Interactive simulations or hands-on exercises

3. **Collaborative Features**
   - Share learning paths with other users
   - Crowdsourced path refinements
   - Discussion/Q&A within paths

4. **Better Assessment**
   - Knowledge checks at key points
   - Adaptive quiz questions
   - Certification paths

5. **Content Curation**
   - Link to external resources (videos, articles)
   - Cite sources in generated content
   - User ratings of content quality

6. **Cost Optimization**
   - Cache and reuse generated prompts
   - Batch similar content generations
   - Use cheaper models for routine tasks
   - Implement content review before generation

---

## 8. Key Architecture Patterns

### Client-Server Communication

**Frontend → Edge Functions:**
- RESTful HTTP calls via `supabase.functions.invoke()`
- Request body: parameters for generation
- Response: JSON with generated content

**Edge Functions → AI Providers:**
- Direct HTTP API calls
- Error handling with fallbacks
- Response validation before returning to client

### Data Flow

```
User Input → Frontend State
           ↓
   Supabase Query/Write
           ↓
   Edge Function (if generation needed)
           ↓
   AI Provider API
           ↓
   Response Validation
           ↓
   Supabase Save
           ↓
   Frontend Realtime Update
           ↓
   Component Re-render
```

### Content Lifecycle

```
Generated (newly created, not yet detailed)
    ↓
Approved (user approves the learning path)
    ↓
Detailed Content Generation (background or on-demand)
    ↓
Ready for Learning (user can view full content)
    ↓
In Progress (user is actively learning)
    ↓
Completed (user marks steps as complete)
```

---

## 9. Technology Stack Summary

### Frontend
- React 18.3 + TypeScript
- React Router 6 for navigation
- Zustand for state management
- TailwindCSS + shadcn/ui for styling
- Framer Motion for animations
- React Markdown for content rendering
- React Query for data fetching

### Backend/Database
- Supabase PostgreSQL database
- Row-level security (RLS) policies
- Supabase Storage for files (audio, images)

### Edge Functions (Deno)
- TypeScript/Deno runtime
- OpenRouter API integration
- OpenAI API integration
- Replicate API for image generation
- ElevenLabs API for text-to-speech

### External Services
- OpenRouter (multiple AI models)
- OpenAI (GPT-4, TTS)
- Replicate (image generation)
- ElevenLabs (text-to-speech)
- Supabase (auth, DB, storage, functions)

---

## 10. Code Organization

```
LearnFlow/
├── src/
│   ├── components/
│   │   ├── content/           # Content display components
│   │   ├── learning/          # Learning path components
│   │   └── ui/                # Shared UI components
│   ├── hooks/
│   │   ├── navigation/        # Route and content navigation
│   │   ├── learning-steps/    # Step data fetching
│   │   ├── content/           # Content-specific hooks
│   │   └── audio/             # Audio playback hooks
│   ├── utils/
│   │   ├── learning/          # Content generation utils
│   │   ├── presentation/      # Slide generation
│   │   ├── podcast/           # Podcast generation
│   │   └── realtime-speech/   # Speech processing
│   ├── integrations/
│   │   └── supabase/          # Supabase client & types
│   └── pages/                 # Page components
├── supabase/
│   └── functions/             # Edge functions
│       ├── generate-learning-content/    # Main content generation
│       ├── generate-mental-model-images/ # Image generation
│       ├── text-to-speech/               # Audio generation
│       ├── chat-tutor/                   # Chat interactions
│       └── _shared/                      # Shared utilities
└── public/                    # Static assets
```

---

## Summary

LearnFlow is a sophisticated AI-powered learning platform that:

1. **Generates personalized learning paths** using Claude/Grok via OpenRouter
2. **Structures content** in a 10-step progressive format with foundational→intermediate→advanced progression
3. **Stores content** in PostgreSQL with separate fields for overview and detailed content
4. **Displays content** in 5 different modes (text, slides, audio, chat, images)
5. **Integrates multiple services**: OpenAI, OpenRouter, Replicate, ElevenLabs, Supabase
6. **Uses edge functions** for server-side AI calls with intelligent fallbacks
7. **Generates supplementary content**: mental model images, audio narration, related topics

**Main improvement opportunities:**
- Adaptive difficulty based on learner progress
- Iterative content refinement with feedback
- Cost optimization through intelligent caching
- Better assessment and spaced repetition
- Multi-modal integration improvements

