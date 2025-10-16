// Slack and Google Sheets Configuration for GitHub Pages
window.SLACK_CONFIG = {
    webhookUrl: 'YOUR_SLACK_WEBHOOK_URL_HERE',
    googleSheetsUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
};

console.log('Config.prod.js loaded with URLs:', {
    slack: window.SLACK_CONFIG.webhookUrl !== 'YOUR_SLACK_WEBHOOK_URL_HERE',
    sheets: window.SLACK_CONFIG.googleSheetsUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
});
