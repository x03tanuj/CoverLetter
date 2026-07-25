import Groq from 'groq-sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../config/promptTemplates.js';

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is missing.');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const TONE_MAP = {
  formal: 'Use a polished, traditional business tone with executive vocabulary and no informal contractions.',
  professional: 'Use a polished, confident, and articulate professional business tone.',
  confident: 'Use a bold, energetic, and high-impact tone that strongly highlights achievement drive.',
  conversational: 'Use an engaging, approachable, and modern tech-forward tone.',
  modern: 'Use a direct, crisp, and contemporary modern startup tone.'
};

const LENGTH_MAP = {
  short: '~150-200 words (2-3 concise paragraphs)',
  standard: '~250-350 words (3-4 structured paragraphs)',
  medium: '~250-350 words (3-4 structured paragraphs)',
  detailed: '~400-500 words (4-5 comprehensive paragraphs)',
  long: '~400-500 words (4-5 comprehensive paragraphs)'
};

export const generateCoverLetter = async ({
  jobTitle,
  company,
  jobDescriptionText,
  resumeText,
  achievements = '',
  tone = 'professional',
  length = 'standard'
}) => {
  try {
    const groq = getGroqClient();

    const mappedTone = TONE_MAP[tone.toLowerCase()] || TONE_MAP.professional;
    const mappedLength = LENGTH_MAP[length.toLowerCase()] || LENGTH_MAP.standard;

    const userPrompt = buildUserPrompt({
      jobTitle,
      company,
      jobDescriptionText,
      rawText: resumeText,
      tone: mappedTone,
      length: mappedLength,
      highlights: achievements
    });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024
    });

    const generatedText = completion.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('Groq returned empty response content.');
    }

    return generatedText.trim();
  } catch (error) {
    console.error('Error in generateCoverLetter:', error);
    throw new Error(`LLM Generation Failed: ${error.message}`);
  }
};
