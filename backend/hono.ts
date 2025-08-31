import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /api/trpc
app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`tRPC Error on ${path}:`, error);
    },
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Test endpoint for debugging
app.post("/test", async (c) => {
  try {
    const body = await c.req.json();
    return c.json({ 
      status: "ok", 
      message: "Test endpoint working", 
      receivedBody: body,
      contentType: c.req.header("content-type")
    });
  } catch (error) {
    return c.json({ 
      status: "error", 
      message: "Failed to parse body", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Environment variables test endpoint
app.get("/test-env", (c) => {
  return c.json({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ? "✅ Set" : "❌ Missing",
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI || "❌ Missing",
    allEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE'))
  });
});

// Simple spreadsheet creation endpoint (bypassing tRPC)
app.post("/create-spreadsheet", async (c) => {
  try {
    const body = await c.req.json();
    const { title, collections } = body;
    
    if (!title || !collections) {
      return c.json({ 
        success: false, 
        message: "Missing title or collections" 
      });
    }
    
    // Import Google Sheets API
    const { google } = await import('googleapis');
    const SCOPES = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ];
    
    const auth = new google.auth.GoogleAuth({
      keyFile: './google-service-account.json',
      scopes: SCOPES,
    });
    
    // Test authentication first
    const authClient = await auth.getClient();
    const projectId = await auth.getProjectId();
    
    console.log('✅ Authentication successful');
    console.log('📁 Project ID:', projectId);
    console.log('🔑 Scopes:', SCOPES);
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Test API access first
    try {
      await sheets.spreadsheets.get({ spreadsheetId: 'test' });
    } catch (error: any) {
      if (error.code === 404) {
        console.log('✅ Google Sheets API is accessible (404 is expected for non-existent spreadsheet)');
      } else {
        console.log('❌ Google Sheets API access test failed:', error.code, error.message);
        return c.json({ 
          success: false, 
          message: `API access test failed: ${error.code} - ${error.message}`,
          details: 'This usually means the Google Sheets API is not enabled or the service account lacks permissions'
        });
      }
    }

    // Test Drive API access
    try {
      const drive = google.drive({ version: 'v3', auth });
      await drive.files.list({ pageSize: 1 });
      console.log('✅ Google Drive API is accessible');
    } catch (error: any) {
      console.log('❌ Google Drive API access test failed:', error.code, error.message);
      return c.json({ 
        success: false, 
        message: `Drive API access test failed: ${error.code} - ${error.message}`,
        details: 'This usually means the Google Drive API is not enabled or the service account lacks permissions'
      });
    }
    
    // Create new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: collections.map((collection: string) => ({
          properties: {
            title: collection,
            gridProperties: {
              rowCount: 1000,
              columnCount: 26
            }
          }
        }))
      }
    });
    
    const newSpreadsheetId = spreadsheet.data.spreadsheetId;
    
    return c.json({ 
      success: true, 
      spreadsheetId: newSpreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`,
      message: 'Spreadsheet created successfully'
    });
    
  } catch (error: any) {
    console.error('Error creating spreadsheet:', error);
    
    // Provide more specific error information
    let errorMessage = 'Unknown error occurred';
    let errorDetails = '';
    
    if (error.code === 403) {
      errorMessage = 'Permission denied - Service account lacks necessary permissions';
      errorDetails = 'The service account needs: Google Sheets API enabled + Editor role + Service Account Token Creator role';
    } else if (error.code === 503) {
      errorMessage = 'Google Sheets API service unavailable';
      errorDetails = 'The Google Sheets API may not be enabled for this project';
    } else if (error.code === 401) {
      errorMessage = 'Authentication failed';
      errorDetails = 'Check service account key file and permissions';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return c.json({ 
      success: false, 
      message: errorMessage,
      details: errorDetails,
      errorCode: error.code || 'unknown'
    });
  }
});

// OAuth 2.0 endpoints for Google authentication
app.get("/auth/google", (c) => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ');
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  return c.redirect(authUrl);
});

app.get("/auth/callback", async (c) => {
  const code = c.req.query('code');
  
  if (!code) {
    return c.redirect('http://localhost:3000/admin?error=no_code');
  }
  
  try {
    const { google } = await import('googleapis');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Redirect to admin panel with tokens as URL parameters
    const adminPanelUrl = `http://localhost:3000/admin?` +
      `success=true&` +
      `access_token=${encodeURIComponent(tokens.access_token || '')}&` +
      `refresh_token=${encodeURIComponent(tokens.refresh_token || '')}&` +
      `scope=${encodeURIComponent(tokens.scope || '')}`;
    
    return c.redirect(adminPanelUrl);
    
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    return c.redirect(`http://localhost:3000/admin?error=auth_failed&details=${encodeURIComponent(error.message)}`);
  }
});

