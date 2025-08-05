"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPlacePreferences = exports.analyzeUserMood = exports.analyzeText = exports.analyzeEntities = exports.analyzeSentiment = void 0;
const functions = require("firebase-functions");
const nlpService_1 = require("./nlpService");
/**
 * Firebase function for sentiment analysis
 */
exports.analyzeSentiment = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    const startTime = Date.now();
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
        if (!text) {
            res.status(400).json({ error: 'Missing text parameter' });
            return;
        }
        console.log('🧠 Analyzing sentiment for text:', text.substring(0, 100) + '...');
        const sentiment = await nlpService_1.nlpService.analyzeSentiment(text);
        const processingTime = Date.now() - startTime;
        const response = {
            success: true,
            data: sentiment,
            analysisType: 'sentiment',
            processingTime
        };
        console.log(`✅ Sentiment analysis completed in ${processingTime}ms`);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('❌ Sentiment analysis error:', error);
        const processingTime = Date.now() - startTime;
        res.status(500).json({
            success: false,
            error: error.message,
            analysisType: 'sentiment',
            processingTime
        });
    }
});
/**
 * Firebase function for entity analysis
 */
exports.analyzeEntities = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    const startTime = Date.now();
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
        if (!text) {
            res.status(400).json({ error: 'Missing text parameter' });
            return;
        }
        console.log('🏷️ Analyzing entities for text:', text.substring(0, 100) + '...');
        const entities = await nlpService_1.nlpService.analyzeEntities(text);
        const processingTime = Date.now() - startTime;
        const response = {
            success: true,
            data: entities,
            analysisType: 'entities',
            processingTime
        };
        console.log(`✅ Entity analysis completed in ${processingTime}ms`);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('❌ Entity analysis error:', error);
        const processingTime = Date.now() - startTime;
        res.status(500).json({
            success: false,
            error: error.message,
            analysisType: 'entities',
            processingTime
        });
    }
});
/**
 * Firebase function for comprehensive text analysis
 */
exports.analyzeText = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    const startTime = Date.now();
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
        if (!text) {
            res.status(400).json({ error: 'Missing text parameter' });
            return;
        }
        console.log('📝 Analyzing text comprehensively:', text.substring(0, 100) + '...');
        const analysis = await nlpService_1.nlpService.analyzeText(text);
        const processingTime = Date.now() - startTime;
        const response = {
            success: true,
            data: analysis,
            analysisType: 'comprehensive',
            processingTime
        };
        console.log(`✅ Comprehensive text analysis completed in ${processingTime}ms`);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('❌ Comprehensive text analysis error:', error);
        const processingTime = Date.now() - startTime;
        res.status(500).json({
            success: false,
            error: error.message,
            analysisType: 'comprehensive',
            processingTime
        });
    }
});
/**
 * Firebase function for user mood analysis
 */
exports.analyzeUserMood = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    const startTime = Date.now();
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
        if (!text) {
            res.status(400).json({ error: 'Missing text parameter' });
            return;
        }
        console.log('😊 Analyzing user mood for text:', text.substring(0, 100) + '...');
        const mood = await nlpService_1.nlpService.analyzeUserMood(text);
        const processingTime = Date.now() - startTime;
        const response = {
            success: true,
            data: mood,
            analysisType: 'mood',
            processingTime
        };
        console.log(`✅ User mood analysis completed in ${processingTime}ms`);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('❌ User mood analysis error:', error);
        const processingTime = Date.now() - startTime;
        res.status(500).json({
            success: false,
            error: error.message,
            analysisType: 'mood',
            processingTime
        });
    }
});
/**
 * Firebase function for extracting place preferences
 */
exports.extractPlacePreferences = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    const startTime = Date.now();
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
        if (!text) {
            res.status(400).json({ error: 'Missing text parameter' });
            return;
        }
        console.log('🎯 Extracting place preferences from text:', text.substring(0, 100) + '...');
        const preferences = await nlpService_1.nlpService.extractPlacePreferences(text);
        const processingTime = Date.now() - startTime;
        const response = {
            success: true,
            data: preferences,
            analysisType: 'preferences',
            processingTime
        };
        console.log(`✅ Place preferences extraction completed in ${processingTime}ms`);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('❌ Place preferences extraction error:', error);
        const processingTime = Date.now() - startTime;
        res.status(500).json({
            success: false,
            error: error.message,
            analysisType: 'preferences',
            processingTime
        });
    }
});
//# sourceMappingURL=nlpFunctions.js.map