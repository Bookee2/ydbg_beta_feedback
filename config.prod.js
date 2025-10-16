// Slack and Google Sheets Configuration for GitHub Pages
window.SLACK_CONFIG = {
    webhookUrl: 'https://hooks.slack.com/services/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',
    googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbzWvnAUajYLi9Om0TkUuMlNJmOVbFoBlI_WC15ndPLv5iHfV3p9imeVN8QhlCg-osepUA/exec'
};

console.log('Config.prod.js loaded with URLs:', {
    slack: window.SLACK_CONFIG.webhookUrl !== 'https://hooks.slack.com/services/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',
    sheets: window.SLACK_CONFIG.googleSheetsUrl !== 'https://script.google.com/macros/s/AKfycbzWvnAUajYLi9Om0TkUuMlNJmOVbFoBlI_WC15ndPLv5iHfV3p9imeVN8QhlCg-osepUA/exec'
});
