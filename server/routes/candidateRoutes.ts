import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const pdf = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
console.log('[Debug] pdfParse type:', typeof pdfParse);
console.log('[Debug] pdf type:', typeof pdf);
console.log('[Debug] pdfParse keys:', Object.keys(pdfParse));
import mammoth from 'mammoth';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '../database/firebaseAdmin';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini lazily
let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

// 1. CV Upload API
router.post('/upload', upload.single('cv_file'), async (req, res) => {
  try {
    const aiClient = getAI();
    const { company_id, source, cv_file_url } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No CV file uploaded' });
    }

    // Extract text based on file type
    let cvText = '';
    console.log('[Debug] File mimetype:', file.mimetype);
    if (file.mimetype === 'application/pdf') {
      console.log('[Debug] Parsing PDF...');
      try {
        const pdfData = await pdf(file.buffer);
        cvText = pdfData.text;
        console.log('[Debug] PDF parsed, text length:', cvText.length);
      } catch (e: any) {
        console.error('[Debug] PDF parsing failed:', e);
        const errorMessage = e && e.name ? `${e.name}: ${e.message}` : String(e);
        throw new Error('PDF parsing failed: ' + errorMessage);
      }
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('[Debug] Parsing DOCX...');
      try {
        const docxData = await mammoth.extractRawText({ buffer: file.buffer });
        cvText = docxData.value;
        console.log('[Debug] DOCX parsed, text length:', cvText.length);
      } catch (e) {
        console.error('[Debug] DOCX parsing failed:', e);
        throw new Error('DOCX parsing failed: ' + (e instanceof Error ? e.message : String(e)));
      }
    } else {
      console.log('[Debug] Unsupported mimetype:', file.mimetype);
      return res.status(400).json({ error: 'Unsupported file type. Please upload PDF or DOCX.' });
    }

    if (!cvText || cvText.trim().length === 0) {
      console.log('[Debug] Extracted text is empty');
      return res.status(400).json({ error: 'Could not extract text from the file. Please ensure it is a readable document.' });
    }

    // 2. AI CV Parsing (CORE FEATURE)
    const prompt = `
      You are an expert HR recruiter. Parse the following CV text and extract the requested structured data.
      If a field is not found, leave it empty or null.
      
      CV Text:
      ${cvText.substring(0, 15000)}
    `;
    console.log('[Debug] Prompt constructed, length:', prompt.length);

    console.log('[Debug] Calling Gemini API...');
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Full Name' },
            email: { type: Type.STRING, description: 'Email address' },
            phone: { type: Type.STRING, description: 'Phone number' },
            current_job_title: { type: Type.STRING, description: 'Current Job Title' },
            last_job_title: { type: Type.STRING, description: 'Last Job Title' },
            skills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'List of skills'
            },
            education: { type: Type.STRING, description: 'Education details (full text)' },
            certifications: { type: Type.STRING, description: 'Certifications (full text)' },
            category: { type: Type.STRING, description: 'Category (e.g. Developer, Manager, Accountant)' },
            keywords: { type: Type.STRING, description: 'Important keywords from entire CV, comma separated' }
          },
          required: ['name', 'skills', 'category', 'keywords']
        }
      }
    });
    console.log('[Debug] Gemini API response received');
    
    // Clean the response text to ensure it's valid JSON
    const rawText = response.text || '{}';
    const cleanedText = rawText.replace(/```json\n?|\n?```/g, '').trim();
    console.log('[Debug] Cleaned text:', cleanedText);
    
    const parsedData = JSON.parse(cleanedText);
    console.log('[Debug] Parsed Data:', parsedData);

    // 3. Save to Firestore
    console.log('[Debug] Saving to Firestore...');
    const candidateRef = db.collection('candidates').doc();
    await candidateRef.set({
      companyId: company_id || 'default_company',
      candidateName: parsedData.name || 'Unknown',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      cvUrl: cv_file_url || '',
      source: source || 'Manual Upload',
      currentJobTitle: parsedData.current_job_title || '',
      lastJobTitle: parsedData.last_job_title || '',
      skills: parsedData.skills || [],
      education: parsedData.education || '',
      certifications: parsedData.certifications || '',
      category: parsedData.category || '',
      keywords: parsedData.keywords || '',
      stage: 'New Candidates',
      appliedAt: new Date().toISOString(),
      matchPercentage: Math.floor(Math.random() * 60) + 40,
    });
    console.log('[Debug] Save successful, ID:', candidateRef.id);

    res.status(201).json({ 
      message: 'CV parsed and saved successfully', 
      candidateId: candidateRef.id,
      parsedData 
    });

  } catch (error) {
    console.error('Full Error Object:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (error instanceof SyntaxError) {
      console.error('JSON Parse Error:', errorMessage);
    }
    res.status(500).json({ 
      error: 'Failed to process CV', 
      details: errorMessage 
    });
  }
});

// 4. Search API
router.get('/search', async (req, res) => {
  try {
    const { company_id, keyword, skills, category, job_title } = req.query;
    console.log('Search API called with:', { company_id, keyword, skills, category, job_title });

    let candidatesRef: any = db.collection('candidates');
    let query = candidatesRef.where('companyId', '==', company_id || 'default_company');

    // Firestore doesn't support complex LIKE queries. 
    // We'll fetch all company candidates and filter in memory for now,
    // or implement more complex indexing if needed.
    const snapshot = await query.get();
    let candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by keyword (name, keywords, education)
    if (keyword) {
      const keywordLower = (keyword as string).toLowerCase();
      candidates = candidates.filter(c => 
        (c.candidateName && c.candidateName.toLowerCase().includes(keywordLower)) ||
        (c.keywords && c.keywords.toLowerCase().includes(keywordLower)) ||
        (c.education && c.education.toLowerCase().includes(keywordLower))
      );
    }

    // Filter by category
    if (category) {
      const categoryLower = (category as string).toLowerCase();
      candidates = candidates.filter(c => 
        c.category && c.category.toLowerCase().includes(categoryLower)
      );
    }

    // Filter by job title
    if (job_title) {
      const jobTitleLower = (job_title as string).toLowerCase();
      candidates = candidates.filter(c => 
        (c.currentJobTitle && c.currentJobTitle.toLowerCase().includes(jobTitleLower)) ||
        (c.lastJobTitle && c.lastJobTitle.toLowerCase().includes(jobTitleLower))
      );
    }

    // Filter by skills (JSON array search)
    if (skills) {
      const skillsArray = (skills as string).split(',').map(s => s.trim().toLowerCase());
      candidates = candidates.filter(candidate => {
        const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
        return skillsArray.some(skill => 
          candidateSkills.some((cs: string) => cs.includes(skill))
        );
      });
    }

    res.json(candidates);

  } catch (error) {
    console.error('Error searching candidates:', error);
    res.status(500).json({ error: 'Failed to search candidates' });
  }
});

export default router;
