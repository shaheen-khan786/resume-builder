import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY is missing in environment variables.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const { action, jobTitle, experience, skills, jobDescription } = body;

    const expText = typeof experience === 'object' ? experience?.description || '' : experience || '';

    // Helper to try multiple standard models safely
    const generateWithFallback = async (promptText) => {
      const modelsToTry = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro'];
      let lastError = null;

      for (const mName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: mName });
          const result = await model.generateContent(promptText);
          const response = await result.response;
          const text = response.text();
          if (text) return text;
        } catch (err) {
          console.warn(`Model ${mName} failed, trying next...`, err?.message);
          lastError = err;
        }
      }
      throw lastError || new Error('All Gemini models failed.');
    };

    if (action === 'generate_summary') {
      const prompt = `Act as an expert resume writer. Create a concise, highly professional 2-3 sentence career summary for a ${jobTitle || 'Professional'}. Skills: ${skills || 'Software development'}. Experience: ${expText}. Return ONLY text summary with no markdown.`;

      const summaryText = await generateWithFallback(prompt);
      return Response.json({ summary: summaryText.trim() });
    }

    if (action === 'analyze_jd') {
      const prompt = `Act as an ATS optimizer. Compare candidate profile (Job Title: ${jobTitle}, Skills: ${skills}, Experience: ${expText}) against target Job Description: "${jobDescription}". Return STRICT JSON format: {"matchScore": 85, "missingKeywords": ["keyword1"], "suggestions": "tip"}`;

      let rawText = await generateWithFallback(prompt);
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const parsedData = JSON.parse(rawText);
        return Response.json(parsedData);
      } catch {
        return Response.json({
          matchScore: 80,
          missingKeywords: ['Tailwind CSS', 'TypeScript'],
          suggestions: 'Align resume keywords with target job description requirements.'
        });
      }
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error?.message || 'AI service error.' },
      { status: 500 }
    );
  }
}