require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Database connection
let db;
try {
  db = new Database('wishcart.db', { fileMustExist: true });
} catch (error) {
  console.warn("Could not find wishcart.db. Did you run 'node seed.js'?");
}

// Initialize Gemini
let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (error) {
  console.warn('Warning: GoogleGenAI failed to initialize. Check your GEMINI_API_KEY.');
}

// Helper: Query Database
function searchProducts(keywords) {
  if (!db) return [];
  
  if (keywords.length === 0) {
     return db.prepare('SELECT * FROM products LIMIT 5').all();
  }

  // Build a generic fuzzy LIKE query across name, category, and tags for each keyword
  // E.g. SELECT * FROM products WHERE (name LIKE '%kw1%' OR category LIKE '%kw1%') OR (...)
  const clauses = [];
  const params = [];
  
  for (const kw of keywords) {
     clauses.push(`(name LIKE ? OR category LIKE ? OR tags LIKE ?)`);
     const likeParam = `%${kw}%`;
     params.push(likeParam, likeParam, likeParam);
  }

  const queryStr = `SELECT * FROM products WHERE ${clauses.join(' OR ')} LIMIT 5`;
  const stmt = db.prepare(queryStr);
  
  return stmt.all(...params);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Wish-Cart AI Agent Backend is running with SQLite!' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
      const defaultProducts = searchProducts([]);
      return res.json({
        response: "I am running in offline mode because the GEMINI_API_KEY is not set. However, here are some default recommendations from our database based on what you might be looking for!",
        products: defaultProducts
      });
    }

    const prompt = `You are an AI personal shopper named "Wish". A user has said: "${message}". 
Respond in a friendly, conversational manner like a personal shopper. Give a brief, helpful reply (max 3 sentences).
Then, strictly on a NEW LINE at the very end of your response, output a comma-separated list of 1-3 simple keywords that represent what they are looking to buy (e.g., 'headphones', 'coffee', 'laptop'). DO NOT wrap the keywords in anything or prefix them. Return ONLY the comma separated keywords on the last line.`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const outputText = chatResponse.text.trim();
    const lines = outputText.split('\n');
    
    // Extract keywords from the last line
    let keywordsRaw = lines.pop();
    let responseText = lines.join('\n').trim();
    
    // Fallback if the model didn't format correctly
    if (!responseText) {
      responseText = keywordsRaw;
      keywordsRaw = message;
    }

    const keywords = keywordsRaw.split(',').map(k => k.trim().toLowerCase());

    // Search real database
    let matchedProducts = searchProducts(keywords);

    // Fallback products if no direct match
    if (matchedProducts.length === 0) {
       matchedProducts = searchProducts([]);
    }

    res.json({
      response: responseText,
      products: matchedProducts
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error while processing request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Wish-Cart backend server running on http://localhost:${PORT}`);
});