// OAuth-based spreadsheet creation endpoint
app.post("/create-spreadsheet-oauth", async (c) => {
  try {
    const body = await c.req.json();
    const { title, collections, accessToken } = body;
    
    console.log('🔑 OAuth endpoint received request:', {
      title,
      collections,
      hasAccessToken: !!accessToken,
      tokenLength: accessToken ? accessToken.length : 0,
      tokenStart: accessToken ? accessToken.substring(0, 20) + '...' : 'NO TOKEN'
    });
    
    if (!title || !collections || !accessToken) {
      return c.json({ 
        success: false, 
        message: "Missing title, collections, or access token" 
      });
    }
    
    const { google } = await import('googleapis');
    
         const oauth2Client = new google.auth.OAuth2(
       process.env.GOOGLE_OAUTH_CLIENT_ID,
       process.env.GOOGLE_OAUTH_CLIENT_SECRET,
       process.env.GOOGLE_OAUTH_REDIRECT_URI
     );
    
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    // Create new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: collections.map((collection: string) => ({
          properties: {
            title: collection,
            gridProperties: {
              rowCount: 1000,
              columnCount: 26
            }
          }
        }))
      }
    });
    
    const newSpreadsheetId = spreadsheet.data.spreadsheetId;
    
         return c.json({ 
       success: true, 
       spreadsheetId: newSpreadsheetId,
       spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`,
       message: 'Spreadsheet created successfully using OAuth'
     });
    
  } catch (error: any) {
    console.error('❌ OAuth spreadsheet creation error:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to create spreadsheet';
    let errorDetails = '';
    let errorCode = error.code || 'unknown';
    
    if (error.code === 403) {
      errorMessage = 'Permission denied - OAuth token lacks necessary permissions';
      errorDetails = 'The OAuth token needs: Google Sheets API access + Drive file access. Try re-authenticating.';
    } else if (error.code === 401) {
      errorMessage = 'Authentication failed - OAuth token expired or invalid';
      errorDetails = 'Please re-authenticate with Google to get a fresh token.';
    } else if (error.code === 503) {
      errorMessage = 'Google Sheets API service unavailable';
      errorDetails = 'The Google Sheets API may not be enabled for this project.';
    } else if (error.message) {
      errorDetails = error.message;
    }
    
    return c.json({ 
      success: false, 
      message: errorMessage,
      details: errorDetails,
      errorCode: errorCode
    });
  }
});

// Admin Panel Routes - Full admin interface
app.get("/admin", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>G-Decider Admin Panel</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { max-width: 1400px; margin: 0 auto; padding: 20px; }
            .spreadsheet-manager { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .tabs { display: flex; background: white; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
            .tab { flex: 1; padding: 16px; text-align: center; cursor: pointer; border-bottom: 2px solid transparent; }
            .tab.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: 600; }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
            .button { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin: 8px; }
            .button:hover { background: #2563eb; }
            .button:disabled { background: #9ca3af; cursor: not-allowed; }
            .collection-selector { margin: 20px 0; }
            .collection-button { background: white; border: 2px solid #e5e7eb; padding: 16px; margin: 8px; border-radius: 8px; cursor: pointer; display: inline-block; min-width: 120px; text-align: center; }
            .collection-button.active { border-color: #3b82f6; background: #eff6ff; }
            .info-card { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .warning-card { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .features-list { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>G-Decider Admin Panel</h1>
            <p>Manage your Firebase database with Google Sheets integration</p>
        </div>
        <div class="content">
            <div class="spreadsheet-manager">
                <div class="tabs">
                    <div class="tab active" onclick="switchTab('sync')">Sync Data</div>
                    <div class="tab" onclick="switchTab('view')">View Data</div>
                    <div class="tab" onclick="switchTab('create')">Create New</div>
                </div>

                <div id="sync-tab" class="tab-content active">
                    <h2>Sync Firebase Data to Google Sheets</h2>
                    
                    <div class="collection-selector">
                        <h3>Select Collection:</h3>
                        <div>
                            <div class="collection-button active" onclick="selectCollection('places')">
                                <strong>Places</strong><br>
                                <small>Restaurants, activities, and venues</small>
                            </div>
                            <div class="collection-button" onclick="selectCollection('users')">
                                <strong>Users</strong><br>
                                <small>User accounts and preferences</small>
                            </div>
                            <div class="collection-button" onclick="selectCollection('analytics')">
                                <strong>Analytics</strong><br>
                                <small>User behavior and app metrics</small>
                            </div>
                            <div class="collection-button" onclick="selectCollection('partnerships')">
                                <strong>Partnerships</strong><br>
                                <small>Business partnerships and fees</small>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button class="button" onclick="syncToSheets()" id="sync-button">Sync to Google Sheets</button>
                        <button class="button" onclick="updateFromSheets()" id="update-button">Update from Google Sheets</button>
                    </div>

                    <div id="sync-info" class="info-card" style="display: none;">
                        <h3>Current Spreadsheet</h3>
                        <p id="spreadsheet-title"></p>
                        <p id="spreadsheet-sheets"></p>
                        <button class="button" onclick="openSpreadsheet()">Open in Google Sheets</button>
                    </div>
                </div>

                <div id="view-tab" class="tab-content">
                    <h2>View Spreadsheet Data</h2>
                    <p>View and analyze your data directly from Google Sheets. This provides a familiar spreadsheet interface for data analysis, filtering, and reporting.</p>
                    
                    <div id="view-info" class="info-card" style="display: none;">
                        <h3>Available Data</h3>
                        <p id="view-spreadsheet-title"></p>
                        <p id="view-spreadsheet-sheets"></p>
                        <button class="button" onclick="openSpreadsheet()">Open Spreadsheet</button>
                    </div>
                    
                    <div id="view-warning" class="warning-card" style="display: none;">
                        <h3>No spreadsheet configured</h3>
                        <p>Create a new spreadsheet first, or configure an existing one in your environment variables.</p>
                    </div>
                </div>

                <div id="create-tab" class="tab-content">
                    <h2>Create New Google Sheets Database</h2>
                    <p>This will create a new Google Sheets spreadsheet with separate sheets for each collection. Each sheet will be pre-populated with the correct column headers based on your Firebase data structure.</p>

                    <button class="button" onclick="createSpreadsheet()" id="create-button">Create New Spreadsheet</button>

                    <div class="features-list">
                        <h3>Features:</h3>
                        <p>• Separate sheet for each collection</p>
                        <p>• Pre-configured column headers</p>
                        <p>• Real-time sync with Firebase</p>
                        <p>• Excel-like editing experience</p>
                        <p>• Collaborative editing</p>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            let selectedCollection = 'places';
            let currentSpreadsheet = null;

            function switchTab(tabName) {
                // Hide all tabs
                document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
                document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                
                // Show selected tab
                document.getElementById(tabName + '-tab').style.display = 'block';
                event.target.classList.add('active');
                
                // Load data for view tab
                if (tabName === 'view') {
                    loadSpreadsheetInfo();
                }
            }

            function selectCollection(collection) {
                selectedCollection = collection;
                document.querySelectorAll('.collection-button').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
            }

            async function syncToSheets() {
                const button = document.getElementById('sync-button');
                button.disabled = true;
                button.textContent = 'Syncing...';
                
                try {
                    const response = await fetch('/api/trpc/spreadsheet.syncToSheets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            input: {
                                spreadsheetId: 'test',
                                collection: selectedCollection,
                                sheetName: selectedCollection
                            }
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.result?.data?.success) {
                        alert('Success: ' + result.result.data.message);
                        loadSpreadsheetInfo();
                    } else {
                        alert('Error: ' + (result.result?.data?.message || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: Failed to sync data to Google Sheets');
                } finally {
                    button.disabled = false;
                    button.textContent = 'Sync to Google Sheets';
                }
            }

            async function updateFromSheets() {
                const button = document.getElementById('update-button');
                button.disabled = true;
                button.textContent = 'Updating...';
                
                try {
                    const response = await fetch('/api/trpc/spreadsheet.updateFromSheets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            input: {
                                spreadsheetId: 'test',
                                collection: selectedCollection,
                                sheetName: selectedCollection
                            }
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.result?.data?.success) {
                        alert('Success: ' + result.result.data.message);
                    } else {
                        alert('Error: ' + (result.result?.data?.message || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: Failed to update data from Google Sheets');
                } finally {
                    button.disabled = false;
                    button.textContent = 'Update from Google Sheets';
                }
            }

            async function createSpreadsheet() {
                const button = document.getElementById('create-button');
                button.disabled = true;
                button.textContent = 'Creating...';
                
                try {
                    const response = await fetch('/create-spreadsheet', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: 'G-Decider Database',
                            collections: ['places', 'users', 'analytics', 'partnerships']
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('Spreadsheet Created! Your new spreadsheet is ready.');
                        currentSpreadsheet = result;
                        loadSpreadsheetInfo();
                    } else {
                        alert('Error: ' + (result.message || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: Failed to create spreadsheet');
                } finally {
                    button.disabled = false;
                    button.textContent = 'Create New Spreadsheet';
                }
            }

            async function loadSpreadsheetInfo() {
                try {
                    const response = await fetch('/api/trpc/spreadsheet.getSpreadsheetInfo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            input: {
                                spreadsheetId: 'test'
                            }
                        })
                    });
                    const result = await response.json();
                    
                    if (result.result?.data?.success) {
                        currentSpreadsheet = result.result.data;
                        showSpreadsheetInfo();
                    } else {
                        showNoSpreadsheetWarning();
                    }
                } catch (error) {
                    showNoSpreadsheetWarning();
                }
            }

            function showSpreadsheetInfo() {
                document.getElementById('sync-info').style.display = 'block';
                document.getElementById('view-info').style.display = 'block';
                document.getElementById('view-warning').style.display = 'none';
                
                document.getElementById('spreadsheet-title').textContent = 'Title: ' + currentSpreadsheet.title;
                document.getElementById('spreadsheet-sheets').textContent = 'Sheets: ' + currentSpreadsheet.sheetNames.join(', ');
                
                document.getElementById('view-spreadsheet-title').textContent = 'Spreadsheet: ' + currentSpreadsheet.title;
                document.getElementById('view-spreadsheet-sheets').textContent = 'Sheets: ' + currentSpreadsheet.sheetNames.join(', ');
            }

            function showNoSpreadsheetWarning() {
                document.getElementById('sync-info').style.display = 'none';
                document.getElementById('view-info').style.display = 'none';
                document.getElementById('view-warning').style.display = 'block';
            }

            function openSpreadsheet() {
                if (currentSpreadsheet?.spreadsheetUrl) {
                    window.open(currentSpreadsheet.spreadsheetUrl, '_blank');
                }
            }

            // Load initial data
            loadSpreadsheetInfo();
        </script>
    </body>
    </html>
  `);
});

