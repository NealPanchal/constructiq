import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * PRODUCTION AI REASONING UTILITY
 * Used strictly for explanation, reasoning, and report generation.
 * NOT used for mathematical logic or compliance checks.
 */
export async function getAIInsight(prompt: string, context: any) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are the ConstructIQ AI Strategic Intelligence Layer. Provide professional, concise construction insights based on project data. Focus on reasoning and risk management.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nContext Data: ${JSON.stringify(context)}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 1024,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Groq AI Protocol failure:', error);
    return 'Intelligence Layer temporarily offline. Manual protocol recommended.';
  }
}

/**
 * GENERATE STRUCTURED COMPLIANCE REPORT
 */
export async function generateAIReport(complianceResult: any, projectData: any) {
  const prompt = `
    Analyze the following construction compliance results and project data.
    Provide a structured report in the following format:
    [Compliance Status]
    [Violations Summary]
    [Risk Level]
    [Recommendations]
  `;
  
  return getAIInsight(prompt, { complianceResult, projectData });
}
