# YDBG App Beta Feedback Collection Website

A simple, modern web form for collecting beta tester feedback for the YDBG App rebuild. The form sends responses directly to a Slack channel via webhook.

## Features

- **Clean, Modern Design**: Responsive design that works on desktop and mobile
- **Form Validation**: Client-side validation for required fields
- **File Upload**: Support for multiple screenshot uploads
- **Slack Integration**: Automatic posting to Slack channel via webhook
- **User-Friendly**: Intuitive interface with loading states and success/error messages

## Files Included

- `index.html` - Main HTML structure
- `styles.css` - Modern CSS styling with gradients and animations
- `script.js` - JavaScript for form handling and Slack integration
- `README.md` - This setup guide

## Setup Instructions

### 1. Slack Webhook Setup

1. Go to your Slack workspace
2. Navigate to **Apps** → **Incoming Webhooks**
3. Click **Add to Slack**
4. Choose the channel where you want feedback to be posted
5. Copy the webhook URL

### 2. Configure the Webhook URL

1. Open `script.js` in a text editor
2. Find this line near the top:
   ```javascript
   const SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL_HERE';
   ```
3. Replace `'YOUR_SLACK_WEBHOOK_URL_HERE'` with your actual Slack webhook URL

### 3. Deploy the Website

You have several options for hosting:

#### Option A: Simple File Hosting (Easiest)
- Upload all files (`index.html`, `styles.css`, `script.js`) to any web hosting service
- Examples: Netlify, Vercel, GitHub Pages, or any web hosting provider

#### Option B: Local Testing
- Open `index.html` in a web browser
- Note: File uploads may not work properly when opening files directly (file:// protocol)
- For full functionality, use a local web server

#### Option C: GitHub Pages (Free)
1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to repository **Settings** → **Pages**
4. Select source branch and publish
5. Your site will be available at `https://yourusername.github.io/repository-name`

## Form Fields

The form collects the following information:

1. **Name** (Required) - Dropdown with predefined beta tester names
2. **Operating System** (Required) - iOS or Android
3. **Feedback Type** (Required) - Bug/Error, UI/UX, Feature configuration, etc.
4. **Details** (Required) - Open text field for detailed feedback
5. **Screenshots** (Optional) - Multiple image file upload

## Slack Message Format

When feedback is submitted, Slack will receive a formatted message with:

- Header: "🔍 New Beta Feedback Received"
- Fields: Name, OS, Feedback Type, Timestamp
- Details: Full feedback text
- File count: Number of screenshots attached

## Customization

### Adding/Removing Beta Testers
Edit the `<select>` options in `index.html`:
```html
<option value="New Tester Name">New Tester Name</option>
```

### Modifying Feedback Types
Edit the feedback type options in `index.html`:
```html
<option value="New Feedback Type">New Feedback Type</option>
```

### Changing Colors/Styling
Modify the CSS variables and gradient colors in `styles.css`:
```css
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Slack Message Format
Customize the Slack message format in `script.js` by modifying the `slackMessage` object.

## Security Considerations

- **Webhook URL**: Keep your Slack webhook URL private - don't commit it to public repositories
- **File Uploads**: Currently limited to 10MB per file, 5 files max
- **Validation**: Client-side validation only - consider server-side validation for production

## Troubleshooting

### Form Not Submitting
1. Check browser console for JavaScript errors
2. Verify Slack webhook URL is correct
3. Ensure all required fields are filled

### Slack Not Receiving Messages
1. Verify webhook URL is active in Slack
2. Check if webhook has proper permissions
3. Test webhook with a simple curl command using your actual webhook URL

### File Upload Issues
1. Ensure files are under 10MB each
2. Check file types (images only)
3. Verify hosting supports file uploads

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## License

This project is provided as-is for the YDBG App beta testing program.
