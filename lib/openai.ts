import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type GrammarFeedback = {
  isCorrect: boolean
  explanation: string
  suggestion: string
}

export async function getGrammarFeedback(
  prompt: string,
  correctAnswer: string,
  userAnswer: string
): Promise<GrammarFeedback> {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: `You are a language tutor. Evaluate the student's answer and respond ONLY with valid JSON in this exact format:
{"isCorrect": boolean, "explanation": "brief explanation", "suggestion": "corrected version if wrong, empty string if correct"}
Never include any text outside the JSON.`,
        },
        {
          role: 'user',
          content: `Question: ${prompt}\nCorrect answer: ${correctAnswer}\nStudent's answer: ${userAnswer}`,
        },
      ],
    })

    const raw = response.choices[0].message.content ?? '{}'
    return JSON.parse(raw) as GrammarFeedback
  } catch (error) {
    return {
      isCorrect: userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase(),
      explanation: 'AI feedback unavailable. Basic check applied.',
      suggestion: '',
    }
  }
}