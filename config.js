// Configuration Loader for YDBG Beta Feedback
// This script loads configuration from multiple sources

(function() {
    // Production configuration
    const config = {
        webhookUrl: 'https://hooks.slack.com/services/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',
        googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbz6Y-oUK5vbkfJ-Z7892YldYCY0wWNzANShS09gLhAb2C8F-SMaG1ejRbEMBgC1IFylww/exec'
    };

    // Set the global config
    window.SLACK_CONFIG = config;
    
    console.log('Configuration loaded:', {
        slack: true,
        sheets: true
    });
})();
