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
import db from '../database/db';

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
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdf(file.buffer);
      cvText = pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxData = await mammoth.extractRawText({ buffer: file.buffer });
      cvText = docxData.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload PDF or DOCX.' });
    }

    // 2. AI CV Parsing (CORE FEATURE)
    const prompt = `
      You are an expert HR recruiter. Parse the following CV text and extract the requested structured data.
      If a field is not found, leave it empty or null.
      
      CV Text:
      ${cvText.substring(0, 15000)} // Limit text to avoid token limits if necessary
    `;

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

    const parsedData = JSON.parse(response.text || '{}');
    console.log('[Debug] Parsed Data:', parsedData);

    // 3. Save to Database
    console.log('[Debug] Saving to database...');
    const stmt = db.prepare(`
      INSERT INTO candidates (
        company_id, name, email, phone, cv_file_url, source, 
        current_job_title, last_job_title, skills, education, 
        certifications, category, keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      company_id || 'default_company',
      parsedData.name || 'Unknown',
      parsedData.email || '',
      parsedData.phone || '',
      cv_file_url || '', // In a real app, this would be the URL after saving to S3/Firebase Storage
      source || 'Manual Upload',
      parsedData.current_job_title || '',
      parsedData.last_job_title || '',
      JSON.stringify(parsedData.skills || []),
      parsedData.education || '',
      parsedData.certifications || '',
      parsedData.category || '',
      parsedData.keywords || ''
    );
    console.log('[Debug] Save result:', result);

    res.status(201).json({ 
      message: 'CV parsed and saved successfully', 
      candidateId: result.lastInsertRowid,
      parsedData 
    });

  } catch (error) {
    console.error('Error parsing CV:', error);
    res.status(500).json({ error: 'Failed to process CV' });
  }
});

// 4. Search API
router.get('/search', (req, res) => {
  try {
    const { company_id, keyword, skills, category, job_title } = req.query;
    console.log('Search API called with:', { company_id, keyword, skills, category, job_title });

    let query = 'SELECT * FROM candidates WHERE company_id = ?';
    const params: any[] = [company_id || 'default_company'];

    // Dynamic filter combination
    if (keyword) {
      query += ' AND (name LIKE ? OR keywords LIKE ? OR education LIKE ?)';
      const keywordParam = `%${keyword}%`;
      params.push(keywordParam, keywordParam, keywordParam);
    }

    if (category) {
      query += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }

    if (job_title) {
      query += ' AND (current_job_title LIKE ? OR last_job_title LIKE ?)';
      const jobParam = `%${job_title}%`;
      params.push(jobParam, jobParam);
    }

    // Execute base query
    const stmt = db.prepare(query);
    let candidates = stmt.all(params) as any[];

    // Filter by skills (JSON array search)
    if (skills) {
      const skillsArray = (skills as string).split(',').map(s => s.trim().toLowerCase());
      candidates = candidates.filter(candidate => {
        try {
          const candidateSkills = JSON.parse(candidate.skills || '[]').map((s: string) => s.toLowerCase());
          // Check if candidate has ANY of the requested skills
          return skillsArray.some(skill => 
            candidateSkills.some((cs: string) => cs.includes(skill))
          );
        } catch (e) {
          return false;
        }
      });
    }

    // Parse skills back to array for response
    const formattedCandidates = candidates.map(c => ({
      ...c,
      skills: JSON.parse(c.skills || '[]')
    }));

    res.json(formattedCandidates);

  } catch (error) {
    console.error('Error searching candidates:', error);
    res.status(500).json({ error: 'Failed to search candidates' });
  }
});

export default router;
