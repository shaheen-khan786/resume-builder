import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { action, jobTitle, experience, jobDescription, skills } = await req.json();

    if (action === 'generate_summary') {
      const prompt = `Act as an expert resume writer. Write a compelling, professional 3-sentence resume summary for a candidate applying for the role of "${jobTitle}".
      Candidate experience summary: ${JSON.stringify(experience)}.
      Skills: ${skills}.
      Provide ONLY the summary text in the response.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return NextResponse.json({ summary: response.text });
    }

    if (action === 'analyze_jd') {
      const prompt = `Act as an ATS (Applicant Tracking System) checker. Analyze the following resume details against the provided target Job Description.
      
      Target Job Title: ${jobTitle}
      Job Description: ${jobDescription}
      Candidate Skills: ${skills}
      Candidate Experience: ${JSON.stringify(experience)}

      Provide the response in raw JSON format with exact keys:
      {
        "matchScore": 85,
        "missingKeywords": ["Docker", "GraphQL"],
        "suggestions": "Add more metrics to experience bullet points."
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      let cleanText = response.text.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanText);

      return NextResponse.json(parsedData);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}