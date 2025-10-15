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
const SHEET_ID = '19sspNrLcvU68k0BYurY5RjedZRE1iHMo-6ZIYNbBXIU';

// Sheet name (you can change this if needed)
const SHEET_NAME = 'YDBG Beta Feedback';

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    
    // Try to get the sheet, if it doesn't exist, create it
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // Create the sheet with headers
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 7).setValues([
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshots Count', 'User Agent']
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
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
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Feedback stored successfully', timestamp: timestamp}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error for debugging
    console.error('Google Apps Script Error:', error);
    
    // Return error response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString(),
        message: 'Failed to store feedback in Google Sheets'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing) with CORS headers
  return ContentService
    .createTextOutput('YDBG Feedback Collection API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * SIMPLE TEST FUNCTION - Run this one!
 * This function has no dependencies and tests everything step by step
 */
function simpleTest() {
  try {
    console.log('🚀 Starting simple test...');
    
    // Step 1: Test spreadsheet access
    console.log('Step 1: Testing spreadsheet access...');
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('✅ SUCCESS: Spreadsheet accessed');
    console.log('📊 Spreadsheet name:', spreadsheet.getName());
    
    // Step 2: Test sheet access
    console.log('Step 2: Testing sheet access...');
    console.log('Looking for sheet:', SHEET_NAME);
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (sheet) {
      console.log('✅ SUCCESS: Sheet found');
      console.log('📋 Sheet name:', sheet.getName());
      console.log('📊 Current rows:', sheet.getLastRow());
    } else {
      console.log('⚠️ Sheet not found, creating it...');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 7).setValues([
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshots Count', 'User Agent']
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      console.log('✅ SUCCESS: Sheet created');
    }
    
    // Step 3: Test adding data
    console.log('Step 3: Testing data addition...');
    const newRow = [
      new Date().toLocaleString(),
      'Simple Test User',
      'iOS',
      'Test',
      'Simple test from Google Apps Script',
      0,
      'Simple Test'
    ];
    
    sheet.appendRow(newRow);
    console.log('✅ SUCCESS: Test row added');
    console.log('📊 New total rows:', sheet.getLastRow());
    
    console.log('🎉 ALL TESTS PASSED!');
    return 'SUCCESS: All tests completed successfully!';
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.toString());
    console.error('Error details:', error);
    return 'ERROR: ' + error.toString();
  }
}
