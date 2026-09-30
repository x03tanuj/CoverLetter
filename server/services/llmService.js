import Groq from 'groq-sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../config/promptTemplates.js';

const SAMPLE_LETTER = ({ jobTitle, company, resumeText, achievements, tone }) => {
  const candidateName = resumeText.match(/(?:name|candidate)\s*[:\-]\s*([^\n]+)/i)?.[1]?.trim();
  const highlight = achievements?.trim() || 'delivering measurable results and collaborating effectively with cross-functional teams';
  const greeting = company ? `Dear ${company} Hiring Team,` : 'Dear Hiring Team,';

  return `${greeting}

I am excited to apply for the ${jobTitle} position${company ? ` at ${company}` : ''}. ${candidateName ? `As ${candidateName}, ` : ''}I bring a ${tone || 'professional'} approach, strong ownership, and a track record of ${highlight}.

My experience has prepared me to understand complex requirements, turn them into practical solutions, and communicate clearly with both technical and non-technical stakeholders. I would welcome the opportunity to contribute that combination of execution and collaboration to your team.

I am particularly interested in this role because it offers the chance to create meaningful impact while continuing to grow. I would be glad to discuss how my background and motivation align with your goals.

Thank you for your time and consideration.

Sincerely,
${candidateName || 'Your Name'}`;
};

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required when LLM_PROVIDER=groq.');
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
    if ((process.env.LLM_PROVIDER || 'mock').toLowerCase() === 'mock') {
      return SAMPLE_LETTER({ jobTitle, company, resumeText, achievements, tone }).trim();
    }

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
      model: 'openai/gpt-oss-120b',
      stream: false,
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      reasoning_effort: 'medium',
      stop: null
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
