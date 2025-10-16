// Slack and Google Sheets Configuration for GitHub Pages
// This file loads the Slack webhook URL from a secret Google Sheet tab
window.SLACK_CONFIG = {
    webhookUrl: 'YOUR_SLACK_WEBHOOK_URL_HERE', // Will be loaded from Google Sheets
    googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbx086lKDETdRyuSSOzBRmmnR0idiEA1GGVjq-lHC9JRdvYwjbA9hA3hFaVfkaRpFl42Vw/exec'
};

// Load Slack webhook URL from Google Sheets "Secret" tab
async function loadSlackWebhookFromSheets() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxaJklOPiBmdha3EQir_BbaJzFz9cMQ51S78g7qS96zX960CgWkOkLogFbsMhOMiu1d1g/exec?action=getSlackWebhook');
        const data = await response.json();
        
        if (data.success && data.webhookUrl) {
            window.SLACK_CONFIG.webhookUrl = data.webhookUrl;
            console.log('✅ Slack webhook loaded from Google Sheets');
        } else {
            console.log('⚠️ Could not load Slack webhook from Google Sheets, using default');
        }
    } catch (error) {
        console.log('⚠️ Error loading Slack webhook from Google Sheets:', error);
    }
}

// Load the webhook URL when the page loads
loadSlackWebhookFromSheets();

console.log('Config.prod.js loaded with URLs:', {
    slack: window.SLACK_CONFIG.webhookUrl !== 'https://hooks.slack.com/services/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',
    sheets: window.SLACK_CONFIG.googleSheetsUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
});
