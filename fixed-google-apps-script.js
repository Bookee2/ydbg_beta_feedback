/**
 * FIXED Google Apps Script for YDBG App Beta Feedback Collection
 * This version handles both JSON and form data properly
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
    
    let data;
    
    // Check if we have postData (JSON format)
    if (e.postData && e.postData.contents) {
      Logger.log('Processing JSON data from postData.contents');
      Logger.log('postData.contents:', e.postData.contents);
      data = JSON.parse(e.postData.contents);
    }
    // Check if we have parameter data (form format)
    else if (e.parameter && e.parameter.data) {
      Logger.log('Processing JSON data from parameter.data');
      Logger.log('parameter.data:', e.parameter.data);
      data = JSON.parse(e.parameter.data);
    }
    // Check if we have direct parameter data (form fields)
    else if (e.parameter && (e.parameter.name || e.parameter.details)) {
      Logger.log('Processing form data from parameters');
      Logger.log('parameters:', JSON.stringify(e.parameter));
      
      // Convert form parameters to our data structure
      data = {
        name: e.parameter.name || '',
        os: e.parameter.os || '',
        feedbackType: e.parameter.feedbackType || '',
        details: e.parameter.details || '',
        files: e.parameter.files ? JSON.parse(e.parameter.files) : [],
        userAgent: e.parameter.userAgent || ''
      };
    }
    else {
      Logger.log('ERROR: No recognizable data format found');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'No recognizable data format found',
          received: JSON.stringify(e)
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('=== Processing data ===');
    Logger.log('Parsed data:', JSON.stringify(data));
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
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshot Links', 'User Agent']
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      Logger.log('Sheet created successfully');
    }
    
    // Prepare the row data
    const timestamp = new Date().toLocaleString();
    
    // Handle file uploads and get links
    let fileLinks = '';
    if (data.files && data.files.length > 0) {
      Logger.log('=== Processing file uploads ===');
      const uploadedLinks = [];
      
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i];
        Logger.log(`Processing file ${i + 1}: ${file.name}`);
        
        try {
          // Convert base64 to blob
          const base64Data = file.url.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          const blob = Utilities.newBlob(
            Utilities.base64Decode(base64Data),
            file.type || 'image/jpeg',
            file.name
          );
          
          // Upload to Google Drive
          const fileId = DriveApp.createFile(blob).getId();
          const fileUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
          
          uploadedLinks.push(fileUrl);
          Logger.log(`File uploaded successfully: ${fileUrl}`);
        } catch (uploadError) {
          Logger.log(`Error uploading file ${file.name}: ${uploadError.toString()}`);
          uploadedLinks.push(`Error uploading ${file.name}`);
        }
      }
      
      fileLinks = uploadedLinks.join(', ');
      Logger.log('All file links:', fileLinks);
    }
    
    const rowData = [
      timestamp,
      data.name || '',
      data.os || '',
      data.feedbackType || '',
      data.details || '',
      fileLinks || 'No files uploaded',
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
        rowCount: newRowCount,
        dataReceived: data
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
    .createTextOutput('YDBG Feedback Collection API is running - Fixed Version')
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
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshot Links', 'User Agent']
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
