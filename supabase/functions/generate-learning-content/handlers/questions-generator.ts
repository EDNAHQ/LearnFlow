
import { callOpenAI } from "../utils/openai/index.ts";

export async function generateQuestions(content: string, topic: string, title: string, corsHeaders: Record<string, string>) {
  if (!content || !topic) {
    return new Response(
      JSON.stringify({ error: 'Missing required content or topic parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Generating questions for topic: ${topic}, title: ${title}`);
  
  // Generate related questions using OpenAI
  const prompt = `Topic: "${topic}"\nTitle: "${title}"\n\nContent:\n${content.substring(0, 4000)}\n\nGenerate 5 questions (15-30 words each) that explore key concepts from this content. Return JSON: {"questions": ["question 1?", "question 2?", ...]}`;

  console.log(`Calling OpenAI API to generate related questions for: ${title}`);
  
  try {
    const systemMessage = `Generate 5 thought-provoking questions based on the content. Return valid JSON only: {"questions": ["question?", ...]}`;
    
    const data = await callOpenAI(prompt, systemMessage, "json_object");
    
    console.log(`OpenAI response received successfully for questions about: ${title}`);
    
    try {
      // Parse the generated questions
      const generatedContent = data.choices[0].message.content;
      console.log(`Generated questions content length: ${generatedContent.length}`);
      
      const parsedContent = JSON.parse(generatedContent);
      
      if (!Array.isArray(parsedContent.questions)) {
        console.error("Invalid response format - questions is not an array:", parsedContent);
        throw new Error('Invalid response format: questions is not an array');
      }
      
      console.log(`Successfully parsed ${parsedContent.questions.length} questions for: ${title}`);
      
      return new Response(
        JSON.stringify({ questions: parsedContent.questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing generated questions:', parseError, data.choices[0].message.content);
      
      // Fallback: return generic questions
      return new Response(
        JSON.stringify({ 
          questions: [
            `What are the key concepts of ${title} as presented in this content?`,
            `How does ${title} relate to real-world applications?`,
            `What challenges might arise when implementing ${title}?`,
            `How could the concepts in ${title} be expanded upon or improved?`,
            `What connections exist between ${title} and other areas of ${topic}?`
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error(`Error generating questions for ${title}:`, error);
    
    // Fallback: return generic questions on error
    return new Response(
      JSON.stringify({ 
        error: error.message,
        questions: [
          `What are the key concepts of ${title} as presented in this content?`,
          `How does ${title} relate to real-world applications?`,
          `What challenges might arise when implementing ${title}?`,
          `How could the concepts in ${title} be expanded upon or improved?`,
          `What connections exist between ${title} and other areas of ${topic}?`
        ]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
