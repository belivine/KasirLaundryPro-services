import { google, sheets_v4 } from 'googleapis';
import * as dotenv from 'dotenv';

// Load environment variables from .env file (if not already loaded by Netlify)
dotenv.config();

// Retrieve and parse the service account credentials from environment variables
const keyFileContent = process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string;
if (!keyFileContent) {
  console.log("Error", "GOOGLE_SERVICE_ACCOUNT_KEY is not set");
}

let credentials: any;
try {
  credentials = JSON.parse(keyFileContent);
} catch (error) {
  console.log("Token", keyFileContent);
  console.log(error);
  credentials = keyFileContent;
}

// The spreadsheet ID from the provided URL
const SPREADSHEET_ID = '14tv3OZaPKVJp7Tl8X8J3U1z5UK4oq8NJxAtS-L_Em_Y';

// The range where you want to insert the row (adjust as needed)
const RANGE = 'Sheet1!A1';

/**
 * Inserts a new row into the specified spreadsheet.
 * @param {string[]} rowData The data to insert as a new row.
 */
export async function insertRow(rowData: string[]): Promise<void> {
  // Create Google Auth client
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // Get the Sheets API client
  const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData],
    },
  });
}
