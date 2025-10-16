/**
 * Google Apps Script for Loading Slack Webhook URL
 * 
 * This lightweight script only loads the Slack webhook URL from a "Secret" tab
 * in the Google Sheet. This keeps the webhook URL secure and out of GitHub.
 * 
 * Setup Instructions:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Make sure your Google Sheet has a "Secret" tab with the webhook URL in cell A1
 * 5. Deploy as a web app with execute permissions for "Anyone"
 * 6. Copy the web app URL to use in config.prod.js
 */

// Replace this with your Google Sheet ID (found in the URL)
const SHEET_ID = '19sspNrLcvU68k0BYurY5RjeZRE1iHMo-6ZIYNbBXIU';

// Sheet name for the secret tab
const SECRET_SHEET_NAME = 'Secret';

function doGet(e) {
  try {
    // Check if this is a request for the Slack webhook
    if (e.parameter && e.parameter.action === 'getSlackWebhook') {
      return getSlackWebhook();
    }
    
    // Default response
    return ContentService
      .createTextOutput('Slack Webhook Loader API is running')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    console.error('doGet Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSlackWebhook() {
  try {
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    
    // Get the Secret sheet
    const secretSheet = spreadsheet.getSheetByName(SECRET_SHEET_NAME);
    
    if (!secretSheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'Secret sheet not found. Please create a "Secret" tab in your Google Sheet.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the webhook URL from cell A1
    const webhookUrl = secretSheet.getRange('A1').getValue();
    
    if (!webhookUrl || webhookUrl === '') {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false, 
          error: 'No webhook URL found in cell A1 of the Secret sheet.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Return the webhook URL
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        webhookUrl: webhookUrl.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('getSlackWebhook Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
