import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface ParsedCV {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin_url: string;
  portfolio_url: string;
  skills: { skill_name: string; proficiency: string; category: string }[];
  experience: {
    company: string;
    title: string;
    location: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
    gpa: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string;
    url: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
}

export async function parseCV(cvText: string): Promise<ParsedCV> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a CV/Resume parser. Extract all information from the provided CV text and return it as a structured JSON object. Be thorough and accurate. Return ONLY valid JSON with no additional text.

The JSON must have this exact structure:
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string - professional summary or objective",
  "linkedin_url": "string",
  "portfolio_url": "string",
  "skills": [{"skill_name": "string", "proficiency": "beginner|intermediate|advanced|expert", "category": "programming|framework|tool|language|soft_skill|other"}],
  "experience": [{"company": "string", "title": "string", "location": "string", "start_date": "string", "end_date": "string or Present", "is_current": boolean, "description": "string"}],
  "education": [{"institution": "string", "degree": "string", "field_of_study": "string", "start_date": "string", "end_date": "string", "gpa": "string"}],
  "projects": [{"name": "string", "description": "string", "technologies": "comma-separated string", "url": "string"}],
  "certifications": [{"name": "string", "issuer": "string", "date": "string"}]
}`
      },
      {
        role: 'user',
        content: `Parse this CV and extract all information:\n\n${cvText}`
      }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content) as ParsedCV;
}

export async function processUpdate(
  currentProfile: Record<string, unknown>,
  userMessage: string
): Promise<{ response: string; updates: Record<string, unknown> }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are Karis, an AI assistant that manages a user's professional profile. The user will tell you about new skills, experiences, projects, or other updates. Your job is to:
1. Understand what they're telling you
2. Determine what changes need to be made to their profile
3. Return a friendly response and the structured updates

Current profile data:
${JSON.stringify(currentProfile, null, 2)}

Return ONLY valid JSON with this structure:
{
  "response": "Friendly message acknowledging the update",
  "updates": {
    "new_skills": [{"skill_name": "string", "proficiency": "string", "category": "string"}],
    "new_experience": [{"company": "string", "title": "string", "location": "string", "start_date": "string", "end_date": "string", "is_current": boolean, "description": "string"}],
    "new_education": [{"institution": "string", "degree": "string", "field_of_study": "string", "start_date": "string", "end_date": "string", "gpa": "string"}],
    "new_projects": [{"name": "string", "description": "string", "technologies": "string", "url": "string"}],
    "new_certifications": [{"name": "string", "issuer": "string", "date": "string"}],
    "profile_updates": {}
  }
}

Only include arrays/fields that have actual changes. Empty arrays can be omitted.`
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

export async function tailorCV(
  profile: Record<string, unknown>,
  jobDescription: string,
  jobTitle: string,
  company: string
): Promise<{ tailored_cv: string; cover_letter: string }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an expert CV/Resume writer. Your job is to create a tailored CV and cover letter for a specific job posting. 

CRITICAL RULES:
- NEVER fabricate or lie about any skills, experience, or qualifications
- ONLY use information that exists in the candidate's profile
- Reorganize and emphasize relevant skills/experience for this specific job
- Use strong action verbs and quantify achievements where data exists
- Keep the CV concise (1-2 pages worth of content)
- Write a compelling but honest cover letter

Return ONLY valid JSON:
{
  "tailored_cv": "Full CV text formatted in clean sections with markdown",
  "cover_letter": "Professional cover letter text"
}`
      },
      {
        role: 'user',
        content: `Create a tailored CV and cover letter for this position:

JOB TITLE: ${jobTitle}
COMPANY: ${company}
JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}`
      }
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}
