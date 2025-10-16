// Slack and Google Sheets Configuration for GitHub Pages
// This file loads the actual URLs from a separate, non-tracked file
window.SLACK_CONFIG = {
    webhookUrl: 'YOUR_SLACK_WEBHOOK_URL_HERE',
    googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbx086lKDETdRyuSSOzBRmmnR0idiEA1GGVjq-lHC9JRdvYwjbA9hA3hFaVfkaRpFl42Vw/exec'
};

// Try to load production config if available
fetch('config.prod.secret.js')
    .then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new Error('Secret config not found');
    })
    .then(configText => {
        // Execute the secret config to override the default URLs
        eval(configText);
        console.log('Production secret config loaded');
    })
    .catch(error => {
        console.log('Using default config (secret config not available)');
    });

console.log('Config.prod.js loaded with URLs:', {
    slack: window.SLACK_CONFIG.webhookUrl !== 'YOUR_SLACK_WEBHOOK_URL_HERE',
    sheets: window.SLACK_CONFIG.googleSheetsUrl !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
});
