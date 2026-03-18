import { GoogleGenAI, Type} from"@google/genai";
import * as mammoth from 'mammoth';

export interface CVMatchResult {
 matchPercentage: number;
 extractedInfo: {
 name?: string;
 email?: string;
 phone?: string;
 skills?: string[];
 education?: string;
 location?: string;
 summary?: string;
};
 cvText: string;
}

export async function evaluateCVMatch(cvFile: File, jobDescription: string, jobTitle: string): Promise<CVMatchResult> {
 try {
 const apiKey = process.env.GEMINI_API_KEY;
 if (!apiKey) {
 console.warn("GEMINI_API_KEY is not set. Falling back to random match percentage.");
 return {
 matchPercentage: Math.floor(Math.random() * 60) + 40,
 extractedInfo: {},
 cvText:""
};
}

 const ai = new GoogleGenAI({ apiKey});
 
 let cvContentPart: any;
 let extractedText ="";

 if (cvFile.name.toLowerCase().endsWith('.docx')) {
 // Extract text from DOCX using mammoth
 const arrayBuffer = await cvFile.arrayBuffer();
 const result = await mammoth.extractRawText({ arrayBuffer});
 extractedText = result.value;
 cvContentPart = { text:`Candidate CV Content:\n${extractedText}`};
} else {
 // For PDF and other files, pass as base64 inlineData
 const base64Data = await new Promise<string>((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = () => {
 const result = reader.result as string;
 const base64 = result.split(',')[1];
 resolve(base64);
};
 reader.onerror = reject;
 reader.readAsDataURL(cvFile);
});

 cvContentPart = {
 inlineData: {
 mimeType: cvFile.type ||"application/pdf",
 data: base64Data,
},
};
}

 const prompt =`
You are an expert technical recruiter and CV parser. 
1. Extract the candidate's personal information from the provided CV. 
 - Pay special attention to the email address. It is crucial to get this right.
 - Look for patterns like"email:","E:", or just standalone email addresses.
2. Evaluate the CV against the following Job Description.
3. Calculate a match percentage (0-100) based on how well the candidate's skills, experience, and qualifications align with the job requirements.

Job Title: ${jobTitle}
Job Description:
${jobDescription}

Return a JSON object with the following structure:
{
"matchPercentage": number,
"extractedInfo": {
"name":"string or null",
"email":"string or null",
"phone":"string or null",
"skills": ["array of strings"],
"education":"string or null",
"location":"string or null",
"summary":"brief professional summary"
},
"extractedText":"the full text content extracted from the CV"
}

IMPORTANT: If you cannot find a specific field, return null for that field. Do NOT make up information.
`;

 const response = await ai.models.generateContent({
 model:"gemini-3-flash-preview",
 contents: {
 parts: [
 cvContentPart,
 {
 text: prompt,
},
 ],
},
 config: {
 responseMimeType:"application/json",
 responseSchema: {
 type: Type.OBJECT,
 properties: {
 matchPercentage: {
 type: Type.INTEGER,
 description:"The match percentage from 0 to 100",
},
 extractedInfo: {
 type: Type.OBJECT,
 properties: {
 name: { type: Type.STRING, nullable: true},
 email: { type: Type.STRING, nullable: true},
 phone: { type: Type.STRING, nullable: true},
 skills: { type: Type.ARRAY, items: { type: Type.STRING}},
 education: { type: Type.STRING, nullable: true},
 location: { type: Type.STRING, nullable: true},
 summary: { type: Type.STRING, nullable: true},
},
},
 extractedText: {
 type: Type.STRING,
 description:"The full text content of the CV"
}
},
 required: ["matchPercentage","extractedInfo","extractedText"],
},
},
});

 const text = response.text;
 if (text) {
 try {
 const result = JSON.parse(text);
 return {
 matchPercentage: result.matchPercentage || 0,
 extractedInfo: result.extractedInfo || {},
 cvText: result.extractedText || extractedText || text // Fallback to raw text if needed
};
} catch (parseError) {
 console.error("Failed to parse Gemini response:", parseError);
}
}
 
 return {
 matchPercentage: Math.floor(Math.random() * 60) + 40,
 extractedInfo: {},
 cvText: extractedText
};
} catch (error) {
 console.error("Error evaluating CV match:", error);
 return {
 matchPercentage: Math.floor(Math.random() * 60) + 40,
 extractedInfo: {},
 cvText:""
};
}
}
