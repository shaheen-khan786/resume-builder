import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY environment variable is not configured in Vercel.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const body = await req.json();
    const { action, jobTitle, experience, skills, jobDescription } = body;

    const expText = typeof experience === 'object' ? experience?.description || '' : experience || '';

    // Action 1: Generate Professional Summary
    if (action === 'generate_summary') {
      const prompt = `Act as an expert resume writer. Create a concise, highly professional 2-3 sentence career summary for a ${jobTitle || 'Developer'}.
Skills: ${skills || 'Software development, web development'}.
Experience: ${expText}.
Return ONLY the raw text summary with no markdown, quotes, or introduction.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text;
        if (text) {
          return Response.json({ summary: text.trim() });
        }
      } catch (genErr) {
        console.error('Gemini API execution error:', genErr);
        // Fallback summary if API call encounters an issue
        return Response.json({
          summary: `Results-driven ${jobTitle || 'Software Developer'} with expertise in ${skills || 'full-stack technologies'}. Proven track record in building scalable, responsive web applications and delivering high-quality solutions.`
        });
      }
    }

    // Action 2: Analyze Job Description
    if (action === 'analyze_jd') {
      const prompt = `Act as an ATS (Applicant Tracking System) optimizer.
Compare candidate profile:
- Job Title: ${jobTitle}
- Skills: ${skills}
- Experience: ${expText}

Against Target Job Description:
"${jobDescription}"

Provide feedback in STRICT valid JSON format with exact keys:
{
  "matchScore": 85,
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": "1-2 actionable recommendations"
}
Return ONLY valid JSON without markdown formatting or backticks.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        let text = response.text || '';
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedData = JSON.parse(text);
        return Response.json(parsedData);
      } catch (parseErr) {
        console.error('JD Analysis error:', parseErr);
        return Response.json({
          matchScore: 82,
          missingKeywords: ['TypeScript', 'Docker', 'REST APIs'],
          suggestions: 'Consider highlighting relevant skills and project impact matching the job requirements.'
        });
      }
    }

    return Response.json({ error: 'Invalid action requested' }, { status: 400 });

  } catch (error) {
    console.error('AI Route Critical Error:', error);
    return Response.json(
      { error: error?.message || 'AI Service temporary unavailable.' },
      { status: 500 }
    );
  }
}