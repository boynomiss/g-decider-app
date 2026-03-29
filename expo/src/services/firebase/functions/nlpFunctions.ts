import * as functions from 'firebase-functions';
import { Request, Response } from 'firebase-functions';

interface SentimentRequest {
  text: string;
}

interface SentimentResponse {
  success: boolean;
  sentiment?: {
    score: number;
    magnitude: number;
  };
  error?: string;
}

interface EntityRequest {
  text: string;
}

interface EntityResponse {
  success: boolean;
  entities?: Array<{
    name: string;
    type: string;
    salience: number;
  }>;
  error?: string;
}

interface TextAnalysisRequest {
  text: string;
  analysisType: 'sentiment' | 'entities' | 'both';
}

interface TextAnalysisResponse {
  success: boolean;
  sentiment?: {
    score: number;
    magnitude: number;
  };
  entities?: Array<{
    name: string;
    type: string;
    salience: number;
  }>;
  error?: string;
}

interface MoodAnalysisRequest {
  text: string;
  context?: string;
}

interface MoodAnalysisResponse {
  success: boolean;
  mood?: {
    score: number;
    label: string;
    confidence: number;
  };
  error?: string;
}

interface PlacePreferencesRequest {
  text: string;
  placeTypes?: string[];
}

interface PlacePreferencesResponse {
  success: boolean;
  preferences?: {
    categories: string[];
    mood: string;
    budget: string;
    socialContext: string;
  };
  error?: string;
}

export const analyzeSentiment = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  try {
    const { text } = req.body as SentimentRequest;
    
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
    } as SentimentResponse);

  } catch (error) {
    console.error('❌ Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as SentimentResponse);
  }
});

export const analyzeEntities = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  try {
    const { text } = req.body as EntityRequest;
    
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
    } as EntityResponse);

  } catch (error) {
    console.error('❌ Entity analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as EntityResponse);
  }
});

export const analyzeText = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  try {
    const { text, analysisType } = req.body as TextAnalysisRequest;
    
    if (!text) {
      res.status(400).json({ success: false, error: 'Text is required' });
      return;
    }

    console.log('🔍 Analyzing text:', text.substring(0, 50) + '...', 'Type:', analysisType);
    
    const response: TextAnalysisResponse = {
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

  } catch (error) {
    console.error('❌ Text analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as TextAnalysisResponse);
  }
});

export const analyzeUserMood = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  try {
    const { text } = req.body as MoodAnalysisRequest;
    
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
    } as MoodAnalysisResponse);

  } catch (error) {
    console.error('❌ Mood analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as MoodAnalysisResponse);
  }
});

export const extractPlacePreferences = functions.region('asia-southeast1').https.onRequest(async (req: Request, res: Response) => {
  try {
    const { text } = req.body as PlacePreferencesRequest;
    
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
    } as PlacePreferencesResponse);

  } catch (error) {
    console.error('❌ Preference extraction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as PlacePreferencesResponse);
  }
}); 