app.get("/demo-admin", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demo Admin Panel - Featured Places</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; margin: -20px -20px 20px -20px; text-align: center; }
            .content { max-width: 1200px; margin: 0 auto; }
            .admin-panel { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Demo Admin Panel</h1>
            <p>Same functionality as main admin - for testing and demonstration</p>
        </div>
        <div class="content">
            <div class="admin-panel">
                <h2>Demo Admin Panel Test</h2>
                <p>✅ Backend server is running successfully!</p>
                <p>Current time: <span id="time"></span></p>
                <p>Next step: Integrate the full AdminPanel component with Firebase</p>
            </div>
        </div>
        <script>
            document.getElementById('time').textContent = new Date().toLocaleString();
        </script>
    </body>
    </html>
  `);
});

app.get("/spreadsheet-manager", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spreadsheet Database Manager - G-Decider</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { max-width: 1400px; margin: 0 auto; padding: 20px; }
            .spreadsheet-manager { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .tabs { display: flex; background: white; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
            .tab { flex: 1; padding: 16px; text-align: center; cursor: pointer; border-bottom: 2px solid transparent; }
            .tab.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: 600; }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
            .button { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin: 8px; }
            .button:hover { background: #2563eb; }
            .button:disabled { background: #9ca3af; cursor: not-allowed; }
            .collection-selector { margin: 20px 0; }
            .collection-button { background: white; border: 2px solid #e5e7eb; padding: 16px; margin: 8px; border-radius: 8px; cursor: pointer; display: inline-block; min-width: 120px; text-align: center; }
            .collection-button.active { border-color: #3b82f6; background: #eff6ff; }
            .info-card { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .warning-card { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .features-list { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Spreadsheet Database Manager</h1>
            <p>Manage your Firebase database with Google Sheets integration</p>
        </div>
        <div class="content">
            <div class="spreadsheet-manager">
                <div class="tabs">
                    <div class="tab active" onclick="switchTab('sync')">Sync Data</div>
                    <div class="tab" onclick="switchTab('view')">View Data</div>
                    <div class="tab" onclick="switchTab('create')">Create New</div>
                </div>

                <div id="sync-tab" class="tab-content active">
                    <h2>Sync Firebase Data to Google Sheets</h2>
                    
                    <div class="collection-selector">
                        <h3>Select Collection:</h3>
                        <div>
                            <div class="collection-button active" onclick="selectCollection('places')">
                                <strong>Places</strong><br>
                                <small>Restaurants, activities, and venues</small>
                            </div>
                            <div class="collection-button" onclick="selectCollection('users')">
                                <strong>Users</strong><br>
                                <small>User accounts and preferences</small>
                            </div>
                            <div class="collection-button" onclick="selectCollection('analytics')">
                                <strong>Analytics</strong><br>
                                <small>User behavior and app metrics</small>
                            </div>
                            <div class="collection-button" onclick="selectCollection('partnerships')">
                                <strong>Partnerships</strong><br>
                                <small>Business partnerships and fees</small>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button class="button" onclick="syncToSheets()" id="sync-button">Sync to Google Sheets</button>
                        <button class="button" onclick="updateFromSheets()" id="update-button">Update from Google Sheets</button>
                    </div>

                    <div id="sync-info" class="info-card" style="display: none;">
                        <h3>Current Spreadsheet</h3>
                        <p id="spreadsheet-title"></p>
                        <p id="spreadsheet-sheets"></p>
                        <button class="button" onclick="openSpreadsheet()">Open in Google Sheets</button>
                    </div>
                </div>

                <div id="view-tab" class="tab-content">
                    <h2>View Spreadsheet Data</h2>
                    <p>View and analyze your data directly from Google Sheets. This provides a familiar spreadsheet interface for data analysis, filtering, and reporting.</p>
                    
                    <div id="view-info" class="info-card" style="display: none;">
                        <h3>Available Data</h3>
                        <p id="view-spreadsheet-title"></p>
                        <p id="view-spreadsheet-sheets"></p>
                        <button class="button" onclick="openSpreadsheet()">Open Spreadsheet</button>
                    </div>
                    
                    <div id="view-warning" class="warning-card" style="display: none;">
                        <h3>No spreadsheet configured</h3>
                        <p>Create a new spreadsheet first, or configure an existing one in your environment variables.</p>
                    </div>
                </div>

                <div id="create-tab" class="tab-content">
                    <h2>Create New Google Sheets Database</h2>
                    <p>This will create a new Google Sheets spreadsheet with separate sheets for each collection. Each sheet will be pre-populated with the correct column headers based on your Firebase data structure.</p>

                    <button class="button" onclick="createSpreadsheet()" id="create-button">Create New Spreadsheet</button>

                    <div class="features-list">
                        <h3>Features:</h3>
                        <p>• Separate sheet for each collection</p>
                        <p>• Pre-configured column headers</p>
                        <p>• Real-time sync with Firebase</p>
                        <p>• Excel-like editing experience</p>
                        <p>• Collaborative editing</p>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            let selectedCollection = 'places';
            let currentSpreadsheet = null;

            function switchTab(tabName) {
                // Hide all tabs
                document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
                document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                
                // Show selected tab
                document.getElementById(tabName + '-tab').style.display = 'block';
                event.target.classList.add('active');
                
                // Load data for view tab
                if (tabName === 'view') {
                    loadSpreadsheetInfo();
                }
            }

            function selectCollection(collection) {
                selectedCollection = collection;
                document.querySelectorAll('.collection-button').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
            }

            async function syncToSheets() {
                const button = document.getElementById('sync-button');
                button.disabled = true;
                button.textContent = 'Syncing...';
                
                try {
                    const response = await fetch('/api/trpc/spreadsheet.syncToSheets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            collection: selectedCollection,
                            sheetName: selectedCollection
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.result?.data?.success) {
                        alert('Success: ' + result.result.data.message);
                        loadSpreadsheetInfo();
                    } else {
                        alert('Error: ' + (result.result?.data?.message || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: Failed to sync data to Google Sheets');
                } finally {
                    button.disabled = false;
                    button.textContent = 'Sync to Google Sheets';
                }
            }

            async function updateFromSheets() {
                const button = document.getElementById('update-button');
                button.disabled = true;
                button.textContent = 'Updating...';
                
                try {
                    const response = await fetch('/api/trpc/spreadsheet.updateFromSheets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            collection: selectedCollection,
                            sheetName: selectedCollection
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.result?.data?.success) {
                        alert('Success: ' + result.result.data.message);
                    } else {
                        alert('Error: ' + (result.result?.data?.message || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: Failed to update data from Google Sheets');
                } finally {
                    button.disabled = false;
                    button.textContent = 'Update from Google Sheets';
                }
            }

            async function createSpreadsheet() {
                const button = document.getElementById('create-button');
                button.disabled = true;
                button.textContent = 'Creating...';
                
                try {
                    const response = await fetch('/api/trpc/spreadsheet.createSpreadsheet', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: 'G-Decider Database',
                            collections: ['places', 'users', 'analytics', 'partnerships']
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.result?.data?.success) {
                        alert('Spreadsheet Created! Your new spreadsheet is ready.');
                        currentSpreadsheet = result.result.data;
                        loadSpreadsheetInfo();
                    } else {
                        alert('Error: ' + (result.result?.data?.message || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: Failed to create spreadsheet');
                } finally {
                    button.disabled = false;
                    button.textContent = 'Create New Spreadsheet';
                }
            }

            async function loadSpreadsheetInfo() {
                try {
                    const response = await fetch('/api/trpc/spreadsheet.getSpreadsheetInfo');
                    const result = await response.json();
                    
                    if (result.result?.data?.success) {
                        currentSpreadsheet = result.result.data;
                        showSpreadsheetInfo();
                    } else {
                        showNoSpreadsheetWarning();
                    }
                } catch (error) {
                    showNoSpreadsheetWarning();
                }
            }

            function showSpreadsheetInfo() {
                document.getElementById('sync-info').style.display = 'block';
                document.getElementById('view-info').style.display = 'block';
                document.getElementById('view-warning').style.display = 'none';
                
                document.getElementById('spreadsheet-title').textContent = 'Title: ' + currentSpreadsheet.title;
                document.getElementById('spreadsheet-sheets').textContent = 'Sheets: ' + currentSpreadsheet.sheetNames.join(', ');
                
                document.getElementById('view-spreadsheet-title').textContent = 'Spreadsheet: ' + currentSpreadsheet.title;
                document.getElementById('view-spreadsheet-sheets').textContent = 'Sheets: ' + currentSpreadsheet.sheetNames.join(', ');
            }

            function showNoSpreadsheetWarning() {
                document.getElementById('sync-info').style.display = 'none';
                document.getElementById('view-info').style.display = 'none';
                document.getElementById('view-warning').style.display = 'block';
            }

            function openSpreadsheet() {
                if (currentSpreadsheet?.spreadsheetUrl) {
                    window.open(currentSpreadsheet.spreadsheetUrl, '_blank');
                }
            }

            // Load initial data
            loadSpreadsheetInfo();
        </script>
    </body>
    </html>
  `);
});

export default app;