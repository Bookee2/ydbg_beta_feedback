/**
 * SIMPLIFIED Google Apps Script for YDBG App Beta Feedback Collection
 * This is a simplified version for debugging
 */

// Replace this with your Google Sheet ID (found in the URL)
const SHEET_ID = '19sspNrLcvU68k0BYurY5RjedZRE1iHMo-6ZIYNbBXIU';

// Sheet name (you can change this if needed)
const SHEET_NAME = 'YDBG Beta Feedback';

function doPost(e) {
  try {
    console.log('doPost called');
    console.log('e.postData:', e.postData);
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    console.log('Parsed data:', data);
    
    // Get the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('Spreadsheet opened:', spreadsheet.getName());
    
    // Try to get the sheet, if it doesn't exist, create it
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    console.log('Sheet found:', sheet ? sheet.getName() : 'NOT FOUND');
    
    if (!sheet) {
      console.log('Creating new sheet...');
      // Create the sheet with headers
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 7).setValues([
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshots Count', 'User Agent']
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      console.log('Sheet created successfully');
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
    
    console.log('Adding row:', rowData);
    
    // Add the new row to the sheet
    sheet.appendRow(rowData);
    console.log('Row added successfully');
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Feedback stored successfully', timestamp: timestamp}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    
    // Return error response
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
  console.log('doGet called');
  return ContentService
    .createTextOutput('YDBG Feedback Collection API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}

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
    
    console.log('🎉 ALL TESTS PASSED!');
    return 'SUCCESS: All tests completed successfully! Row count: ' + newRowCount;
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.toString());
    console.error('Error details:', error);
    return 'ERROR: ' + error.toString();
  }
}
