# Slack Webhook Loader - Deployment Instructions

## Overview
This is a separate, lightweight Google Apps Script that loads the Slack webhook URL from a "Secret" tab in your Google Sheet. This keeps the webhook URL secure and out of GitHub.

## Setup Steps

### Step 1: Create the Secret Tab
1. Open your Google Sheet (ID: `19sspNrLcvU68k0BYurY5RjeZRE1iHMo-6ZIYNbBXIU`)
2. Create a new tab called **"Secret"**
3. In cell **A1**, enter your Slack webhook URL:
   ```
   https://hooks.slack.com/services/YOUR_WEBHOOK_URL_HERE
   ```

### Step 2: Deploy the Webhook Loader Script
1. Go to https://script.google.com
2. Click **"New Project"**
3. Replace the default code with the contents of `slack-webhook-loader.js`
4. Click **"Save"** (Ctrl+S)
5. Click **"Deploy"** → **"New Deployment"**
6. Choose **"Web app"** as the type
7. Set **"Execute as"** to **"Me"**
8. Set **"Who has access"** to **"Anyone"**
9. Click **"Deploy"**
10. Copy the **Web App URL**

### Step 3: Update GitHub Configuration
1. Go to: https://github.com/Bookee2/ydbg_beta_feedback/blob/main/config.prod.js
2. Click the **pencil icon** to edit
3. Replace `YOUR_SLACK_WEBHOOK_LOADER_URL_HERE` with your Web App URL
4. Click **"Commit changes"**

### Step 4: Test
1. Wait 2-3 minutes for GitHub Pages to deploy
2. Go to: https://bookee2.github.io/ydbg_beta_feedback/
3. Open browser console (F12)
4. You should see: `✅ Slack webhook loaded from Google Sheets`
5. Test form submission - Slack messages should work!

## Security Benefits
- ✅ Slack webhook URL is never exposed in GitHub
- ✅ URL is stored securely in Google Sheets
- ✅ Easy to update webhook URL without code changes
- ✅ Separate script keeps main functionality clean

## Troubleshooting
- **"Secret sheet not found"**: Make sure you created a tab called "Secret"
- **"No webhook URL found"**: Make sure the URL is in cell A1 of the Secret tab
- **Console shows error**: Check that the Web App URL is correct in config.prod.js
