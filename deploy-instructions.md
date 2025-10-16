# Deploy Updated Google Apps Script

## Steps to Fix Screenshot Links:

1. **Go to [script.google.com](https://script.google.com)**
2. **Open your YDBG Feedback project**
3. **Copy ALL the code** from `fixed-google-apps-script.js` (the version with file upload)
4. **Replace the existing code** in the Apps Script editor
5. **Save the script** (Ctrl+S)
6. **Create a NEW deployment:**
   - Click "Deploy" → "New deployment"
   - Choose "Web app"
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
7. **Copy the NEW deployment URL**
8. **Update your `config.js`** with the new URL

## What This Will Fix:
- Screenshots will be uploaded to Google Drive
- Links to screenshots will be stored in the "Screenshot Links" column
- No more just counting files - actual shareable links!
