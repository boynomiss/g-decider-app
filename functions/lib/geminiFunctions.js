"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalizedRecommendations = exports.analyzeMoodAndSuggest = exports.generatePlaceDescription = exports.testGeminiAccess = void 0;
const functions = require("firebase-functions");
const generative_ai_1 = require("@google/generative-ai");
const secret_manager_1 = require("@google-cloud/secret-manager");
// Initialize Secret Manager client
const secretManager = new secret_manager_1.SecretManagerServiceClient();
// Initialize Gemini AI
let genAI = null;
let apiKey = null;
async function getGeminiAPIKey() {
    var _a, _b;
    if (apiKey) {
        return apiKey;
    }
    try {
        const name = 'projects/g-decider-backend/secrets/gemini-api-key/versions/latest';
        const [version] = await secretManager.accessSecretVersion({ name });
        apiKey = ((_b = (_a = version.payload) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.toString()) || '';
        if (!apiKey) {
            throw new Error('Failed to retrieve API key from Secret Manager');
        }
        console.log('✅ Successfully retrieved Gemini API key from Secret Manager');
        return apiKey;
    }
    catch (error) {
        console.error('❌ Error retrieving API key from Secret Manager:', error);
        throw new Error('Failed to access Gemini API key from Secret Manager');
    }
}
async function getGeminiAI() {
    if (!genAI) {
        const apiKey = await getGeminiAPIKey();
        genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    return genAI;
}
exports.testGeminiAccess = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
        const { text } = req.body;
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
        });
    }
    catch (error) {
        console.error('❌ Gemini AI access test failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.generatePlaceDescription = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
        const { placeData } = req.body;
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
        });
    }
    catch (error) {
        console.error('❌ Place description generation failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.analyzeMoodAndSuggest = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
        const { userMood, filters } = req.body;
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
        });
    }
    catch (error) {
        console.error('❌ Mood analysis failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getPersonalizedRecommendations = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
        const { placeData, userMood } = req.body;
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
        });
    }
    catch (error) {
        console.error('❌ Personalized recommendations failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=geminiFunctions.js.map