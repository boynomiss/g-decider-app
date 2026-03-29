#!/usr/bin/env node

/**
 * Google Cloud Authentication Server Helper
 * 
 * This script generates access tokens for Google Cloud APIs using service account credentials.
 * Since React Native can't directly use service account JSON files, we use this server-side
 * approach to generate access tokens that can be used with REST API calls.
 * 
 * Usage:
 *   node utils/google-auth-server.js
 * 
 * This will generate an access token that can be used for Google Cloud Natural Language API calls.
 */

const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

// Load service account credentials
const NLP_CREDENTIALS_FILE = './nlp-service-account.json';
const GEMINI_CREDENTIALS_FILE = './functions/gemini-api-client-key.json';

// Try to load NLP service account first, then Gemini
let credentials;
if (fs.existsSync(NLP_CREDENTIALS_FILE)) {
  credentials = JSON.parse(fs.readFileSync(NLP_CREDENTIALS_FILE, 'utf8'));
  console.log('✅ Using NLP service account credentials');
} else if (fs.existsSync(GEMINI_CREDENTIALS_FILE)) {
  credentials = JSON.parse(fs.readFileSync(GEMINI_CREDENTIALS_FILE, 'utf8'));
  console.log('✅ Using Gemini service account credentials');
} else {
  console.error('❌ Service account credentials file not found');
  console.log('Please ensure you have either nlp-service-account.json or functions/gemini-api-client-key.json in the project.');
  process.exit(1);
}

/**
 * Generate a JWT token for Google Cloud authentication
 */
function generateJWT() {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: expiry
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  // Sign with private key
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(credentials.private_key, 'base64url');
  
  return `${signatureInput}.${signature}`;
}

/**
 * Exchange JWT for access token
 */
function getAccessToken() {
  return new Promise((resolve, reject) => {
    const jwt = generateJWT();
    
    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('No access token in response: ' + data));
          }
        } catch {
          reject(new Error('Failed to parse response: ' + data));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request failed:', error);
      reject(new Error('Request failed'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Test the Natural Language API with the generated token
 */
async function testNaturalLanguageAPI(accessToken) {
  return new Promise((resolve, reject) => {
    const testData = JSON.stringify({
      document: {
        content: 'This restaurant has amazing food and great service!',
        type: 'PLAIN_TEXT'
      }
    });

    const options = {
      hostname: 'language.googleapis.com',
      port: 443,
      path: '/v1/documents:analyzeSentiment',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch {
          reject(new Error('Failed to parse response: ' + data));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request failed:', error);
      reject(new Error('Request failed'));
    });

    req.write(testData);
    req.end();
  });
}

/**
 * Main function
 */
async function main() {
  console.log('🔐 Google Cloud Authentication Helper\n');
  
  try {
    console.log('📋 Service Account Info:');
    console.log(`   Project ID: ${credentials.project_id}`);
    console.log(`   Client Email: ${credentials.client_email}`);
    console.log(`   Private Key ID: ${credentials.private_key_id}\n`);
    
    console.log('🔑 Generating access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token generated successfully!\n');
    
    console.log('🧠 Testing Natural Language API...');
    const result = await testNaturalLanguageAPI(accessToken);
    
    if (result.documentSentiment) {
      const score = result.documentSentiment.score;
      const magnitude = result.documentSentiment.magnitude;
      console.log(`✅ API Test Successful!`);
      console.log(`   Sentiment Score: ${score.toFixed(2)}`);
      console.log(`   Magnitude: ${magnitude.toFixed(2)}\n`);
      
      console.log('🎉 Google Cloud Natural Language API is working correctly!');
      console.log('\n📝 To use this in your React Native app:');
      console.log('1. Set up a backend service to generate access tokens');
      console.log('2. Use the access token with Bearer authentication in API calls');
      console.log('3. Refresh tokens before they expire (1 hour)');
      
    } else {
      console.log('❌ API test failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getAccessToken, testNaturalLanguageAPI };