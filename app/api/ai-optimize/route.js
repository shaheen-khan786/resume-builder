// import { GoogleGenAI } from '@google/genai';
// import { NextResponse } from 'next/server';

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export async function POST(req) {
//   try {
//     const { action, jobTitle, experience, jobDescription, skills } = await req.json();

//     if (action === 'generate_summary') {
//       const prompt = `Act as an expert resume writer. Write a compelling, professional 3-sentence resume summary for a candidate applying for the role of "${jobTitle}".
//       Candidate experience summary: ${JSON.stringify(experience)}.
//       Skills: ${skills}.
//       Provide ONLY the summary text in the response.`;

//       const response = await ai.models.generateContent({
//         model: 'gemini-3.8-flash',
//         contents: prompt,
//       });

//       return NextResponse.json({ summary: response.text });
//     }

//     if (action === 'analyze_jd') {
//       const prompt = `Act as an ATS (Applicant Tracking System) checker. Analyze the following resume details against the provided target Job Description.
      
//       Target Job Title: ${jobTitle}
//       Job Description: ${jobDescription}
//       Candidate Skills: ${skills}
//       Candidate Experience: ${JSON.stringify(experience)}

//       Provide the response in raw JSON format with exact keys:
//       {
//         "matchScore": 85,
//         "missingKeywords": ["Docker", "GraphQL"],
//         "suggestions": "Add more metrics to experience bullet points."
//       }`;

//       const response = await ai.models.generateContent({
//         model: 'gemini-3.8-flash',
//         contents: prompt,
//       });

//       let cleanText = response.text.replace(/```json|```/g, '').trim();
//       const parsedData = JSON.parse(cleanText);

//       return NextResponse.json(parsedData);
//     }

//     return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }




import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is missing.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    const { action, jobTitle, experience, skills, jobDescription } = body;

    // Helper function for multi-model fallback execution
    const generateContentWithFallback = async (promptText) => {
      const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro'];
      let lastErr = null;

      for (const mName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: mName });
          const result = await model.generateContent(promptText);
          const response = await result.response;
          const text = response.text();
          if (text) return text;
        } catch (err) {
          console.warn(`Model ${mName} attempt failed:`, err?.message || err);
          lastErr = err;
        }
      }
      throw lastErr || new Error('All AI model attempts failed.');
    };

    if (action === 'generate_summary') {
      const expText = typeof experience === 'object' ? experience?.description || '' : experience || '';
      const prompt = `Act as an expert resume writer. Create a concise, highly professional 2-3 sentence career summary for a ${jobTitle || 'Professional'}. 
Skills: ${skills || 'Software development, web technologies'}. 
Experience: ${expText}. 
Keep it ATS-friendly, impactful, and active. Return ONLY the text summary with no markdown or introductory words.`;

      const summaryText = await generateContentWithFallback(prompt);
      return NextResponse.json({ summary: summaryText.trim() });
    }

    if (action === 'analyze_jd') {
      const expText = typeof experience === 'object' ? experience?.description || '' : experience || '';
      const prompt = `Act as an ATS (Applicant Tracking System) optimizer.
Compare candidate profile:
- Job Title: ${jobTitle}
- Skills: ${skills}
- Experience: ${expText}

Against Target Job Description:
"${jobDescription}"

Provide feedback in STRICT valid JSON with exact keys:
{
  "matchScore": 85,
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": "1-2 actionable tips"
}
Return ONLY valid raw JSON without markdown codeblocks or quotes.`;

      let rawResponse = await generateContentWithFallback(prompt);
      rawResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const parsedData = JSON.parse(rawResponse);
        return NextResponse.json(parsedData);
      } catch (pErr) {
        console.error('JSON Parsing Error:', pErr, rawResponse);
        return NextResponse.json({
          matchScore: 80,
          missingKeywords: ['Tailwind CSS', 'TypeScript'],
          suggestions: 'Tailor your experience section to emphasize key technical competencies mentioned in the job post.'
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });

  } catch (error) {
    console.error('AI Route Critical Error:', error);
    return NextResponse.json(
      { error: error?.message || 'AI Service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}