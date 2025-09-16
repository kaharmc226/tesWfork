const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { google } = require('googleapis');

const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
const sheetRange = process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:B';

if (!serviceAccountEmail || !rawPrivateKey || !spreadsheetId) {
  throw new Error(
    'Missing Google Sheets configuration. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SPREADSHEET_ID in the .env file.'
  );
}

const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.JWT(serviceAccountEmail, null, privateKey, scopes);

let sheetsClient;

async function getSheetsClient() {
  if (!sheetsClient) {
    try {
      await auth.authorize();
      sheetsClient = google.sheets({ version: 'v4', auth });
      console.log('Connected to Google Sheets!');
    } catch (error) {
      console.error('Failed to initialize Google Sheets client:', error);
      throw error;
    }
  }
  return sheetsClient;
}

module.exports = {
  getSheetsClient,
  spreadsheetId,
  sheetRange,
};
