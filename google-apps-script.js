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

// Google Drive folder ID for screenshots (Level 1)
const DRIVE_FOLDER_ID = '';

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Handle different actions
    if (data.action === 'updateStatus') {
      return updateHandledStatus(data.id, data.handled);
    }
    
    if (data.action === 'getAllData') {
      return getAllFeedbackData();
    }
    
    // Default: Handle form submission (existing functionality)
    return handleFormSubmission(data);
      
  } catch (error) {
    // Log the error for debugging
    console.error('Google Apps Script Error:', error);
    
    // Return error response
    const errorOutput = ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString(),
        message: 'Failed to process request'
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
    return errorOutput;
  }
}

function handleFormSubmission(data) {
  try {
    // Get the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    
    // Try to get the sheet, if it doesn't exist, create it
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // Create the sheet with headers
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 8).setValues([
        ['Timestamp', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshot Links', 'User Agent', 'Handled']
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }
    
    // Handle file uploads to Google Drive
    let screenshotLinks = '';
    if (data.files && data.files.length > 0) {
      const uploadedLinks = [];
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i];
        try {
          // Convert base64 to blob
          const base64Data = file.url.split(',')[1];
          const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), file.type, file.name);
          
          // Upload to Google Drive folder
          let driveFile;
          if (DRIVE_FOLDER_ID) {
            // Upload to specific folder
            const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
            driveFile = folder.createFile(blob);
          } else {
            // Fallback to root if folder ID not set
            driveFile = DriveApp.createFile(blob);
          }
          driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          // Get shareable link
          const shareableLink = driveFile.getUrl();
          uploadedLinks.push(shareableLink);
          
          console.log(`✅ File uploaded: ${file.name} -> ${shareableLink}`);
        } catch (fileError) {
          console.error(`❌ Error uploading ${file.name}:`, fileError);
          uploadedLinks.push(`Error uploading ${file.name}`);
        }
      }
      screenshotLinks = uploadedLinks.join(',');
    }
    
    // Prepare the row data
    const timestamp = new Date().toLocaleString();
    
    const rowData = [
      timestamp,
      data.name || '',
      data.os || '',
      data.feedbackType || '',
      data.details || '',
      screenshotLinks,
      data.userAgent || '',
      'FALSE' // Default handled status
    ];
    
    // Add the new row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    const output = ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Feedback stored successfully', timestamp: timestamp}))
      .setMimeType(ContentService.MimeType.JSON);
    
    return output;
      
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

function updateHandledStatus(id, handled) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    
    // Find the row by ID (assuming ID corresponds to row number)
    const rowNumber = parseInt(id) + 1; // +1 because sheet rows are 1-indexed and row 1 is header
    const handledColumn = 8; // Column H
    
    // Update the handled status
    sheet.getRange(rowNumber, handledColumn).setValue(handled ? 'TRUE' : 'FALSE');
    
    console.log(`✅ Updated handled status for row ${rowNumber} to ${handled}`);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Status updated successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Status update error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllFeedbackData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({success: false, error: 'Sheet not found'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from the sheet
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Skip header row and convert to objects
    const feedbackData = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      feedbackData.push({
        id: i,
        timestamp: row[0] || '',
        name: row[1] || '',
        os: row[2] || '',
        feedbackType: row[3] || '',
        details: row[4] || '',
        screenshotLinks: row[5] || '',
        userAgent: row[6] || '',
        handled: row[7] === 'TRUE'
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: feedbackData}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Get data error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests for data retrieval
  try {
    // Check if this is a request for all feedback data
    if (e.parameter && e.parameter.action === 'getAllData') {
      return getAllFeedbackData();
    }
    
    // Default response for testing
    const output = ContentService
      .createTextOutput('YDBG Feedback Collection API is running')
      .setMimeType(ContentService.MimeType.TEXT);
    
    return output;
    
  } catch (error) {
    console.error('doGet error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  // Handle OPTIONS requests for CORS preflight
  const output = ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
  
  // Note: Google Apps Script doesn't support setHeader method
  // CORS is handled by the platform automatically for web apps
  
  return output;
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