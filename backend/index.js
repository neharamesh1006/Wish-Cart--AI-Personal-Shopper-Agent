require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (error) {
  console.warn('Warning: GoogleGenAI failed to initialize. Check your GEMINI_API_KEY.');
}

// Mock Database of Products
const MOCK_PRODUCTS = [
  { id: 1, name: "Sony WH-1000XM5 Headphones", price: "$348.00", category: "electronics", image: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", tags: ["music", "audio", "headphones", "gift"] },
  { id: 2, name: "MacBook Air M3", price: "$1099.00", category: "electronics", image: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", tags: ["laptop", "computer", "apple", "work"] },
  { id: 3, name: "Mechanical Keyboard Keychron Q1", price: "$179.00", category: "electronics", image: "linear-gradient(135deg, #434343 0%, #000000 100%)", tags: ["keyboard", "gaming", "typing", "gift"] },
  { id: 4, name: "Gourmet Coffee Beans Bundle", price: "$45.00", category: "food", image: "linear-gradient(135deg, #d4a373 0%, #faedcd 100%)", tags: ["coffee", "drink", "gift", "beans"] },
  { id: 5, name: "Aromatherapy Essential Oil Diffuser", price: "$32.00", category: "home", image: "linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)", tags: ["relax", "home", "diffuser", "scent", "gift"] },
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Wish-Cart AI Agent Backend is running!' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
      return res.json({
        response: "I am running in offline mode because the GEMINI_API_KEY is not set. However, here are some default recommendations based on what you might be looking for!",
        products: MOCK_PRODUCTS.slice(0, 3) 
      });
    }

    // Prepare a prompt to extract intention
    const prompt = `You are an AI personal shopper named "Wish". A user has said: "${message}". 
Respond in a friendly, conversational manner like a personal shopper. Give a brief, helpful reply (max 3 sentences).
Then, strictly on a NEW LINE at the very end of your response, output a comma-separated list of 1-3 simple keywords that represent what they are looking to buy (e.g., 'headphones', 'coffee', 'laptop'). DO NOT wrap the keywords in anything or prefix them. Return ONLY the comma separated keywords on the last line.`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const outputText = chatResponse.text.trim();
    const lines = outputText.split('\n');
    
    // Extract keywords from the last line, and the conversational response from the rest.
    let keywordsRaw = lines.pop();
    let responseText = lines.join('\n').trim();
    
    // Fallback if the model didn't format correctly
    if (!responseText) {
      responseText = keywordsRaw;
      keywordsRaw = message;
    }

    const keywords = keywordsRaw.split(',').map(k => k.trim().toLowerCase());

    // Very basic primitive search over the mock db using the extracted keywords
    let matchedProducts = [];
    for (const product of MOCK_PRODUCTS) {
      const match = keywords.some(keyword => {
        return product.name.toLowerCase().includes(keyword) || 
               product.category.includes(keyword) || 
               product.tags.some(tag => tag.includes(keyword));
      });
      if (match) {
        matchedProducts.push(product);
      }
    }

    // Fallback products if no direct match but they asked for something
    if (matchedProducts.length === 0) {
       matchedProducts = MOCK_PRODUCTS.slice(0, 2); // default recommendations
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
