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

function doOptions(e) {
  // Handle OPTIONS requests for CORS preflight
  return ContentService
    .createTextOutput('')
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
      
      // Show current data
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      console.log('📋 Current data:', values);
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
    const timestamp = new Date().toLocaleString();
    const newRow = [
      timestamp,
      'Simple Test User',
      'iOS',
      'Test',
      'Simple test from Google Apps Script',
      0,
      'Simple Test'
    ];
    
    console.log('Adding row:', newRow);
    sheet.appendRow(newRow);
    console.log('✅ SUCCESS: Test row added');
    
    // Verify the row was added
    const newRowCount = sheet.getLastRow();
    console.log('📊 New total rows:', newRowCount);
    
    // Get the last row to verify it was added correctly
    const lastRowRange = sheet.getRange(newRowCount, 1, 1, 7);
    const lastRowData = lastRowRange.getValues()[0];
    console.log('📋 Last row data:', lastRowData);
    
    console.log('🎉 ALL TESTS PASSED!');
    return 'SUCCESS: All tests completed successfully! Row count: ' + newRowCount;
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.toString());
    console.error('Error details:', error);
    return 'ERROR: ' + error.toString();
  }
}

/**
 * DETAILED DEBUG FUNCTION - Run this to see what's happening
 */
function debugSheet() {
  try {
    console.log('🔍 Starting detailed debug...');
    
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('📊 Spreadsheet:', spreadsheet.getName());
    
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.log('❌ Sheet not found!');
      return 'ERROR: Sheet not found';
    }
    
    console.log('📋 Sheet:', sheet.getName());
    console.log('📊 Total rows:', sheet.getLastRow());
    console.log('📊 Total columns:', sheet.getLastColumn());
    
    // Get all data
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    console.log('📋 All data:', values);
    
    // Show each row
    values.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });
    
    return 'SUCCESS: Debug completed. Check logs for details.';
    
  } catch (error) {
    console.error('❌ DEBUG FAILED:', error.toString());
    return 'ERROR: ' + error.toString();
  }
}
