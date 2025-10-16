// Slack and Google Sheets Configuration for GitHub Pages
window.SLACK_CONFIG = {
    webhookUrl: 'YOUR_SLACK_WEBHOOK_URL_HERE',
    googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbx086lKDETdRyuSSOzBRmmnR0idiEA1GGVjq-lHC9JRdvYwjbA9hA3hFaVfkaRpFl42Vw/exec'
};

console.log('Config.prod.js loaded with URLs:', {
    slack: window.SLACK_CONFIG.webhookUrl !== 'YOUR_SLACK_WEBHOOK_URL_HERE',
    sheets: window.SLACK_CONFIG.googleSheetsUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
});
