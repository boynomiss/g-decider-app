"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPlacePreferences = exports.analyzeUserMood = exports.analyzeText = exports.analyzeEntities = exports.analyzeSentiment = void 0;
const functions = __importStar(require("firebase-functions"));
exports.analyzeSentiment = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ success: false, error: 'Text is required' });
            return;
        }
        console.log('🔍 Analyzing sentiment for text:', text.substring(0, 50) + '...');
        // Mock sentiment analysis for now
        const sentiment = {
            score: Math.random() * 2 - 1, // -1 to 1
            magnitude: Math.random() * 10 // 0 to 10
        };
        res.json({
            success: true,
            sentiment
        });
    }
    catch (error) {
        console.error('❌ Sentiment analysis error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.analyzeEntities = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ success: false, error: 'Text is required' });
            return;
        }
        console.log('🔍 Analyzing entities for text:', text.substring(0, 50) + '...');
        // Mock entity analysis for now
        const entities = [
            { name: 'Manila', type: 'LOCATION', salience: 0.8 },
            { name: 'Restaurant', type: 'ORGANIZATION', salience: 0.6 },
            { name: 'Food', type: 'OTHER', salience: 0.4 }
        ];
        res.json({
            success: true,
            entities
        });
    }
    catch (error) {
        console.error('❌ Entity analysis error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.analyzeText = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    try {
        const { text, analysisType } = req.body;
        if (!text) {
            res.status(400).json({ success: false, error: 'Text is required' });
            return;
        }
        console.log('🔍 Analyzing text:', text.substring(0, 50) + '...', 'Type:', analysisType);
        const response = {
            success: true
        };
        if (analysisType === 'sentiment' || analysisType === 'both') {
            response.sentiment = {
                score: Math.random() * 2 - 1,
                magnitude: Math.random() * 10
            };
        }
        if (analysisType === 'entities' || analysisType === 'both') {
            response.entities = [
                { name: 'Place', type: 'LOCATION', salience: 0.7 },
                { name: 'Food', type: 'OTHER', salience: 0.5 }
            ];
        }
        res.json(response);
    }
    catch (error) {
        console.error('❌ Text analysis error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.analyzeUserMood = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ success: false, error: 'Text is required' });
            return;
        }
        console.log('😊 Analyzing user mood:', text.substring(0, 50) + '...');
        // Mock mood analysis
        const moodScore = Math.random() * 100;
        const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
        const moodIndex = Math.floor(moodScore / 20);
        const mood = {
            score: moodScore,
            label: moodLabels[moodIndex],
            confidence: Math.random() * 0.3 + 0.7 // 0.7 to 1.0
        };
        res.json({
            success: true,
            mood
        });
    }
    catch (error) {
        console.error('❌ Mood analysis error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.extractPlacePreferences = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ success: false, error: 'Text is required' });
            return;
        }
        console.log('🏪 Extracting place preferences from:', text.substring(0, 50) + '...');
        // Mock preference extraction
        const preferences = {
            categories: ['restaurant', 'cafe'],
            mood: 'chill',
            budget: 'PP',
            socialContext: 'solo'
        };
        res.json({
            success: true,
            preferences
        });
    }
    catch (error) {
        console.error('❌ Preference extraction error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=nlpFunctions.js.map