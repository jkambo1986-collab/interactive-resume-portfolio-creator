import { GoogleGenerativeAI } from '@google/generative-ai';

// ... (code)

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: modelName,
  generationConfig: config
});


export default async function handler(req, res) {
  // Allow CORS for local development flexibility if needed
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for API key in various common environment variable names
  const apiKey = process.env.API_KEY || process.env.VITE_API_KEY || process.env.NEXT_PUBLIC_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing in server environment variables.");
    return res.status(500).json({
      error: 'Server API configuration missing. Please set API_KEY in your Vercel project settings.'
    });
  }

  try {
    const { model, method, contents, config } = req.body || {};

    if (!model || !contents) {
      return res.status(400).json({ error: 'Missing required parameters: model or contents' });
    }

    const ai = new GoogleGenAI({ apiKey });

    if (method === 'generateContent') {
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });

      // Extract the text safely to ensure a JSON-serializable response
      const text = response.text; // Accessing the getter

      const result = {
        text: text,
        candidates: response.candidates,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
        usageMetadata: response.usageMetadata,
      };

      return res.status(200).json(result);
    } else {
      return res.status(400).json({ error: `Unsupported method: ${method}` });
    }
  } catch (error) {
    console.error('Gemini API Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
