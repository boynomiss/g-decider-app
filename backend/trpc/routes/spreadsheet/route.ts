import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../../create-context';
import { google } from 'googleapis';
import { getFirestore } from '../../../firebase-admin';

// Google Sheets API setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Initialize Google Sheets API
const getGoogleSheets = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './google-service-account.json',
    scopes: SCOPES,
  });
  
  return google.sheets({ version: 'v4', auth });
};

export const spreadsheetRouter = createTRPCRouter({
  // Get all data from Firebase and sync to Google Sheets
  syncToSheets: publicProcedure
    .input(z.object({
      spreadsheetId: z.string(),
      collection: z.enum(['places', 'users', 'analytics', 'partnerships']),
      sheetName: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const { spreadsheetId, collection, sheetName = input.collection } = input;
        const db = getFirestore();
        const sheets = getGoogleSheets();

        // Fetch data from Firebase
        const snapshot = await db.collection(collection).get();
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (data.length === 0) {
          return { success: false, message: 'No data found in collection' };
        }

        // Prepare data for Google Sheets
        const headers = Object.keys(data[0]);
        const rows = data.map(item => 
          headers.map(header => {
            const value = item[header];
            if (Array.isArray(value)) {
              return value.join(', ');
            }
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value);
            }
            return value?.toString() || '';
          })
        );

        // Create or update sheet
        const range = `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}${rows.length + 1}`;
        
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers, ...rows]
          }
        });

        return { 
          success: true, 
          message: `Synced ${data.length} records to ${sheetName}`,
          recordCount: data.length
        };
      } catch (error) {
        console.error('Error syncing to Google Sheets:', error);
        return { success: false, message: error.message };
      }
    }),

  // Get data from Google Sheets
  getFromSheets: publicProcedure
    .input(z.object({
      spreadsheetId: z.string(),
      sheetName: z.string(),
      range: z.string().optional()
    }))
    .query(async ({ input }) => {
      try {
        const { spreadsheetId, sheetName, range = `${sheetName}!A:Z` } = input;
        const sheets = getGoogleSheets();

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range
        });

        const values = response.data.values;
        if (!values || values.length === 0) {
          return { success: false, message: 'No data found in sheet' };
        }

        // Parse headers and data
        const headers = values[0];
        const rows = values.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        return {
          success: true,
          headers,
          data: rows,
          rowCount: rows.length
        };
      } catch (error) {
        console.error('Error getting data from Google Sheets:', error);
        return { success: false, message: error.message };
      }
    }),

  // Update data in Google Sheets from Firebase
  updateFromSheets: publicProcedure
    .input(z.object({
      spreadsheetId: z.string(),
      collection: z.enum(['places', 'users', 'analytics', 'partnerships']),
      sheetName: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const { spreadsheetId, collection, sheetName = input.collection } = input;
        const db = getFirestore();
        const sheets = getGoogleSheets();

        // Get data from Google Sheets
        const sheetResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A:Z`
        });

        const values = sheetResponse.data.values;
        if (!values || values.length < 2) {
          return { success: false, message: 'No data found in sheet' };
        }

        const headers = values[0];
        const rows = values.slice(1);

        let updateCount = 0;
        for (const row of rows) {
          if (row[0]) { // Check if ID exists
            const docId = row[0];
            const docData: any = {};
            
            headers.forEach((header: string, index: number) => {
              if (index > 0 && row[index] !== undefined) { // Skip ID column
                docData[header] = row[index];
              }
            });

            try {
              await db.collection(collection).doc(docId).set(docData, { merge: true });
              updateCount++;
            } catch (error) {
              console.error(`Error updating document ${docId}:`, error);
            }
          }
        }

        return { 
          success: true, 
          message: `Updated ${updateCount} records in ${collection}`,
          updateCount
        };
      } catch (error) {
        console.error('Error updating from Google Sheets:', error);
        return { success: false, message: error.message };
      }
    }),

  // Create new Google Sheets spreadsheet using OAuth
  createSpreadsheet: publicProcedure
    .input(z.object({
      title: z.string(),
      collections: z.array(z.enum(['places', 'users', 'analytics', 'partnerships'])),
      accessToken: z.string().optional() // Make this optional for backward compatibility
    }))
    .mutation(async ({ input }) => {
      try {
        const { title, collections, accessToken } = input;
        
        // If accessToken is provided, use OAuth; otherwise fall back to service account
        let sheets;
        
        if (accessToken) {
          // Use OAuth method
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_OAUTH_CLIENT_ID,
            process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            process.env.GOOGLE_OAUTH_REDIRECT_URI
          );
          
          oauth2Client.setCredentials({ access_token: accessToken });
          sheets = google.sheets({ version: 'v4', auth: oauth2Client });
          
          console.log('🔑 Using OAuth method for spreadsheet creation');
        } else {
          // Fall back to service account method
          sheets = getGoogleSheets();
          console.log('🔑 Using service account method for spreadsheet creation');
        }

        // Create new spreadsheet
        const spreadsheet = await sheets.spreadsheets.create({
          requestBody: {
            properties: {
              title
            },
            sheets: collections.map(collection => ({
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

        // Initialize sheets with headers
        for (const collection of collections) {
          const db = getFirestore();
          const snapshot = await db.collection(collection).limit(1).get();
          
          if (!snapshot.empty) {
            const sampleDoc = snapshot.docs[0].data();
            const headers = Object.keys(sampleDoc);
            
            await sheets.spreadsheets.values.update({
              spreadsheetId: newSpreadsheetId,
              range: `${collection}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
              valueInputOption: 'RAW',
              requestBody: {
                values: [headers]
              }
            });
          }
        }

        return { 
          success: true, 
          spreadsheetId: newSpreadsheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`,
          message: 'Spreadsheet created successfully'
        };
      } catch (error) {
        console.error('Error creating spreadsheet:', error);
        return { success: false, message: error.message };
      }
    }),

  // Get spreadsheet info
  getSpreadsheetInfo: publicProcedure
    .input(z.object({
      spreadsheetId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const { spreadsheetId } = input;
        const sheets = getGoogleSheets();
        
        const response = await sheets.spreadsheets.get({
          spreadsheetId
        });

        const spreadsheet = response.data;
        const sheetNames = spreadsheet.sheets?.map(sheet => sheet.properties?.title) || [];

        return {
          success: true,
          title: spreadsheet.properties?.title,
          sheetNames,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
        };
      } catch (error) {
        console.error('Error getting spreadsheet info:', error);
        return { success: false, message: error.message };
      }
    })
});
