// Slack and Google Sheets Configuration for GitHub Pages
window.SLACK_CONFIG = {
    webhookUrl: 'https://hooks.slack.com/services/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',
    googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbx086lKDETdRyuSSOzBRmmnR0idiEA1GGVjq-lHC9JRdvYwjbA9hA3hFaVfkaRpFl42Vw/exec'
};

console.log('Config.prod.js loaded with URLs:', {
    slack: window.SLACK_CONFIG.webhookUrl !== 'https://hooks.slack.com/services/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',
    sheets: window.SLACK_CONFIG.googleSheetsUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
});
