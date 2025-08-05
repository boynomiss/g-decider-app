"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalizedRecommendations = exports.analyzeMoodAndSuggest = exports.generatePlaceDescription = exports.testGeminiAccess = void 0;
const functions = require("firebase-functions");
const generative_ai_1 = require("@google/generative-ai");
// Initialize Google AI with API key
// Note: For production, you should use environment variables for the API key
// Using asia-southeast1 region for better optimization in Asia-Pacific
const genAI = new generative_ai_1.GoogleGenerativeAI('AIzaSyAcdwn6FkzWBh-orqK2hcFyEBmskeFaMOY');
// Get the model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
/**
 * Firebase Function to test Gemini API access.
 * This HTTP callable function will send a simple prompt to Gemini and log the response.
 */
exports.testGeminiAccess = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    const startTime = Date.now();
    functions.logger.info("🚀 Attempting to call Gemini API...");
    const prompt = data.prompt || "Tell me a short, inspiring fact about the universe.";
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const processingTime = Date.now() - startTime;
        functions.logger.info("✅ Successfully connected to Gemini API!", {
            response_text: text.substring(0, 100) + "...",
            processingTime
        });
        // This is the log you wanted to confirm everything is set!
        functions.logger.info("🎉 Gemini API access confirmed! Everything is set in place. 🎉");
        return {
            success: true,
            message: "Gemini API call successful.",
            geminiResponse: text,
            processingTime
        };
    }
    catch (error) {
        const processingTime = Date.now() - startTime;
        functions.logger.error("❌ Error calling Gemini API:", error);
        // Log the "failure" if something goes wrong
        functions.logger.error("💔 Gemini API access failed. Check logs for details. 💔");
        throw new functions.https.HttpsError('internal', 'Failed to call Gemini API.', { error: error.message, processingTime });
    }
});
/**
 * Firebase Function to generate place descriptions using Gemini
 */
exports.generatePlaceDescription = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    const startTime = Date.now();
    functions.logger.info("🏢 Generating place description with Gemini...");
    const placeInfo = data.prompt || "A restaurant in Manila";
    const prompt = `Generate a compelling, short description (2-3 sentences) for this place: ${placeInfo}. 
  Make it engaging and highlight what makes it special. Focus on atmosphere, food quality, and unique features.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const processingTime = Date.now() - startTime;
        functions.logger.info("✅ Place description generated successfully!", {
            description_length: text.length,
            processingTime
        });
        return {
            success: true,
            message: "Place description generated successfully.",
            geminiResponse: text,
            processingTime
        };
    }
    catch (error) {
        const processingTime = Date.now() - startTime;
        functions.logger.error("❌ Error generating place description:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate place description.', { error: error.message, processingTime });
    }
});
/**
 * Firebase Function to analyze mood and suggest places
 */
exports.analyzeMoodAndSuggest = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    const startTime = Date.now();
    functions.logger.info("😊 Analyzing mood and suggesting places...");
    const userMood = data.prompt || "I'm feeling happy";
    const prompt = `Based on this mood: "${userMood}", suggest 3 types of places that would be perfect for this mood. 
  For each suggestion, explain why it matches the mood. Keep it concise and practical.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const processingTime = Date.now() - startTime;
        functions.logger.info("✅ Mood analysis and suggestions completed!", {
            suggestions_length: text.length,
            processingTime
        });
        return {
            success: true,
            message: "Mood analysis and suggestions completed.",
            geminiResponse: text,
            processingTime
        };
    }
    catch (error) {
        const processingTime = Date.now() - startTime;
        functions.logger.error("❌ Error analyzing mood:", error);
        throw new functions.https.HttpsError('internal', 'Failed to analyze mood and suggest places.', { error: error.message, processingTime });
    }
});
/**
 * Firebase Function to get personalized recommendations
 */
exports.getPersonalizedRecommendations = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    const startTime = Date.now();
    functions.logger.info("🎯 Generating personalized recommendations...");
    const preferences = data.prompt || "I like Italian food";
    const prompt = `Based on these preferences: "${preferences}", provide 3 personalized place recommendations. 
  For each recommendation, explain why it matches the preferences and what makes it special. 
  Include practical details like atmosphere, price range, and unique features.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const processingTime = Date.now() - startTime;
        functions.logger.info("✅ Personalized recommendations generated!", {
            recommendations_length: text.length,
            processingTime
        });
        return {
            success: true,
            message: "Personalized recommendations generated successfully.",
            geminiResponse: text,
            processingTime
        };
    }
    catch (error) {
        const processingTime = Date.now() - startTime;
        functions.logger.error("❌ Error generating recommendations:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate personalized recommendations.', { error: error.message, processingTime });
    }
});
//# sourceMappingURL=geminiFunctions.js.map