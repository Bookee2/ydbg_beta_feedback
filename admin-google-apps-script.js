/**
 * Google Apps Script for YDBG Admin Panel
 * 
 * This script ONLY handles admin panel functionality:
 * - Reading all feedback data
 * - Updating handled status
 * 
 * DO NOT modify the main Google Apps Script that handles form submissions!
 */

// Replace this with your Google Sheet ID (found in the URL)
const ADMIN_SPREADSHEET_ID = '19sspNrLcvU68k0BYurY5RjeZRE1iHMo-6ZIYNbBXIU';

// Sheet name (you can change this if needed)
const ADMIN_WORKSHEET_NAME = 'YDBG Beta Feedback';

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Handle different actions
    if (data.action === 'updateStatus') {
      return updateHandledStatus(data.id, data.handled);
    }
    
    // Return error for unknown actions
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: 'Unknown action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Admin Script Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString(),
        message: 'Failed to process admin request'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Check if this is a request for all feedback data
    if (e.parameter && e.parameter.action === 'getAllData') {
      return getAllFeedbackData();
    }
    
    // Check if this is a debug request
    if (e.parameter && e.parameter.action === 'debugSheet') {
      return debugSheet();
    }
    
    // Default response
    const output = ContentService
      .createTextOutput('YDBG Admin Panel API is running')
      .setMimeType(ContentService.MimeType.TEXT);
    
    return output;
    
  } catch (error) {
    console.error('doGet error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateHandledStatus(id, handled) {
  try {
    console.log(`🔄 updateHandledStatus called with id: ${id}, handled: ${handled}`);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log(`📊 Spreadsheet: ${spreadsheet.getName()}`);
    
    const sheet = spreadsheet.getSheetByName(ADMIN_WORKSHEET_NAME);
    console.log(`📋 Sheet: ${sheet ? sheet.getName() : 'NOT FOUND'}`);
    
    if (!sheet) {
      throw new Error('Sheet not found');
    }
    
    // Find the row by ID (assuming ID corresponds to row number)
    const rowNumber = parseInt(id) + 1; // +1 because sheet rows are 1-indexed and row 1 is header
    const handledColumn = 8; // Column H
    
    console.log(`🎯 Updating row ${rowNumber}, column ${handledColumn} to ${handled ? 'TRUE' : 'FALSE'}`);
    
          // Update the handled status (use boolean values)
          sheet.getRange(rowNumber, handledColumn).setValue(handled);
    
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

function debugSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(ADMIN_WORKSHEET_NAME);
    
    if (!sheet) {
      return ContentService
        .createTextOutput('Sheet not found')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Get all data from the sheet
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    let debugInfo = 'Sheet Debug Info:\n';
    debugInfo += `Total rows: ${values.length}\n`;
    debugInfo += `Headers: ${JSON.stringify(values[0])}\n\n`;
    
    // Show first 5 rows with their raw values
    for (let i = 1; i <= Math.min(5, values.length - 1); i++) {
      const row = values[i];
      debugInfo += `Row ${i + 1}:\n`;
      debugInfo += `  Column 8 (Handled): "${row[7]}" (type: ${typeof row[7]})\n`;
      debugInfo += `  Raw values: ${JSON.stringify(row)}\n\n`;
    }
    
    return ContentService
      .createTextOutput(debugInfo)
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    return ContentService
      .createTextOutput(`Debug error: ${error.toString()}`)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function getAllFeedbackData() {
  try {
    // Get the spreadsheet (bound script - use getActiveSpreadsheet)
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Try to get the sheet, if it doesn't exist, create it (same logic as original)
    let sheet = spreadsheet.getSheetByName(ADMIN_WORKSHEET_NAME);
    
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
        handled: row[7] === 'TRUE' || row[7] === true || row[7] === 'true' || row[7] === 1 || row[7] === '1'
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

/**
 * SIMPLE TEST FUNCTION - Run this to verify permissions
 */
function testPermissions() {
  try {
    console.log('🚀 Testing permissions...');
    
    // Test spreadsheet access (bound script)
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('✅ SUCCESS: Spreadsheet accessed');
    console.log('📊 Spreadsheet name:', spreadsheet.getName());
    
    // Test sheet access
    const sheet = spreadsheet.getSheetByName(ADMIN_WORKSHEET_NAME);
    if (sheet) {
      console.log('✅ SUCCESS: Sheet found');
      console.log('📋 Sheet name:', sheet.getName());
      console.log('📊 Current rows:', sheet.getLastRow());
    } else {
      console.log('❌ Sheet not found');
    }
    
    return 'SUCCESS: Permissions are working!';
    
  } catch (error) {
    console.error('❌ PERMISSION ERROR:', error.toString());
    return 'ERROR: ' + error.toString();
  }
}
