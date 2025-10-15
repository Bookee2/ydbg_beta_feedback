/**
 * Google Apps Script for YDBG App Beta Feedback Collection
 * 
 * This script receives feedback data from your website and stores it in a Google Sheet.
 * 
 * Setup Instructions:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Create a new Google Sheet for storing feedback
 * 5. Copy the Sheet ID from the URL
 * 6. Update the SHEET_ID variable below
 * 7. Deploy as a web app with execute permissions for "Anyone"
 * 8. Copy the web app URL to use in your website
 */

// Replace this with your Google Sheet ID (found in the URL)
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

// Sheet name (you can change this if needed)
const SHEET_NAME = 'Feedback';

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
      newSheet.getRange(1, 1, 1, 7).setValues([
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshots Count', 'User Agent']
      ]);
      newSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }
    
    // Prepare the row data
    const timestamp = new Date().toLocaleString();
    const screenshotsCount = data.files ? data.files.length : 0;
    
    const rowData = [
      timestamp,
      data.name || '',
      data.os || '',
      data.feedbackType || '',
      data.details || '',
      screenshotsCount,
      data.userAgent || ''
    ];
    
    // Add the new row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Feedback stored successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput('YDBG Feedback Collection API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Test function to verify the setup
 */
function testSetup() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (sheet) {
      console.log('Sheet found:', sheet.getName());
      console.log('Last row:', sheet.getLastRow());
    } else {
      console.log('Sheet not found, will be created on first submission');
    }
  } catch (error) {
    console.error('Setup test failed:', error);
  }
}
