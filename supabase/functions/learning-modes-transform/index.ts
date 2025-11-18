import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAIClient } from "../_shared/ai-provider/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Mode = 'mental_models' | 'socratic' | 'worked_examples' | 'visual_summary' | 'active_practice' | 'story_mode';

interface RequestBody {
  mode: Mode;
  content: string; // markdown or plaintext
  topic?: string;
  title?: string;
  selection?: string; // optional focused excerpt
  readingLevel?: 'beginner' | 'intermediate' | 'expert';
  domain?: string;
}

function buildPrompt(mode: Mode, body: RequestBody): { system: string; user: string; maxTokens: number; temperature?: number } {
  const baseContext = `Topic: ${body.topic || 'General'}\nTitle: ${body.title || 'Section'}\n\nLearning content (markdown):\n"""\n${body.content}\n"""\n\n${body.selection ? `Focus on this selected excerpt when relevant:\n"""\n${body.selection}\n"""\n\n` : ''}`;

  const readingLevel = body.readingLevel || 'intermediate';

  if (mode === 'mental_models') {
    const system = `You are a world-class expert in cognitive frameworks and mental models. You specialize in extracting the deepest patterns, principles, and decision-making frameworks from complex information. Your mental models are immediately actionable, memorable, and help learners think more clearly and make better decisions. You create frameworks that transfer across domains and stand the test of time. Your audience level is: ${readingLevel}.`;
    
    const user = `${baseContext}

CRITICAL INSTRUCTIONS:
- Extract ONLY what is explicitly stated or strongly implied in the provided content
- Do NOT add generic advice or concepts not present in the material
- Every model, principle, and framework MUST be directly traceable to the content
- Use specific examples, terminology, and concepts from the content itself
- Make everything scannable with clear formatting and hierarchy

Transform this content into a powerful mental model framework. Extract the underlying patterns, principles, and frameworks that make this knowledge transferable and actionable.

IMPORTANT: Do NOT include number ranges like "(3-5)" or "(2-4)" in your section headers. Use descriptive titles and subtitles instead.

# Core Mental Models
*The fundamental frameworks that explain how this topic works*

For each mental model (aim for 5-7 total), provide:

**Model Name** (memorable, descriptive)
- **What it is**: A clear, concise definition (2-3 sentences)
- **Why it matters**: The specific value or insight it provides (1-2 sentences)
- **How it works**: The mechanism or process it describes (2-3 sentences)
- **When to use it**: Specific situations or contexts from the content (1-2 sentences)
- **Example from content**: A concrete, specific example directly from the provided material

Format each model like this:
**Model Name**
What it is: [definition]
Why it matters: [value]
How it works: [mechanism]
When to use it: [context]
Example: [specific example from content]

# Fundamental Principles
*The universal truths and rules that govern this domain*

Extract the most important principles (aim for 4-6 total). Each principle should:

- Be a universal truth or rule that applies broadly
- Be directly supported by the content
- Include why it matters and how it manifests
- Reference specific evidence from the content

Format: **Principle Name**: [Principle statement]. This matters because [reasoning]. We see this in the content when [specific reference].

# Decision Frameworks
*Practical heuristics for knowing when and how to apply these concepts*

Create "If/Then" decision heuristics (aim for 4-5 total) that help learners know when and how to apply concepts:

- **If** [specific condition from content], **then** [specific action/approach], **because** [reasoning tied to content]
- Include the context or trigger that makes this decision relevant
- Reference specific concepts or examples from the content

Each framework should help learners make real decisions about applying the material.

# Trade-offs & Constraints
*Understanding the limitations and boundaries of these approaches*

Identify the key trade-offs, limitations, or constraints (aim for 3-4 total) mentioned or implied in the content:

- What are the costs, downsides, or limitations?
- When does this approach not work or break down?
- What are the boundaries or edge cases?
- What must be sacrificed or considered?

Format: **Trade-off/Constraint**: [Description]. This means [implication]. We see this limitation when [specific example from content].

# Common Pitfalls & Anti-Patterns
*What goes wrong and how to avoid these mistakes*

Highlight failure modes, mistakes, or misconceptions (aim for 3-4 total) to avoid:

- What goes wrong when applying this incorrectly?
- What misconceptions should be avoided?
- What are the warning signs of misapplication?
- What NOT to do and why

Format: **Pitfall**: [Description of mistake]. This happens when [trigger]. To avoid this, [prevention strategy]. The content warns us about this when [reference].

# Integration Patterns
*How these mental models work together*

Show how these mental models connect and work together (aim for 2-3 patterns):

- How do the models relate to each other?
- What's the typical sequence, flow, or hierarchy?
- How do they reinforce or complement each other?
- What's the relationship between principles and models?

Format: **Pattern Name**: [How models/principles connect]. This works because [reasoning]. We see this integration when [example showing connections].

# Quick Reference Checklist
*Actionable steps to apply these mental models*

Create a brief checklist (aim for 5-7 items) that learners can use to quickly apply these mental models:
- [ ] [Actionable item tied to a specific model]
- [ ] [Actionable item tied to a specific principle]
- [ ] [Actionable item tied to a decision framework]

Make the output:
- Highly scannable with clear visual hierarchy
- Immediately actionable with specific guidance
- Deeply grounded in the provided content
- Free of generic advice or filler
- Rich with specific examples and references from the content
- CONCISE: Aim for 800-1200 words total. Be thorough but brief. Complete all sections fully within this limit.`;
    
    return { system, user, maxTokens: 1500, temperature: 0.5 };
  }

  if (mode === 'socratic') {
    const system = `You are a master Socratic tutor in the tradition of Socrates, Plato, and the greatest educators in history. You guide learners to discover profound insights through carefully crafted, progressive questions. Your questions are thought-provoking, build on each other, and lead learners to construct their own understanding through critical thinking. You never give answers directly—you help learners find them. Your audience level is: ${readingLevel}.`;
    
    const user = `${baseContext}

CRITICAL INSTRUCTIONS:
- Every question MUST be directly tied to specific concepts, examples, or ideas from the provided content
- Questions should build progressively from foundational understanding to deep analysis
- Never reveal answers—guide discovery through follow-up questions or hints
- Make questions open-ended and thought-provoking, requiring genuine thinking
- Use specific terminology, examples, and concepts from the content itself
- Each question should have a clear pedagogical purpose

Transform this content into a powerful Socratic learning experience. Create a carefully structured series of questions that guide the learner through discovery, critical thinking, and deep understanding.

# Foundation: Recall and Understanding (4-5 questions)

Start with questions that help learners recall and understand the foundational concepts from the content:

- Questions that check understanding of key terms, definitions, or concepts
- Questions that help them recall specific examples or evidence from the content
- Questions that connect concepts to each other within the content
- Questions that verify they understand the basic "what" before moving to "why" and "how"

Format: Number each question. Make them specific to the content—reference actual concepts, examples, or ideas from the material.

Example structure:
1. [Question about a specific concept from content]
2. [Question connecting two concepts from content]
3. [Question about a specific example from content]

# Exploration: Analysis and Deep Thinking (5-6 questions)

Move to questions that probe deeper into the "why" and "how":

- Questions that explore the reasoning behind concepts or approaches
- Questions that examine cause-and-effect relationships mentioned in the content
- Questions that explore implications or consequences of ideas
- Questions that examine relationships, patterns, or connections
- Questions that challenge assumptions or explore edge cases mentioned in the content
- Questions that probe the "why" behind specific examples or scenarios

Format: These should require deeper thinking. Reference specific ideas from the content and ask learners to analyze them.

# Application: Synthesis and Real-World Connection (4-5 questions)

Create questions that help learners apply and synthesize:

- Questions that ask them to apply concepts to new scenarios (related to but different from content examples)
- Questions that require synthesizing multiple ideas from the content
- Questions that explore real-world applications of the concepts
- Questions that connect theory from the content to practice
- Questions that ask them to adapt concepts to different contexts

Format: These should be practical and help learners see how to use the knowledge. Still reference the content but push toward application.

# Evaluation: Critical Reflection and Meta-Learning (3-4 questions)

End with questions that promote critical evaluation and reflection:

- Questions that ask them to evaluate different approaches or perspectives from the content
- Questions that prompt reflection on their own understanding or learning process
- Questions that explore broader implications, trade-offs, or ethical considerations
- Questions that help them identify what they still need to learn or explore further
- Questions that connect this content to broader knowledge or other domains

Format: These should be meta-cognitive and help learners think about their thinking.

# Question Quality Standards

Each question must:
- Be directly tied to specific content (concepts, examples, ideas from the material)
- Be open-ended (not yes/no or simple recall)
- Require genuine thinking and reasoning
- Build on previous questions when appropriate
- Be 1-2 sentences maximum
- Guide discovery without revealing answers
- Use specific terminology from the content

# Structure Your Output

Organize questions clearly with:
- Clear section headers
- Numbered questions within each section
- Progressive difficulty from foundation to evaluation
- Specific references to content concepts or examples

Avoid:
- Generic questions that could apply to any topic
- Questions that simply test memorization
- Revealing answers or giving hints that give away the answer
- Questions that are too abstract or disconnected from the content

IMPORTANT: Keep output concise (600-1000 words total). Include all sections but be brief. Complete all questions fully within this limit.`;
    
    return { system, user, maxTokens: 1200, temperature: 0.6 };
  }

  if (mode === 'worked_examples') {
    const system = `You are a master educator who creates world-class worked examples. Your examples are realistic, comprehensive, and pedagogically perfect. You show learners not just WHAT to do, but WHY each step matters and HOW to think through problems. Your examples build progressively, teach transferable thinking patterns, and help learners bridge theory and practice. Your audience level is: ${readingLevel}.`;
  
    const user = `${baseContext}

CRITICAL INSTRUCTIONS:
- Every example MUST directly apply concepts, principles, or ideas from the provided content
- Use specific terminology, methods, and approaches mentioned in the content
- Make examples realistic and practical, not contrived or abstract
- Show the complete thought process, including reasoning and decision-making
- Build progressively from simpler to more complex applications
- Each example should teach transferable patterns, not just solve one problem

Transform this content into powerful worked examples that demonstrate how to apply the concepts in practice. Create 3-4 examples of increasing complexity that help learners bridge theory and practice.

# Example Structure

For each example, follow this comprehensive structure:

## Example [N]: [Descriptive, Specific Title]
*Context: What real-world situation or problem does this example address? Why does this scenario matter?*

### The Challenge

Present a realistic, concrete problem or scenario that requires applying concepts from the content:

- Make it specific and relatable (not abstract or generic)
- Clearly state what needs to be accomplished
- Set up the context and constraints
- Make it appropriate for the complexity level (simpler for early examples, more complex for later ones)
- Reference specific concepts or principles from the content that will be needed

Format: Write 2-3 paragraphs that set up a realistic scenario. Be specific about the situation, what's at stake, and what concepts from the content are relevant.

### Step-by-Step Solution

Walk through the complete solution process, showing both actions AND reasoning:

**Step 1: [Specific Action/Decision Name]**
- **What we do**: [Concrete action or decision]
- **Why this step**: [Reasoning behind this choice]
- **Concept applied**: [Specific concept, principle, or method from the content that applies here]
- **How we know**: [Evidence or reasoning that guides this decision]

**Step 2: [Specific Action/Decision Name]**
- **What we do**: [Next concrete action]
- **Why this step**: [Reasoning, including how it builds on Step 1]
- **Concept applied**: [Specific concept from content]
- **How we know**: [Evidence or reasoning]

[Continue with additional steps as needed—typically 3-5 steps total]

**Final Step: [Verification/Completion]**
- **What we do**: [Final action or verification]
- **Why this completes the solution**: [How this step ensures success]
- **What we've accomplished**: [Summary of what was achieved]

### Why This Works

Explain the deeper learning from this example:

- **Key concepts demonstrated**: Which specific concepts, principles, or methods from the content does this example illustrate?
- **Why this approach is effective**: What makes this solution path work well?
- **Patterns to remember**: What transferable thinking patterns or heuristics can learners extract?
- **Connections to content**: How does this example connect to the broader ideas in the content?

### Common Variations

Show how this approach adapts to similar but different situations:

- **If the situation were [variation]**: [How would the approach change?]
- **If we had [different constraint]**: [What would we do differently?]
- **What if [different context]**: [How would we adapt the method?]

### Key Takeaways

Summarize what learners should remember:

- **Core principle**: [The main lesson from this example]
- **When to use this**: [Situations where this approach applies]
- **What to watch for**: [Common mistakes or pitfalls to avoid]
- **How to adapt**: [How to modify this for different contexts]

### Try It Yourself

End with a practice challenge:

- **Your challenge**: [A similar but different problem/scenario]
- **What to apply**: [Which concepts from the content should they use]
- **Think about**: [Key questions to guide their thinking]
- **Check your work**: [What should their solution include or accomplish]

# Example Quality Standards

Each example must:
- Be directly tied to specific concepts, methods, or principles from the content
- Be realistic and practical (not contrived or abstract)
- Show complete reasoning, not just steps
- Build on previous examples (increasing complexity)
- Teach transferable patterns, not just solve one problem
- Use specific terminology and methods from the content
- Include realistic constraints, trade-offs, or complications

# Progression Across Examples

- **Example 1**: Focus on core concepts, straightforward application, clear steps
- **Example 2**: Introduce more complexity, multiple concepts working together
- **Example 3**: Advanced application, edge cases, or sophisticated scenarios
- **Example 4** (if applicable): Integration of multiple concepts, complex real-world scenario

# Output Format

- Use clear markdown formatting with headers, bold text, and lists
- Make it scannable but comprehensive
- Include specific references to content concepts
- Write in a clear, instructional tone
- Balance detail with clarity
- CONCISE: Aim for 1000-1500 words total. Include 2-3 examples maximum. Complete all sections fully within this limit.`;
  
    return { system, user, maxTokens: 1800, temperature: 0.6 };
  }

  if (mode === 'visual_summary') {
    const system = `You are an expert in visual learning and information design. You create structured, scannable summaries that help visual learners understand complex information through clear hierarchies, relationships, and spatial organization. Your summaries use visual metaphors, structured layouts, and clear categorization to make information immediately comprehensible. Your audience level is: ${readingLevel}.`;
  
    const user = `${baseContext}

CRITICAL INSTRUCTIONS:
- Extract ONLY information from the provided content
- Use clear visual hierarchy and structure
- Create scannable formats that visual learners can quickly navigate
- Use spatial relationships, categories, and visual metaphors
- Make connections visible through structure and organization
- Every element must be directly traceable to the content

Transform this content into a powerful visual summary optimized for visual learners. Create a structured, scannable format that uses visual hierarchy, spatial organization, and clear categorization.

# Visual Overview Map

Create a high-level visual map showing the main components and their relationships:

**Central Concept**: [Main topic/concept from content]

**Connected Elements**:
- [Element 1] → [Relationship] → [Element 2]
- [Element 3] → [Relationship] → [Element 4]
- [How elements connect and flow]

Use arrows, hierarchies, and spatial relationships to show how concepts relate.

# Core Concepts Breakdown

Organize the main concepts into clear, scannable sections:

## Concept 1: [Name]
- **Definition**: [Clear, concise definition from content]
- **Key Characteristics**: 
  - [Characteristic 1]
  - [Characteristic 2]
  - [Characteristic 3]
- **Visual Metaphor**: [A visual way to think about this concept]
- **Connections**: Links to [other concepts from content]

## Concept 2: [Name]
[Same structure]

[Continue for all major concepts—typically 4-6 concepts]

# Process Flow / Sequence

If the content describes a process, sequence, or workflow, create a clear visual flow:

**Step 1**: [Action/Stage]
  ↓
**Step 2**: [Action/Stage]
  ↓
**Step 3**: [Action/Stage]
  ↓
**Step 4**: [Action/Stage]

For each step:
- **What happens**: [Description]
- **Why it matters**: [Reasoning]
- **Key inputs/outputs**: [What goes in/comes out]

# Comparison Matrix

If the content compares different approaches, methods, or options, create a comparison table:

| Aspect | Option A | Option B | Option C |
|--------|----------|----------|----------|
| [Aspect 1] | [Details] | [Details] | [Details] |
| [Aspect 2] | [Details] | [Details] | [Details] |
| [Aspect 3] | [Details] | [Details] | [Details] |

# Key Relationships Diagram

Show how key concepts, principles, or ideas relate to each other:

**Concept A** ← [Relationship type] → **Concept B**
         ↓
    **Concept C**
         ↓
    **Concept D**

For each relationship, explain: [How they connect based on content]

# Visual Categories

Organize information into clear visual categories:

### Category 1: [Name]
- [Item 1 from content]
- [Item 2 from content]
- [Item 3 from content]

### Category 2: [Name]
- [Item 1 from content]
- [Item 2 from content]

[Continue for all relevant categories]

# Quick Reference Visual

Create a scannable quick reference that visual learners can use:

**Main Topic**: [Topic name]

**Essential Elements**:
- [ ] [Key element 1]
- [ ] [Key element 2]
- [ ] [Key element 3]

**Key Relationships**:
- [Relationship 1]
- [Relationship 2]

**Critical Takeaways**:
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

# Visual Learning Tips

Include tips for how visual learners can best use this information:

- **Create a mind map**: Start with [central concept] and branch to [key concepts]
- **Draw the process**: Visualize [process/sequence] as a flowchart
- **Use color coding**: Group [related concepts] together visually
- **Build a diagram**: Show [relationships] using [visual structure]

# Output Format

- Use clear markdown formatting with headers, lists, tables, and visual separators
- Make extensive use of:
  - Bullet points and numbered lists
  - Tables for comparisons
  - Hierarchical structure (headers, subheaders)
  - Arrows (→, ↓) to show flow and relationships
  - Clear visual separation between sections
- Keep everything scannable—visual learners should be able to quickly find what they need
- Use consistent formatting patterns throughout
- CONCISE: Aim for 800-1200 words total. Cover all sections but be brief. Complete all content fully within this limit.`;
  
    return { system, user, maxTokens: 1500, temperature: 0.5 };
  }

  if (mode === 'active_practice') {
    const system = `You are an expert in active learning and hands-on practice. You create engaging, practical exercises that help learners apply concepts through doing. Your exercises are realistic, progressively challenging, and designed to build real skills through practice. You understand that learning happens through action, not just reading. Your audience level is: ${readingLevel}.`;
  
    const user = `${baseContext}

CRITICAL INSTRUCTIONS:
- Every exercise MUST directly apply concepts, methods, or principles from the provided content
- Create realistic, practical scenarios that learners can actually work through
- Build progressively from simple to complex
- Focus on application and skill-building, not just knowledge testing
- Include clear success criteria and feedback mechanisms
- Use specific terminology and methods from the content

Transform this content into a comprehensive active practice experience. Create hands-on exercises that help learners apply concepts through doing, not just reading.

# Practice Overview

**What you'll practice**: [Main skills/concepts from content]
**Why this matters**: [Why these skills are valuable]
**What you'll build**: [What learners will create or accomplish]

# Warm-Up Exercise (1 exercise)

Start with a simple exercise to get comfortable:

**Exercise 1: [Name]**
- **Goal**: [What learners will accomplish]
- **Time**: [Estimated time]
- **Concepts applied**: [Specific concepts from content]

**Your task**: [Clear, specific task description]

**Steps to complete**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Success criteria**: [How learners know they've succeeded]
- [ ] [Criterion 1]
- [ ] [Criterion 2]

**Reflection questions**:
- [Question about what they learned]
- [Question about how concepts applied]

# Core Practice Exercises (3-4 exercises)

Create progressively challenging exercises:

## Exercise 2: [Name] - [Difficulty Level]

**Scenario**: [Realistic scenario that requires applying content concepts]

**Your challenge**: [Specific challenge or problem to solve]

**What you'll need**: [Concepts, methods, or knowledge from content]

**Your task**: [Detailed task description]

**Guided steps**:
1. **Step 1: [Name]**
   - **Action**: [What to do]
   - **Why**: [Why this step matters]
   - **Concept**: [Which concept from content applies]
   - **Checkpoint**: [How to verify you're on track]

2. **Step 2: [Name]**
   [Same structure]

3. **Step 3: [Name]**
   [Continue as needed]

**Success criteria**:
- [ ] [Specific outcome 1]
- [ ] [Specific outcome 2]
- [ ] [Specific outcome 3]

**Self-assessment**:
- What went well?
- What was challenging?
- How did the concepts from the content help you?

**Extension challenge** (optional):
- [More advanced variation for learners who want to go further]

## Exercise 3: [Name] - [Difficulty Level]
[Same structure, increased complexity]

## Exercise 4: [Name] - [Difficulty Level]
[Same structure, even more complex]

# Integration Challenge (1 exercise)

Create a final exercise that integrates multiple concepts:

**Final Challenge: [Name]**

**Complex scenario**: [Realistic scenario requiring multiple concepts]

**Your mission**: [Comprehensive task that integrates learning]

**What you'll apply**:
- [Concept 1 from content]
- [Concept 2 from content]
- [Concept 3 from content]

**Your approach**: [Guidance on how to approach this]

**Deliverables**:
- [ ] [Deliverable 1]
- [ ] [Deliverable 2]
- [ ] [Deliverable 3]

**Evaluation rubric**:
- **Excellent**: [What excellent work looks like]
- **Good**: [What good work looks like]
- **Needs improvement**: [What needs work]

# Practice Tips

Provide guidance for effective practice:

- **Before you start**: [Preparation tips]
- **While practicing**: [Tips for effective practice]
- **After completing**: [Reflection and review tips]
- **Common pitfalls**: [What to watch out for]
- **How to know you're ready**: [Signs of mastery]

# Self-Check Questions

Include questions learners can use to assess their understanding:

- [Question about concept application]
- [Question about when to use specific methods]
- [Question about troubleshooting common issues]
- [Question about connecting concepts]

# Next Steps

Guide learners on what to do after completing exercises:

- **If you struggled with**: [Concept] → [What to review]
- **If you excelled at**: [Concept] → [How to go deeper]
- **To continue practicing**: [Suggestions for ongoing practice]
- **To apply in real world**: [How to use these skills practically]

# Output Format

- Use clear markdown with headers, numbered lists, and checkboxes
- Make exercises actionable and specific
- Include clear success criteria for each exercise
- Provide structure but allow for creativity
- Balance guidance with independence
- CONCISE: Aim for 1000-1500 words total. Include 3-4 exercises maximum. Complete all exercises fully within this limit.`;
  
    return { system, user, maxTokens: 1800, temperature: 0.6 };
  }

  if (mode === 'story_mode') {
    const system = `You are a master storyteller and narrative educator. You transform complex information into compelling stories, case studies, and narratives that help learners understand through context, emotion, and real-world scenarios. Your stories are engaging, memorable, and deeply educational. You know that humans learn best through narrative. Your audience level is: ${readingLevel}.`;
  
    const user = `${baseContext}

CRITICAL INSTRUCTIONS:
- Every story, case study, or narrative MUST directly illustrate concepts, principles, or ideas from the provided content
- Use realistic scenarios and relatable characters/situations
- Make stories engaging but educational—they should teach, not just entertain
- Connect narrative elements directly to content concepts
- Use specific examples, methods, or principles from the content
- Create memorable narratives that help learners remember and understand

Transform this content into compelling stories, case studies, and narratives that help learners understand through context and real-world scenarios.

# The Main Story

Create a comprehensive narrative that illustrates the core concepts:

## [Story Title]: [Subtitle that hints at the concepts]

**Setting the Scene**: [Context and background—where/when/why]

**The Characters**: [Who is involved—can be people, organizations, systems, etc.]

**The Challenge**: [What problem or situation needs to be addressed using concepts from content]

**The Journey**: [How concepts from content are applied to address the challenge]

**The Resolution**: [How things turn out and what was learned]

**The Lessons**: [What concepts from content were demonstrated and how]

# Character-Driven Case Studies (2-3 case studies)

Create detailed case studies that show concepts in action:

## Case Study 1: [Title]

**The Protagonist**: [Who/what is the focus]

**The Situation**: [Detailed context and background]

**The Problem**: [Specific challenge that requires applying content concepts]

**The Approach**: [How concepts from content were applied]
- **Step 1**: [Action using concept from content]
- **Step 2**: [Action using concept from content]
- **Step 3**: [Action using concept from content]

**The Outcome**: [What happened as a result]

**Key Concepts Demonstrated**:
- [Concept 1 from content]: [How it was used]
- [Concept 2 from content]: [How it was used]

**What We Learn**: [Educational takeaways tied to content]

## Case Study 2: [Title]
[Same structure, different scenario]

## Case Study 3: [Title]
[Same structure, different scenario]

# Real-World Scenarios

Create short, vivid scenarios that illustrate specific concepts:

### Scenario 1: [Concept Name]

**The Situation**: [Brief, realistic scenario]

**What Happens**: [How the concept from content plays out]

**Why It Matters**: [Why this concept is important]

**The Takeaway**: [What learners should remember]

### Scenario 2: [Concept Name]
[Same structure]

[Continue for 3-4 key concepts]

# Narrative Connections

Show how concepts connect through story:

**The Thread**: [How different concepts from content relate to each other]

**The Arc**: [How concepts build on each other or flow together]

**The Resolution**: [How everything comes together]

# Memorable Moments

Create vivid, memorable moments that illustrate key points:

**The "Aha!" Moment**: [A moment of insight that demonstrates a key concept]

**The Turning Point**: [A critical moment where concepts from content made the difference]

**The Lesson Learned**: [What this moment teaches about the content]

# Story-Based Learning Activities

Create activities that use narrative:

**Activity 1: Tell Your Own Story**
- **Task**: [Create a story using concepts from content]
- **Elements to include**: [Specific concepts or principles]
- **Share**: [How to share or reflect on the story]

**Activity 2: Analyze a Case**
- **Case**: [A case study or scenario]
- **Questions**: [Questions that help learners extract concepts]
- **Reflection**: [What to think about]

# Narrative Takeaways

Summarize key learning through narrative elements:

**The Hero's Journey**: [How concepts from content help overcome challenges]

**The Moral of the Story**: [Key lessons from content]

**What to Remember**: [Memorable takeaways]

# Output Format

- Use engaging narrative structure with clear story elements
- Make stories vivid and memorable
- Connect every narrative element to content concepts
- Use clear markdown formatting
- Balance storytelling with education
- Create memorable characters, scenarios, and moments
- CONCISE: Aim for 1000-1500 words total. Include 1-2 case studies maximum. Complete all stories fully within this limit.`;
  
    return { system, user, maxTokens: 1800, temperature: 0.7 };
  }

  // Fallback for unknown modes
  return { 
    system: `You are an expert educator helping learners understand content.`, 
    user: `${baseContext}\n\nTransform this content into a helpful learning format.`, 
    maxTokens: 2000, 
    temperature: 0.6 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body?.mode || !body?.content) {
      return new Response(
        JSON.stringify({ error: 'mode and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ai = createAIClient();
    const { system, user, maxTokens, temperature } = buildPrompt(body.mode, body);

    const response = await ai.chat({
      functionType: 'deep-analysis',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      maxTokens,
      temperature,
    });

    const content = response.content || '';

    return new Response(
      JSON.stringify({ content, mode: body.mode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('learning-modes-transform error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


