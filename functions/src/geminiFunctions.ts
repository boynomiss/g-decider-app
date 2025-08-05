import * as functions from 'firebase-functions';
import { Request, Response } from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

interface GeminiRequest {
  text?: string;
  placeData?: any;
  userMood?: number;
  filters?: any;
  prompt?: string;
}

interface GeminiResponse {
  success: boolean;
  result?: string;
  error?: string;
}

// Initialize Secret Manager client
const secretManager = new SecretManagerServiceClient();

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let apiKey: string | null = null;

async function getGeminiAPIKey(): Promise<string> {
  if (apiKey) {
    return apiKey;
  }

  try {
    const name = 'projects/g-decider-backend/secrets/gemini-api-key/versions/latest';
    const [version] = await secretManager.accessSecretVersion({ name });
    apiKey = version.payload?.data?.toString() || '';
    
    if (!apiKey) {
      throw new Error('Failed to retrieve API key from Secret Manager');
    }
    
    console.log('✅ Successfully retrieved Gemini API key from Secret Manager');
    return apiKey;
  } catch (error) {
    console.error('❌ Error retrieving API key from Secret Manager:', error);
    throw new Error('Failed to access Gemini API key from Secret Manager');
  }
}

async function getGeminiAI(): Promise<GoogleGenerativeAI> {
  if (!genAI) {
    const apiKey = await getGeminiAPIKey();
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export const testGeminiAccess = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { text } = req.body as GeminiRequest;
    
    console.log('🧪 Testing Gemini AI access...');
    
    const gemini = await getGeminiAI();
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(text || 'Hello, this is a test message.');
    const response = await result.response;
    const responseText = response.text();
    
    console.log('✅ Gemini AI access test successful');
    
    res.json({
      success: true,
      result: responseText
    } as GeminiResponse);
    
  } catch (error) {
    console.error('❌ Gemini AI access test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as GeminiResponse);
  }
});

export const generatePlaceDescription = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { placeData } = req.body as GeminiRequest;
    
    if (!placeData) {
      res.status(400).json({ error: 'Place data is required' });
      return;
    }
    
    console.log('🎨 Generating place description with Gemini AI...');
    
    const gemini = await getGeminiAI();
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Generate a compelling description for this place: ${JSON.stringify(placeData)}. 
    Make it engaging and highlight the unique features. Keep it under 100 words.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();
    
    console.log('✅ Place description generated successfully');
    
    res.json({
      success: true,
      result: description
    } as GeminiResponse);
    
  } catch (error) {
    console.error('❌ Place description generation failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as GeminiResponse);
  }
});

export const analyzeMoodAndSuggest = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userMood, filters } = req.body as GeminiRequest;
    
    if (!userMood || !filters) {
      res.status(400).json({ error: 'User mood and filters are required' });
      return;
    }
    
    console.log('😊 Analyzing mood and generating suggestions...');
    
    const gemini = await getGeminiAI();
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this user mood (${userMood}/100) and filters (${JSON.stringify(filters)}) 
    to suggest the best type of places they should visit. Consider their mood, budget, and preferences.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestion = response.text();
    
    console.log('✅ Mood analysis and suggestions completed');
    
    res.json({
      success: true,
      result: suggestion
    } as GeminiResponse);
    
  } catch (error) {
    console.error('❌ Mood analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as GeminiResponse);
  }
});

export const getPersonalizedRecommendations = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { placeData, userMood } = req.body as GeminiRequest;
    
    if (!placeData || !userMood) {
      res.status(400).json({ error: 'Place data and user mood are required' });
      return;
    }
    
    console.log('🎯 Generating personalized recommendations...');
    
    const gemini = await getGeminiAI();
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Based on this place data (${JSON.stringify(placeData)}) and user mood (${userMood}/100), 
    provide personalized recommendations for similar places or activities that would match their preferences.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recommendations = response.text();
    
    console.log('✅ Personalized recommendations generated');
    
    res.json({
      success: true,
      result: recommendations
    } as GeminiResponse);
    
  } catch (error) {
    console.error('❌ Personalized recommendations failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as GeminiResponse);
  }
}); 