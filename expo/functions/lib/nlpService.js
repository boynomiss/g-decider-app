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
exports.nlpService = exports.NLPService = void 0;
const language_1 = require("@google-cloud/language");
const path = __importStar(require("path"));
// Initialize the Language Service client with service account credentials
const serviceAccountPath = path.join(__dirname, '../nlp-service-account.json');
// Check if service account file exists
let languageClient;
try {
    languageClient = new language_1.LanguageServiceClient({
        keyFilename: serviceAccountPath
    });
    console.log('✅ NLP Service initialized with service account');
}
catch (error) {
    console.warn('⚠️ Could not initialize NLP Service with service account, using default credentials');
    languageClient = new language_1.LanguageServiceClient();
}
class NLPService {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.client = languageClient;
    }
    /**
     * Analyze sentiment of text using Google Cloud Natural Language API with retry mechanism
     */
    async analyzeSentiment(text) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔍 Analyzing sentiment (attempt ${attempt}/${this.maxRetries}):`, text.substring(0, 100) + '...');
                const document = {
                    content: text,
                    type: 'PLAIN_TEXT',
                };
                const [result] = await this.client.analyzeSentiment({ document });
                const sentiment = result.documentSentiment;
                if (!sentiment) {
                    throw new Error('No sentiment analysis result received');
                }
                const analysisResult = {
                    score: sentiment.score || 0,
                    magnitude: sentiment.magnitude || 0,
                    language: result.language || 'en',
                    confidence: 0.8
                };
                console.log('✅ Sentiment analysis completed:', analysisResult);
                return analysisResult;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`❌ Sentiment analysis attempt ${attempt} failed:`, lastError.message);
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1);
                    console.log(`⏳ Retrying sentiment analysis in ${delay}ms...`);
                    await this.delay(delay);
                }
            }
        }
        // All retries failed, use fallback sentiment analysis
        console.warn('⚠️ Using fallback sentiment analysis');
        return this.fallbackSentimentAnalysis(text);
    }
    /**
     * Analyze entities in text with retry mechanism
     */
    async analyzeEntities(text) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔍 Analyzing entities (attempt ${attempt}/${this.maxRetries}):`, text.substring(0, 100) + '...');
                const document = {
                    content: text,
                    type: 'PLAIN_TEXT',
                };
                const [result] = await this.client.analyzeEntities({ document });
                const entities = result.entities || [];
                const analysisResult = entities.map(entity => ({
                    name: entity.name || '',
                    type: String(entity.type) || 'UNKNOWN',
                    salience: entity.salience || 0,
                    sentiment: {
                        score: entity.sentiment?.score || 0,
                        magnitude: entity.sentiment?.magnitude || 0
                    }
                }));
                console.log('✅ Entity analysis completed:', analysisResult.length, 'entities found');
                return analysisResult;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`❌ Entity analysis attempt ${attempt} failed:`, lastError.message);
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1);
                    console.log(`⏳ Retrying entity analysis in ${delay}ms...`);
                    await this.delay(delay);
                }
            }
        }
        // All retries failed, use fallback entity analysis
        console.warn('⚠️ Using fallback entity analysis');
        return this.fallbackEntityAnalysis(text);
    }
    /**
     * Comprehensive text analysis with retry mechanism
     */
    async analyzeText(text) {
        try {
            console.log('🔍 Starting comprehensive text analysis...');
            const [sentimentResult, entitiesResult] = await Promise.all([
                this.analyzeSentiment(text),
                this.analyzeEntities(text)
            ]);
            // Extract categories from entities - FIXED: Better category extraction
            const categories = this.extractCategoriesFromEntities(entitiesResult, text);
            const analysisResult = {
                sentiment: sentimentResult,
                entities: entitiesResult,
                categories,
                language: sentimentResult.language
            };
            console.log('✅ Comprehensive text analysis completed');
            return analysisResult;
        }
        catch (error) {
            console.error('❌ Comprehensive NLP analysis error:', error);
            throw new Error(`NLP analysis failed: ${error}`);
        }
    }
    /**
     * Analyze user mood from input text - FIXED: Better mood conversion
     */
    async analyzeUserMood(userInput) {
        try {
            console.log('🔍 Analyzing user mood from input...');
            const sentimentResult = await this.analyzeSentiment(userInput);
            // FIXED: Better mood score conversion with enhanced logic
            const moodScore = this.convertSentimentToMoodScore(sentimentResult, userInput);
            console.log('✅ User mood analysis completed:', moodScore);
            return moodScore;
        }
        catch (error) {
            console.error('❌ User mood analysis error:', error);
            // Return neutral mood as fallback
            return 50;
        }
    }
    /**
     * Extract place preferences from user input - FIXED: Better extraction logic
     */
    async extractPlacePreferences(userInput) {
        try {
            console.log('🔍 Extracting place preferences from user input...');
            const analysisResult = await this.analyzeText(userInput);
            // FIXED: Better category extraction from entities and text
            const categories = this.extractPlaceCategories(analysisResult.entities, userInput);
            // Determine mood from sentiment
            const mood = this.convertSentimentToMoodScore(analysisResult.sentiment, userInput);
            // Extract budget preferences from text
            const budget = this.extractBudgetFromText(userInput);
            // Extract social context from text
            const socialContext = this.extractSocialContextFromText(userInput);
            const preferences = {
                categories,
                mood,
                budget,
                socialContext
            };
            console.log('✅ Place preferences extracted:', preferences);
            return preferences;
        }
        catch (error) {
            console.error('❌ Place preferences extraction error:', error);
            // Return default preferences as fallback
            return {
                categories: ['food'],
                mood: 50,
                budget: null,
                socialContext: null
            };
        }
    }
    /**
     * FIXED: Better mood score conversion with enhanced logic
     */
    convertSentimentToMoodScore(sentiment, text) {
        // Base conversion from sentiment score (-1 to 1) to mood (0 to 100)
        let baseScore = ((sentiment.score + 1) / 2) * 100;
        // Enhanced logic based on text content
        const lowerText = text.toLowerCase();
        // Boost score for positive emotional words
        const positiveWords = ['happy', 'excited', 'thrilled', 'overjoyed', 'amazing', 'wonderful', 'fantastic', 'love', 'great', 'good'];
        const negativeWords = ['sad', 'terrible', 'awful', 'miserable', 'hate', 'terrible', 'bad', 'worst'];
        let positiveCount = 0;
        let negativeCount = 0;
        positiveWords.forEach(word => {
            if (lowerText.includes(word))
                positiveCount++;
        });
        negativeWords.forEach(word => {
            if (lowerText.includes(word))
                negativeCount++;
        });
        // Adjust score based on word frequency
        if (positiveCount > negativeCount) {
            baseScore = Math.min(100, baseScore + (positiveCount - negativeCount) * 15);
        }
        else if (negativeCount > positiveCount) {
            baseScore = Math.max(0, baseScore - (negativeCount - positiveCount) * 15);
        }
        // Boost for exclamation marks (excitement indicator)
        const exclamationCount = (text.match(/!/g) || []).length;
        if (exclamationCount > 0 && baseScore > 30) {
            baseScore = Math.min(100, baseScore + exclamationCount * 10);
        }
        // Ensure score is within bounds
        return Math.max(0, Math.min(100, Math.round(baseScore)));
    }
    /**
     * FIXED: Better category extraction from entities and text
     */
    extractPlaceCategories(entities, text) {
        const categories = [];
        const lowerText = text.toLowerCase();
        // Extract from entities
        entities.forEach(entity => {
            const entityName = entity.name.toLowerCase();
            // Restaurant types
            if (entityName.includes('restaurant') || entityName.includes('cafe') || entityName.includes('bar') ||
                entityName.includes('diner') || entityName.includes('bistro')) {
                categories.push(entityName);
            }
            // Cuisine types
            if (entityName.includes('italian') || entityName.includes('chinese') || entityName.includes('japanese') ||
                entityName.includes('korean') || entityName.includes('thai') || entityName.includes('indian') ||
                entityName.includes('mexican') || entityName.includes('french') || entityName.includes('spanish')) {
                categories.push(entityName);
            }
            // Activity types
            if (entityName.includes('park') || entityName.includes('museum') || entityName.includes('theater') ||
                entityName.includes('cinema') || entityName.includes('mall') || entityName.includes('beach')) {
                categories.push(entityName);
            }
        });
        // Extract from text if entities didn't catch everything
        // Restaurant keywords
        if (lowerText.includes('restaurant') && !categories.includes('restaurant')) {
            categories.push('restaurant');
        }
        if (lowerText.includes('cafe') && !categories.includes('cafe')) {
            categories.push('cafe');
        }
        if (lowerText.includes('bar') && !categories.includes('bar')) {
            categories.push('bar');
        }
        // Cuisine keywords
        const cuisineKeywords = ['italian', 'chinese', 'japanese', 'korean', 'thai', 'indian', 'mexican', 'french', 'spanish'];
        cuisineKeywords.forEach(cuisine => {
            if (lowerText.includes(cuisine) && !categories.includes(cuisine)) {
                categories.push(cuisine);
            }
        });
        // Activity keywords
        const activityKeywords = ['park', 'museum', 'theater', 'cinema', 'mall', 'beach', 'activity', 'attraction'];
        activityKeywords.forEach(activity => {
            if (lowerText.includes(activity) && !categories.includes(activity)) {
                categories.push(activity);
            }
        });
        return categories;
    }
    /**
     * FIXED: Better category extraction from entities for comprehensive analysis
     */
    extractCategoriesFromEntities(entities, text) {
        const categories = [];
        // Extract organization and location entities as categories
        entities.forEach(entity => {
            if (entity.type === 'ORGANIZATION' || entity.type === 'LOCATION') {
                categories.push(entity.name);
            }
        });
        // If no categories found from entities, try text-based extraction
        if (categories.length === 0) {
            return this.extractPlaceCategories(entities, text);
        }
        return categories.slice(0, 5); // Limit to 5 categories
    }
    /**
     * Fallback sentiment analysis using simple keyword matching
     */
    fallbackSentimentAnalysis(text) {
        const positiveWords = ['good', 'great', 'amazing', 'excellent', 'wonderful', 'fantastic', 'love', 'like', 'enjoy', 'happy'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated'];
        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;
        words.forEach(word => {
            if (positiveWords.includes(word))
                positiveCount++;
            if (negativeWords.includes(word))
                negativeCount++;
        });
        const total = words.length;
        const score = total > 0 ? (positiveCount - negativeCount) / total : 0;
        const magnitude = Math.abs(score);
        return {
            score: Math.max(-1, Math.min(1, score)),
            magnitude,
            language: 'en',
            confidence: 0.5
        };
    }
    /**
     * Fallback entity analysis using simple keyword extraction
     */
    fallbackEntityAnalysis(text) {
        const entities = [];
        const words = text.split(/\s+/);
        // Simple entity extraction based on capitalization and common patterns
        words.forEach((word, index) => {
            if (word && word.length > 3 && word[0] && word[0] === word[0].toUpperCase()) {
                entities.push({
                    name: word,
                    type: 'UNKNOWN',
                    salience: 1 / (index + 1),
                    sentiment: { score: 0, magnitude: 0 }
                });
            }
        });
        return entities.slice(0, 5); // Limit to 5 entities
    }
    /**
     * Extract budget preferences from text
     */
    extractBudgetFromText(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('cheap') || lowerText.includes('budget') || lowerText.includes('affordable') ||
            lowerText.includes('inexpensive') || lowerText.includes('low cost')) {
            return 'P';
        }
        else if (lowerText.includes('expensive') || lowerText.includes('luxury') || lowerText.includes('premium') ||
            lowerText.includes('high end') || lowerText.includes('fancy') || lowerText.includes('upscale')) {
            return 'PPP';
        }
        else if (lowerText.includes('moderate') || lowerText.includes('reasonable') || lowerText.includes('mid-range')) {
            return 'PP';
        }
        return null;
    }
    /**
     * Extract social context from text
     */
    extractSocialContextFromText(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('date') || lowerText.includes('romantic') || lowerText.includes('couple') ||
            lowerText.includes('anniversary') || lowerText.includes('valentine')) {
            return 'with-bae';
        }
        else if (lowerText.includes('group') || lowerText.includes('friends') || lowerText.includes('barkada') ||
            lowerText.includes('family') || lowerText.includes('team')) {
            return 'barkada';
        }
        else if (lowerText.includes('alone') || lowerText.includes('solo') || lowerText.includes('by myself') ||
            lowerText.includes('working') || lowerText.includes('study')) {
            return 'solo';
        }
        return null;
    }
    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Set retry configuration
     */
    setRetryConfig(maxRetries, retryDelay) {
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }
}
exports.NLPService = NLPService;
// Export singleton instance
exports.nlpService = new NLPService();
//# sourceMappingURL=nlpService.js.map