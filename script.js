// Configuration - Load URLs from config
const SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL_HERE';
const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// Load URLs from config if available
if (typeof window.SLACK_CONFIG !== 'undefined') {
    SLACK_WEBHOOK_URL = window.SLACK_CONFIG.webhookUrl;
    GOOGLE_SHEETS_URL = window.SLACK_CONFIG.googleSheetsUrl;
}

// DOM elements
const form = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const feedbackData = {
            name: formData.get('name'),
            os: formData.get('os'),
            feedbackType: formData.get('feedbackType'),
            details: formData.get('details'),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // Handle file uploads
        const files = formData.getAll('screenshots');
        const fileData = [];
        
        for (const file of files) {
            if (file.size > 0) {
                const base64 = await fileToBase64(file);
                fileData.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64
                });
            }
        }
        
        feedbackData.files = fileData;
        
        // Send to both Slack and Google Sheets
        const results = await Promise.allSettled([
            sendToSlack(feedbackData),
            sendToGoogleSheets(feedbackData)
        ]);
        
        // Check if at least one succeeded
        const slackSuccess = results[0].status === 'fulfilled';
        const sheetsSuccess = results[1].status === 'fulfilled';
        
        if (slackSuccess || sheetsSuccess) {
            // Show success message
            showSuccess();
        } else {
            // Both failed
            console.error('Both Slack and Google Sheets failed:', results);
            showError();
        }
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showError();
    } finally {
        setLoadingState(false);
    }
});

// Form validation
function validateForm() {
    const name = document.getElementById('name').value;
    const os = document.getElementById('os').value;
    const feedbackType = document.getElementById('feedbackType').value;
    const details = document.getElementById('details').value.trim();
    
    if (!name || !os || !feedbackType || !details) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    if (details.length < 10) {
        alert('Please provide more detailed feedback (at least 10 characters).');
        return false;
    }
    
    return true;
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Send data to Google Sheets
async function sendToGoogleSheets(data) {
    if (GOOGLE_SHEETS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.log('Google Sheets URL not configured, skipping...');
        throw new Error('Google Sheets URL not configured');
    }
    
    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            mode: 'no-cors' // This might help with CORS issues
        });
        
        // With no-cors mode, we can't read the response, so we assume success
        console.log('Data sent to Google Sheets (no-cors mode)');
        return;
        
    } catch (error) {
        // If no-cors fails, try with regular mode
        console.log('No-cors failed, trying regular mode...');
        
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Google Sheets API failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Unknown Google Sheets error');
        }
        
        console.log('Data sent to Google Sheets successfully');
    }
}

// Send data to Slack
async function sendToSlack(data) {
    if (SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
        throw new Error('Slack webhook URL not configured');
    }
    
    // Format the message for Slack
    const slackMessage = {
        text: `New YDBG App Beta Feedback`,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🔍 New Beta Feedback Received"
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Name:*\n${data.name}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*OS:*\n${data.os}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Feedback Type:*\n${data.feedbackType}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Timestamp:*\n${new Date(data.timestamp).toLocaleString()}`
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Details:*\n${data.details}`
                }
            }
        ]
    };
    
    // Add file attachments if any
    if (data.files && data.files.length > 0) {
        slackMessage.blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Screenshots:* ${data.files.length} file(s) attached`
            }
        });
    }
    
    const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage)
    });
    
    if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status}`);
    }
}

// UI state management
function setLoadingState(loading) {
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoading.style.display = loading ? 'inline' : 'none';
}

function showSuccess() {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showError() {
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    
    // Scroll to error message
    errorMessage.scrollIntoView({ behavior: 'smooth' });
}

// File upload preview (optional enhancement)
const fileInput = document.getElementById('screenshots');
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    
    // Validate file count
    if (files.length > maxFiles) {
        alert(`Please select no more than ${maxFiles} files.`);
        e.target.value = '';
        return;
    }
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
        alert(`Some files are too large. Please keep files under 10MB each.`);
        e.target.value = '';
        return;
    }
    
    // Show file count
    const fileHelp = document.querySelector('.file-help');
    if (files.length > 0) {
        fileHelp.textContent = `${files.length} file(s) selected`;
    } else {
        fileHelp.textContent = 'You can upload multiple images (PNG, JPG, GIF)';
    }
});

// Add some visual feedback for form interactions
document.querySelectorAll('select, textarea').forEach(element => {
    element.addEventListener('focus', () => {
        element.parentElement.classList.add('focused');
    });
    
    element.addEventListener('blur', () => {
        element.parentElement.classList.remove('focused');
    });
});

// Add CSS for focused state
const style = document.createElement('style');
style.textContent = `
    .form-group.focused label {
        color: #4f46e5;
    }
`;
document.head.appendChild(style);
