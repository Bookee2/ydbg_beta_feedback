/**
 * Google Apps Script for YDBG App Beta Feedback Collection (Levels 2-5)
 * 
 * This script receives feedback data from your website and stores it in a Google Sheet.
 * 
 * Setup Instructions:
 * 1. Go to https://script.google.com
 * 2. Open your existing project for Levels 2-5 (or create a new one)
 * 3. Replace the code with this script
 * 4. Update the constants below if needed
 * 5. Deploy as a web app with execute permissions for "Anyone"
 */

// Google Sheet ID for Levels 2-5
const SHEET_ID = '1lXihd_GqnNBT9C_eq8EZT_U0jqYi-JyvId8zM6eVaaQ';

// Sheet name
const SHEET_NAME = 'YDBG Beta Feedback';

// Google Drive folder ID for screenshots (Levels 2-5)
// Folder: Feedback_Screenshots
const DRIVE_FOLDER_ID = '1aycnfz8Icr0g6CNkGL0mjoqS0eFR1F3E';

function doPost(e) {
  try {
    console.log('=== doPost called ===');
    console.log('postData exists:', !!e.postData);
    console.log('postData.contents exists:', !!(e.postData && e.postData.contents));
    
    if (!e.postData || !e.postData.contents) {
      throw new Error('No post data received');
    }
    
    // Parse the incoming data
    console.log('Parsing JSON data...');
    const data = JSON.parse(e.postData.contents);
    console.log('Data parsed successfully. Keys:', Object.keys(data));
    
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
    console.error('=== Google Apps Script Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Return error response
    const errorOutput = ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString(),
        message: 'Failed to process request',
        details: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
    return errorOutput;
  }
}

function handleFormSubmission(data) {
  try {
    // Log received data for debugging
    console.log('=== Form Submission Started ===');
    console.log('Received data:', {
      betaGroup: data.betaGroup,
      name: data.name,
      os: data.os,
      feedbackType: data.feedbackType,
      hasFiles: data.files && data.files.length > 0
    });
    
    // Get the spreadsheet
    console.log('Opening spreadsheet with ID:', SHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('Spreadsheet opened:', spreadsheet.getName());
    
    // Try to get the sheet, if it doesn't exist, use the first sheet or create it
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('Sheet "' + SHEET_NAME + '" not found, checking for existing sheets...');
      // Try to use the first sheet if it exists
      const sheets = spreadsheet.getSheets();
      if (sheets.length > 0) {
        sheet = sheets[0];
        console.log('Using first sheet:', sheet.getName());
        
        // Check if headers exist, if not add them
        const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        if (headerRow.length < 2 || headerRow[0] !== 'Timestamp') {
          console.log('Adding headers to existing sheet...');
          sheet.getRange(1, 1, 1, 9).setValues([
            ['Timestamp', 'Beta Testing Group', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshot Links', 'User Agent', 'Handled']
          ]);
          sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
        }
      } else {
        // Create the sheet with headers including Beta Testing Group
        console.log('Creating new sheet:', SHEET_NAME);
        sheet = spreadsheet.insertSheet(SHEET_NAME);
        sheet.getRange(1, 1, 1, 9).setValues([
          ['Timestamp', 'Beta Testing Group', 'Name', 'Operating System', 'Feedback Type', 'Details', 'Screenshot Links', 'User Agent', 'Handled']
        ]);
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
      }
    } else {
      console.log('Found sheet:', sheet.getName());
    }
    
    // Handle file uploads to Google Drive folder
    let screenshotLinks = '';
    if (data.files && data.files.length > 0) {
      const uploadedLinks = [];
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i];
        try {
          // Convert base64 to blob
          const base64Data = file.url.split(',')[1];
          const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), file.type, file.name);
          
          // Upload to Google Drive folder (Feedback_Screenshots)
          const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
          const driveFile = folder.createFile(blob);
          driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          // Get shareable link
          const shareableLink = driveFile.getUrl();
          uploadedLinks.push(shareableLink);
          
          console.log(`✅ File uploaded to Feedback_Screenshots folder: ${file.name} -> ${shareableLink}`);
        } catch (fileError) {
          console.error(`❌ Error uploading ${file.name}:`, fileError);
          uploadedLinks.push(`Error uploading ${file.name}`);
        }
      }
      screenshotLinks = uploadedLinks.join(',');
    }
    
    // Prepare the row data with Beta Testing Group
    const timestamp = new Date().toLocaleString();
    
    // Ensure betaGroup is properly extracted (handle both direct and nested access)
    const betaGroup = data.betaGroup || '';
    
    const rowData = [
      timestamp,
      betaGroup,  // Beta Testing Group column (e.g., "Level 2", "Level 3", etc.)
      data.name || '',
      data.os || '',
      data.feedbackType || '',
      data.details || '',
      screenshotLinks,
      data.userAgent || '',
      'FALSE' // Default handled status
    ];
    
    // Log the row data before appending for debugging
    console.log('Row data to append:', rowData);
    console.log('Beta Group value:', betaGroup);
    console.log('Sheet name:', sheet.getName());
    console.log('Current row count:', sheet.getLastRow());
    
    // Add the new row to the sheet
    sheet.appendRow(rowData);
    
    console.log('Row appended successfully. New row count:', sheet.getLastRow());
    console.log('=== Form Submission Completed Successfully ===');
    
    // Return success response
    const output = ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Feedback stored successfully', timestamp: timestamp}))
      .setMimeType(ContentService.MimeType.JSON);
    
    return output;
      
  } catch (error) {
    console.error('=== Form submission error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Return error response instead of throwing
    const errorOutput = ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to store feedback',
        details: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
    return errorOutput;
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
    const handledColumn = 9; // Column I (Beta Group added a column)
    
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
        betaGroup: row[1] || '',  // Beta Testing Group
        name: row[2] || '',
        os: row[3] || '',
        feedbackType: row[4] || '',
        details: row[5] || '',
        screenshotLinks: row[6] || '',
        userAgent: row[7] || '',
        handled: row[8] === 'TRUE'
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
  
  return output;
}

