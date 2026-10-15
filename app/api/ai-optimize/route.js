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





import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, jobTitle, experience, skills, jobDescription } = body;

    // Use gemini-1.5-flash with a fallback mechanism
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    }

    if (action === 'generate_summary') {
      const prompt = `Act as an expert resume writer. Create a concise, highly professional 2-3 sentence career summary for a ${jobTitle || 'Professional'}. 
Skills: ${skills || 'Software development, web technologies'}. 
Experience: ${typeof experience === 'object' ? experience.description || '' : experience}. 
Keep it ATS-friendly, impactful, and active. Return ONLY the text summary with no introductory text or markdown formatting.`;

      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();

      return Response.json({ summary: responseText.trim() });
    }

    if (action === 'analyze_jd') {
      const prompt = `Act as an ATS (Applicant Tracking System) optimizer.
Compare this candidate profile:
- Job Title: ${jobTitle}
- Skills: ${skills}
- Experience: ${typeof experience === 'object' ? experience.description || '' : experience}

Against this Target Job Description:
"${jobDescription}"

Provide feedback in STRICT valid JSON format with these exact keys:
{
  "matchScore": number between 0 and 100,
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": "1-2 actionable tips to improve the resume for this role"
}
Return ONLY valid JSON with no markdown formatting.`;

      const result = await model.generateContent(prompt);
      let responseText = await result.response.text();
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedData = JSON.parse(responseText);
      return Response.json(parsedData);
    }

    return Response.json({ error: 'Invalid action requested' }, { status: 400 });

  } catch (error) {
    console.error('AI Route Error:', error);
    return Response.json(
      { error: 'AI service is temporarily busy. Please try again in a few seconds.' },
      { status: 500 }
    );
  }
}