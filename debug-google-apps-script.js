/**
 * DEBUGGED Google Apps Script for YDBG App Beta Feedback Collection
 * This version includes extensive logging and error handling
 */

// Replace this with your Google Sheet ID (found in the URL)
const SHEET_ID = '19sspNrLcvU68k0BYurY5RjedZRE1iHMo-6ZIYNbBXIU';

// Sheet name (you can change this if needed)
const SHEET_NAME = 'YDBG Beta Feedback';

function doPost(e) {
  try {
    // Log everything we receive
    Logger.log('=== doPost called ===');
    Logger.log('e object:', JSON.stringify(e));
    Logger.log('e.postData:', JSON.stringify(e.postData));
    
    // Check if we have postData
    if (!e.postData) {
      Logger.log('ERROR: No postData received');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'No postData received',
          received: JSON.stringify(e)
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if we have contents
    if (!e.postData.contents) {
      Logger.log('ERROR: No postData.contents received');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'No postData.contents received',
          postData: JSON.stringify(e.postData)
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('postData.contents:', e.postData.contents);
    Logger.log('postData.type:', e.postData.type);
    Logger.log('postData.length:', e.postData.length);
    
    // Try to parse the data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
      Logger.log('Successfully parsed JSON data:', JSON.stringify(data));
    } catch (parseError) {
      Logger.log('ERROR parsing JSON:', parseError.toString());
      Logger.log('Raw contents:', e.postData.contents);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'JSON parse error: ' + parseError.toString(),
          rawContents: e.postData.contents
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validate required fields
    if (!data.name && !data.os && !data.feedbackType && !data.details) {
      Logger.log('ERROR: Missing required fields');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Missing required fields',
          receivedData: JSON.stringify(data)
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('=== Processing data ===');
    Logger.log('Name:', data.name);
    Logger.log('OS:', data.os);
    Logger.log('Feedback Type:', data.feedbackType);
    Logger.log('Details:', data.details);
    Logger.log('Files count:', data.files ? data.files.length : 0);
    
    // Get the spreadsheet
    Logger.log('=== Accessing spreadsheet ===');
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    Logger.log('Spreadsheet accessed:', spreadsheet.getName());
    
    // Try to get the sheet, if it doesn't exist, create it
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    Logger.log('Sheet found:', sheet ? sheet.getName() : 'NOT FOUND');
    
    if (!sheet) {
      Logger.log('Creating new sheet...');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 7).setValues([
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshots Count', 'User Agent']
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      Logger.log('Sheet created successfully');
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
    
    Logger.log('=== Adding row to sheet ===');
    Logger.log('Row data:', JSON.stringify(rowData));
    
    // Add the new row to the sheet
    sheet.appendRow(rowData);
    Logger.log('Row added successfully');
    
    // Verify the row was added
    const newRowCount = sheet.getLastRow();
    Logger.log('New total rows:', newRowCount);
    
    Logger.log('=== SUCCESS ===');
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        message: 'Feedback stored successfully', 
        timestamp: timestamp,
        rowCount: newRowCount
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('=== ERROR in doPost ===');
    Logger.log('Error:', error.toString());
    Logger.log('Error stack:', error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString(),
        message: 'Failed to store feedback in Google Sheets',
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  Logger.log('doGet called with:', JSON.stringify(e));
  return ContentService
    .createTextOutput('YDBG Feedback Collection API is running - Debug Version')
    .setMimeType(ContentService.MimeType.TEXT);
}

function simpleTest() {
  try {
    Logger.log('🚀 Starting simple test...');
    
    // Step 1: Test spreadsheet access
    Logger.log('Step 1: Testing spreadsheet access...');
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    Logger.log('✅ SUCCESS: Spreadsheet accessed');
    Logger.log('📊 Spreadsheet name:', spreadsheet.getName());
    
    // Step 2: Test sheet access
    Logger.log('Step 2: Testing sheet access...');
    Logger.log('Looking for sheet:', SHEET_NAME);
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (sheet) {
      Logger.log('✅ SUCCESS: Sheet found');
      Logger.log('📋 Sheet name:', sheet.getName());
      Logger.log('📊 Current rows:', sheet.getLastRow());
    } else {
      Logger.log('⚠️ Sheet not found, creating it...');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 7).setValues([
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshots Count', 'User Agent']
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      Logger.log('✅ SUCCESS: Sheet created');
    }
    
    // Step 3: Test adding data
    Logger.log('Step 3: Testing data addition...');
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
    
    Logger.log('Adding row:', newRow);
    sheet.appendRow(newRow);
    Logger.log('✅ SUCCESS: Test row added');
    
    // Verify the row was added
    const newRowCount = sheet.getLastRow();
    Logger.log('📊 New total rows:', newRowCount);
    
    Logger.log('🎉 ALL TESTS PASSED!');
    return 'SUCCESS: All tests completed successfully! Row count: ' + newRowCount;
    
  } catch (error) {
    Logger.log('❌ TEST FAILED:', error.toString());
    Logger.log('Error details:', error);
    return 'ERROR: ' + error.toString();
  }
}
