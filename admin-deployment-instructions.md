# Admin Panel Google Apps Script Deployment Instructions

## Overview
This creates a **separate Google Apps Script** specifically for admin panel functionality, so we don't break the main form submission script.

## Steps

### 1. Create New Google Apps Script Project
1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Name it "YDBG Admin Panel"

### 2. Replace the Code
1. Delete the default `Code.gs` content
2. Copy the entire content from `admin-google-apps-script.js`
3. Paste it into the script editor

### 3. Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set "Execute as" to "Me"
4. Set "Who has access" to "Anyone"
5. Click "Deploy"
6. **Copy the web app URL** (you'll need this)

### 4. Update Admin Panel
1. Open `admin.html`
2. Find the line: `const ADMIN_GOOGLE_SHEETS_URL = 'YOUR_ADMIN_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Replace `YOUR_ADMIN_GOOGLE_APPS_SCRIPT_URL_HERE` with your new web app URL
4. Save the file

### 5. Test
1. Go to `http://localhost:8080/admin.html`
2. Enter password: `admin`
3. Test loading data and toggling handled status

## Benefits
- ✅ **Main form submission script remains untouched**
- ✅ **Admin panel gets its own dedicated script**
- ✅ **No risk of breaking existing functionality**
- ✅ **Can be updated independently**

## Important Notes
- The admin script only handles reading data and updating handled status
- The main script continues to handle form submissions and file uploads
- Both scripts access the same Google Sheet
- If you need to update admin functionality, only modify the admin script
