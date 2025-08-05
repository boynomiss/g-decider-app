/**
 * Comprehensive NLP Service Integration Test
 * 
 * This test verifies the complete NLP service integration including:
 * - Sentiment Analysis
 * - Entity Analysis  
 * - User Mood Analysis
 * - Place Preferences Extraction
 * - Error Handling
 * - Performance Metrics
 * - Fallback Mechanisms
 */

const fetch = require('node-fetch');

const FIREBASE_FUNCTIONS_BASE_URL = 'https://asia-southeast1-g-decider-backend.cloudfunctions.net';

class NLPServiceIntegrationTest {
  constructor() {
    this.results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      performanceMetrics: [],
      errors: []
    };
  }

  async testSentimentAnalysis() {
    console.log('\n🧠 Testing Sentiment Analysis...');
    
    const testCases = [
      {
        name: 'Positive Restaurant Review',
        text: 'I absolutely love this amazing restaurant! The food is incredible and the atmosphere is perfect for a romantic date night.',
        expectedSentiment: 'positive'
      },
      {
        name: 'Negative Restaurant Review',
        text: 'This place is terrible. The food was cold, service was slow, and the prices are way too expensive.',
        expectedSentiment: 'negative'
      },
      {
        name: 'Neutral Restaurant Review',
        text: 'The restaurant is okay. Food was decent, nothing special but not bad either.',
        expectedSentiment: 'neutral'
      },
      {
        name: 'Mixed Feelings',
        text: 'Great food but terrible service. The atmosphere is nice but too noisy.',
        expectedSentiment: 'mixed'
      }
    ];

    for (const testCase of testCases) {
      this.results.totalTests++;
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/analyzeSentiment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: testCase.text })
        });

        const processingTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const sentiment = data.data;
            const score = sentiment.score;
            
            // Determine actual sentiment
            let actualSentiment = 'neutral';
            if (score > 0.3) actualSentiment = 'positive';
            else if (score < -0.3) actualSentiment = 'negative';
            
            const passed = actualSentiment === testCase.expectedSentiment || 
                          (testCase.expectedSentiment === 'mixed' && Math.abs(score) < 0.3);
            
            if (passed) {
              this.results.passedTests++;
              console.log(`✅ ${testCase.name}: ${actualSentiment} (score: ${score.toFixed(3)}) - ${processingTime}ms`);
            } else {
              this.results.failedTests++;
              console.log(`❌ ${testCase.name}: Expected ${testCase.expectedSentiment}, got ${actualSentiment} (score: ${score.toFixed(3)})`);
            }
            
            this.results.performanceMetrics.push({
              test: testCase.name,
              processingTime,
              type: 'sentiment'
            });
            
          } else {
            this.results.failedTests++;
            console.log(`❌ ${testCase.name}: API returned error - ${data.error}`);
          }
        } else {
          this.results.failedTests++;
          const errorText = await response.text();
          console.log(`❌ ${testCase.name}: HTTP ${response.status} - ${errorText}`);
        }
      } catch (error) {
        this.results.failedTests++;
        console.log(`❌ ${testCase.name}: Network error - ${error.message}`);
        this.results.errors.push(error.message);
      }
    }
  }

  async testEntityAnalysis() {
    console.log('\n🏷️ Testing Entity Analysis...');
    
    const testCases = [
      {
        name: 'Restaurant Search Query',
        text: 'I want to find a romantic Italian restaurant in Makati for a date night with my partner.',
        expectedEntities: ['Italian', 'Makati', 'restaurant']
      },
      {
        name: 'Cafe Search Query',
        text: 'Looking for a cozy cafe with great coffee and wifi for working alone in Quezon City.',
        expectedEntities: ['cafe', 'Quezon City', 'coffee']
      },
      {
        name: 'Activity Search Query',
        text: 'Need recommendations for fun activities and attractions in Manila for a group of friends.',
        expectedEntities: ['Manila', 'activities', 'attractions']
      }
    ];

    for (const testCase of testCases) {
      this.results.totalTests++;
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/analyzeEntities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: testCase.text })
        });

        const processingTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const entities = data.data;
            const entityNames = entities.map(e => e.name);
            
            // Check if expected entities are found
            const foundEntities = testCase.expectedEntities.filter(expected => 
              entityNames.some(name => name.toLowerCase().includes(expected.toLowerCase()))
            );
            
            const foundPercentage = (foundEntities.length / testCase.expectedEntities.length) * 100;
            const passed = foundPercentage >= 50; // At least 50% of expected entities found
            
            if (passed) {
              this.results.passedTests++;
              console.log(`✅ ${testCase.name}: Found ${foundEntities.length}/${testCase.expectedEntities.length} entities (${foundPercentage.toFixed(1)}%) - ${processingTime}ms`);
            } else {
              this.results.failedTests++;
              console.log(`❌ ${testCase.name}: Found ${foundEntities.length}/${testCase.expectedEntities.length} entities (${foundPercentage.toFixed(1)}%)`);
            }
            
            this.results.performanceMetrics.push({
              test: testCase.name,
              processingTime,
              type: 'entities'
            });
            
          } else {
            this.results.failedTests++;
            console.log(`❌ ${testCase.name}: API returned error - ${data.error}`);
          }
        } else {
          this.results.failedTests++;
          const errorText = await response.text();
          console.log(`❌ ${testCase.name}: HTTP ${response.status} - ${errorText}`);
        }
      } catch (error) {
        this.results.failedTests++;
        console.log(`❌ ${testCase.name}: Network error - ${error.message}`);
        this.results.errors.push(error.message);
      }
    }
  }

  async testUserMoodAnalysis() {
    console.log('\n😊 Testing User Mood Analysis...');
    
    const testCases = [
      {
        name: 'Happy Mood',
        text: 'I am feeling really excited and happy today! Want to celebrate with friends at a fun restaurant.',
        expectedMood: 'high'
      },
      {
        name: 'Neutral Mood',
        text: 'Just looking for a place to eat. Nothing special, just need food.',
        expectedMood: 'neutral'
      },
      {
        name: 'Stressed Mood',
        text: 'I\'m feeling really stressed and tired. Need a quiet place to relax and eat.',
        expectedMood: 'low'
      },
      {
        name: 'Celebratory Mood',
        text: 'It\'s my birthday! I want to celebrate with an amazing dinner at a fancy restaurant!',
        expectedMood: 'high'
      }
    ];

    for (const testCase of testCases) {
      this.results.totalTests++;
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/analyzeUserMood`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: testCase.text })
        });

        const processingTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data !== undefined) {
            const moodScore = data.data;
            
            // Determine actual mood category
            let actualMood = 'neutral';
            if (moodScore > 70) actualMood = 'high';
            else if (moodScore < 30) actualMood = 'low';
            
            const passed = actualMood === testCase.expectedMood;
            
            if (passed) {
              this.results.passedTests++;
              console.log(`✅ ${testCase.name}: ${actualMood} mood (score: ${moodScore}) - ${processingTime}ms`);
            } else {
              this.results.failedTests++;
              console.log(`❌ ${testCase.name}: Expected ${testCase.expectedMood} mood, got ${actualMood} (score: ${moodScore})`);
            }
            
            this.results.performanceMetrics.push({
              test: testCase.name,
              processingTime,
              type: 'mood'
            });
            
          } else {
            this.results.failedTests++;
            console.log(`❌ ${testCase.name}: API returned error - ${data.error}`);
          }
        } else {
          this.results.failedTests++;
          const errorText = await response.text();
          console.log(`❌ ${testCase.name}: HTTP ${response.status} - ${errorText}`);
        }
      } catch (error) {
        this.results.failedTests++;
        console.log(`❌ ${testCase.name}: Network error - ${error.message}`);
        this.results.errors.push(error.message);
      }
    }
  }

  async testPlacePreferencesExtraction() {
    console.log('\n🎯 Testing Place Preferences Extraction...');
    
    const testCases = [
      {
        name: 'Budget Restaurant Search',
        text: 'I\'m looking for a cheap Korean restaurant for lunch with my barkada.',
        expectedPreferences: {
          budget: 'P',
          socialContext: 'barkada',
          categories: ['Korean', 'restaurant']
        }
      },
      {
        name: 'Luxury Date Search',
        text: 'I need a fancy Japanese restaurant for a romantic anniversary dinner. Budget is not an issue.',
        expectedPreferences: {
          budget: 'PPP',
          socialContext: 'with-bae',
          categories: ['Japanese', 'restaurant']
        }
      },
      {
        name: 'Solo Cafe Search',
        text: 'Looking for a quiet cafe to work alone. Need good wifi and coffee.',
        expectedPreferences: {
          budget: null,
          socialContext: 'solo',
          categories: ['cafe']
        }
      }
    ];

    for (const testCase of testCases) {
      this.results.totalTests++;
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/extractPlacePreferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: testCase.text })
        });

        const processingTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const preferences = data.data;
            let passed = true;
            let details = [];
            
            // Check budget
            if (testCase.expectedPreferences.budget) {
              if (preferences.budget === testCase.expectedPreferences.budget) {
                details.push(`budget: ${preferences.budget}`);
              } else {
                passed = false;
                details.push(`budget: expected ${testCase.expectedPreferences.budget}, got ${preferences.budget}`);
              }
            }
            
            // Check social context
            if (testCase.expectedPreferences.socialContext) {
              if (preferences.socialContext === testCase.expectedPreferences.socialContext) {
                details.push(`social: ${preferences.socialContext}`);
              } else {
                passed = false;
                details.push(`social: expected ${testCase.expectedPreferences.socialContext}, got ${preferences.socialContext}`);
              }
            }
            
            // Check categories (at least one should match)
            if (testCase.expectedPreferences.categories.length > 0) {
              const foundCategories = testCase.expectedPreferences.categories.filter(expected =>
                preferences.categories.some(cat => cat.toLowerCase().includes(expected.toLowerCase()))
              );
              if (foundCategories.length > 0) {
                details.push(`categories: ${foundCategories.join(', ')}`);
              } else {
                passed = false;
                details.push(`categories: none found from expected ${testCase.expectedPreferences.categories.join(', ')}`);
              }
            }
            
            if (passed) {
              this.results.passedTests++;
              console.log(`✅ ${testCase.name}: ${details.join(', ')} - ${processingTime}ms`);
            } else {
              this.results.failedTests++;
              console.log(`❌ ${testCase.name}: ${details.join(', ')}`);
            }
            
            this.results.performanceMetrics.push({
              test: testCase.name,
              processingTime,
              type: 'preferences'
            });
            
          } else {
            this.results.failedTests++;
            console.log(`❌ ${testCase.name}: API returned error - ${data.error}`);
          }
        } else {
          this.results.failedTests++;
          const errorText = await response.text();
          console.log(`❌ ${testCase.name}: HTTP ${response.status} - ${errorText}`);
        }
      } catch (error) {
        this.results.failedTests++;
        console.log(`❌ ${testCase.name}: Network error - ${error.message}`);
        this.results.errors.push(error.message);
      }
    }
  }

  async testErrorHandling() {
    console.log('\n🛡️ Testing Error Handling...');
    
    const errorTestCases = [
      {
        name: 'Empty Text',
        text: '',
        expectedError: true
      },
      {
        name: 'Very Long Text',
        text: 'A'.repeat(10000),
        expectedError: false // Should handle gracefully
      },
      {
        name: 'Special Characters',
        text: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        expectedError: false
      },
      {
        name: 'Non-English Text',
        text: '私はレストランを探しています。',
        expectedError: false
      }
    ];

    for (const testCase of errorTestCases) {
      this.results.totalTests++;
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/analyzeSentiment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: testCase.text })
        });

        const processingTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            if (!testCase.expectedError) {
              this.results.passedTests++;
              console.log(`✅ ${testCase.name}: Handled gracefully - ${processingTime}ms`);
            } else {
              this.results.failedTests++;
              console.log(`❌ ${testCase.name}: Should have failed but succeeded`);
            }
          } else {
            if (testCase.expectedError) {
              this.results.passedTests++;
              console.log(`✅ ${testCase.name}: Properly handled error - ${data.error}`);
            } else {
              this.results.failedTests++;
              console.log(`❌ ${testCase.name}: Unexpected error - ${data.error}`);
            }
          }
        } else {
          if (testCase.expectedError) {
            this.results.passedTests++;
            console.log(`✅ ${testCase.name}: HTTP error as expected`);
          } else {
            this.results.failedTests++;
            const errorText = await response.text();
            console.log(`❌ ${testCase.name}: Unexpected HTTP error - ${errorText}`);
          }
        }
      } catch (error) {
        this.results.failedTests++;
        console.log(`❌ ${testCase.name}: Network error - ${error.message}`);
        this.results.errors.push(error.message);
      }
    }
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    const performanceTests = [
      {
        name: 'Short Text Performance',
        text: 'Good restaurant.',
        expectedMaxTime: 2000
      },
      {
        name: 'Medium Text Performance',
        text: 'I want to find a nice Italian restaurant in Manila for dinner with friends. The food should be good and the atmosphere should be romantic.',
        expectedMaxTime: 3000
      },
      {
        name: 'Long Text Performance',
        text: 'I am looking for an amazing restaurant that serves delicious food with excellent service. The atmosphere should be perfect for a romantic date night. I want something special and memorable. The restaurant should be located in a nice area with good parking. The menu should have a variety of options including vegetarian dishes. The wine list should be extensive and the desserts should be homemade. I am willing to spend money for quality.',
        expectedMaxTime: 5000
      }
    ];

    for (const testCase of performanceTests) {
      this.results.totalTests++;
      
      try {
        const startTime = Date.now();
        const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/analyzeText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: testCase.text })
        });

        const processingTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            const passed = processingTime <= testCase.expectedMaxTime;
            
            if (passed) {
              this.results.passedTests++;
              console.log(`✅ ${testCase.name}: ${processingTime}ms (max: ${testCase.expectedMaxTime}ms)`);
            } else {
              this.results.failedTests++;
              console.log(`❌ ${testCase.name}: ${processingTime}ms (max: ${testCase.expectedMaxTime}ms) - TOO SLOW`);
            }
            
            this.results.performanceMetrics.push({
              test: testCase.name,
              processingTime,
              type: 'performance'
            });
            
          } else {
            this.results.failedTests++;
            console.log(`❌ ${testCase.name}: API error - ${data.error}`);
          }
        } else {
          this.results.failedTests++;
          const errorText = await response.text();
          console.log(`❌ ${testCase.name}: HTTP error - ${errorText}`);
        }
      } catch (error) {
        this.results.failedTests++;
        console.log(`❌ ${testCase.name}: Network error - ${error.message}`);
        this.results.errors.push(error.message);
      }
    }
  }

  generateReport() {
    console.log('\n📊 NLP Service Integration Test Report');
    console.log('=====================================');
    
    const successRate = (this.results.passedTests / this.results.totalTests) * 100;
    
    console.log(`📈 Test Results:`);
    console.log(`   Total Tests: ${this.results.totalTests}`);
    console.log(`   Passed: ${this.results.passedTests}`);
    console.log(`   Failed: ${this.results.failedTests}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    
    if (this.results.performanceMetrics.length > 0) {
      const avgProcessingTime = this.results.performanceMetrics.reduce((sum, metric) => sum + metric.processingTime, 0) / this.results.performanceMetrics.length;
      const maxProcessingTime = Math.max(...this.results.performanceMetrics.map(m => m.processingTime));
      const minProcessingTime = Math.min(...this.results.performanceMetrics.map(m => m.processingTime));
      
      console.log(`\n⚡ Performance Metrics:`);
      console.log(`   Average Processing Time: ${avgProcessingTime.toFixed(0)}ms`);
      console.log(`   Fastest Response: ${minProcessingTime}ms`);
      console.log(`   Slowest Response: ${maxProcessingTime}ms`);
    }
    
    if (this.results.errors.length > 0) {
      console.log(`\n❌ Errors Encountered:`);
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log(`\n🎯 Integration Status:`);
    if (successRate >= 90) {
      console.log(`   ✅ EXCELLENT - NLP Service integration is working perfectly`);
    } else if (successRate >= 75) {
      console.log(`   ✅ GOOD - NLP Service integration is working well with minor issues`);
    } else if (successRate >= 50) {
      console.log(`   ⚠️ FAIR - NLP Service integration has some issues that need attention`);
    } else {
      console.log(`   ❌ POOR - NLP Service integration has significant issues`);
    }
    
    return {
      successRate,
      totalTests: this.results.totalTests,
      passedTests: this.results.passedTests,
      failedTests: this.results.failedTests,
      performanceMetrics: this.results.performanceMetrics,
      errors: this.results.errors
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive NLP Service Integration Test\n');
    
    await this.testSentimentAnalysis();
    await this.testEntityAnalysis();
    await this.testUserMoodAnalysis();
    await this.testPlacePreferencesExtraction();
    await this.testErrorHandling();
    await this.testPerformance();
    
    return this.generateReport();
  }
}

// Run the comprehensive test
async function runNLPServiceIntegrationTest() {
  const tester = new NLPServiceIntegrationTest();
  const report = await tester.runAllTests();
  
  console.log('\n🎉 NLP Service Integration Test Complete!');
  return report;
}

// Export for use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runNLPServiceIntegrationTest, NLPServiceIntegrationTest };
}

// Run test if called directly
if (typeof window === 'undefined') {
  runNLPServiceIntegrationTest().catch(console.error);
} 