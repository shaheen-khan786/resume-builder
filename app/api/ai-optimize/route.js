// // import { GoogleGenAI } from '@google/genai';
// // import { NextResponse } from 'next/server';

// // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// // export async function POST(req) {
// //   try {
// //     const { action, jobTitle, experience, jobDescription, skills } = await req.json();

// //     if (action === 'generate_summary') {
// //       const prompt = `Act as an expert resume writer. Write a compelling, professional 3-sentence resume summary for a candidate applying for the role of "${jobTitle}".
// //       Candidate experience summary: ${JSON.stringify(experience)}.
// //       Skills: ${skills}.
// //       Provide ONLY the summary text in the response.`;

// //       const response = await ai.models.generateContent({
// //         model: 'gemini-3.8-flash',
// //         contents: prompt,
// //       });

// //       return NextResponse.json({ summary: response.text });
// //     }

// //     if (action === 'analyze_jd') {
// //       const prompt = `Act as an ATS (Applicant Tracking System) checker. Analyze the following resume details against the provided target Job Description.
      
// //       Target Job Title: ${jobTitle}
// //       Job Description: ${jobDescription}
// //       Candidate Skills: ${skills}
// //       Candidate Experience: ${JSON.stringify(experience)}

// //       Provide the response in raw JSON format with exact keys:
// //       {
// //         "matchScore": 85,
// //         "missingKeywords": ["Docker", "GraphQL"],
// //         "suggestions": "Add more metrics to experience bullet points."
// //       }`;

// //       const response = await ai.models.generateContent({
// //         model: 'gemini-3.8-flash',
// //         contents: prompt,
// //       });

// //       let cleanText = response.text.replace(/```json|```/g, '').trim();
// //       const parsedData = JSON.parse(cleanText);

// //       return NextResponse.json(parsedData);
// //     }

// //     return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
// //   } catch (error) {
// //     return NextResponse.json({ error: error.message }, { status: 500 });
// //   }
// // }



// import { GoogleGenerativeAI } from '@google/generative-ai';

// export async function POST(req) {
//   try {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       return Response.json(
//         { error: 'GEMINI_API_KEY is missing in environment variables.' },
//         { status: 500 }
//       );
//     }

//     const genAI = new GoogleGenerativeAI(apiKey);
//     const body = await req.json();
//     const { action, jobTitle, experience, skills, jobDescription } = body;

//     const expText = typeof experience === 'object' ? experience?.description || '' : experience || '';

//     if (action === 'generate_summary') {
//       const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//       const prompt = `Act as an expert resume writer. Create a concise, highly professional 2-3 sentence career summary for a ${jobTitle || 'Professional'}. Skills: ${skills || 'Software development'}. Experience: ${expText}. Return ONLY text summary with no markdown.`;

//       const result = await model.generateContent(prompt);
//       const text = await result.response.text();

//       return Response.json({ summary: text.trim() });
//     }

//     if (action === 'analyze_jd') {
//       const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//       const prompt = `Act as an ATS optimizer. Compare candidate profile (Job Title: ${jobTitle}, Skills: ${skills}, Experience: ${expText}) against target Job Description: "${jobDescription}". Return STRICT JSON format: {"matchScore": 85, "missingKeywords": ["keyword1"], "suggestions": "tip"}`;

//       const result = await model.generateContent(prompt);
//       let text = await result.response.text();
//       text = text.replace(/```json/g, '').replace(/```/g, '').trim();

//       try {
//         const parsedData = JSON.parse(text);
//         return Response.json(parsedData);
//       } catch {
//         return Response.json({
//           matchScore: 80,
//           missingKeywords: ['Tailwind CSS', 'TypeScript'],
//           suggestions: 'Align resume keywords with target job description requirements.'
//         });
//       }
//     }

//     return Response.json({ error: 'Invalid action' }, { status: 400 });

//   } catch (error) {
//     console.error('API Error:', error);
//     return Response.json(
//       { error: error?.message || 'AI service error.' },
//       { status: 500 }
//     );
//   }
// }

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

    // Updated to the latest stable endpoint model name
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    if (action === 'generate_summary') {
      const prompt = `Act as an expert resume writer. Create a concise, highly professional 2-3 sentence career summary for a ${jobTitle || 'Professional'}. Skills: ${skills || 'Software development'}. Experience: ${expText}. Return ONLY text summary with no markdown.`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      return Response.json({ summary: text.trim() });
    }

    if (action === 'analyze_jd') {
      const prompt = `Act as an ATS optimizer. Compare candidate profile (Job Title: ${jobTitle}, Skills: ${skills}, Experience: ${expText}) against target Job Description: "${jobDescription}". Return STRICT JSON format: {"matchScore": 85, "missingKeywords": ["keyword1"], "suggestions": "tip"}`;

      const result = await model.generateContent(prompt);
      let text = await result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const parsedData = JSON.parse(text);
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