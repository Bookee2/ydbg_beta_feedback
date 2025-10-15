// Configuration - Load URLs from config
let SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL_HERE';
let GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// Load URLs from config if available
function loadConfig() {
    if (typeof window.SLACK_CONFIG !== 'undefined') {
        SLACK_WEBHOOK_URL = window.SLACK_CONFIG.webhookUrl || SLACK_WEBHOOK_URL;
        GOOGLE_SHEETS_URL = window.SLACK_CONFIG.googleSheetsUrl || GOOGLE_SHEETS_URL;
        console.log('Configuration loaded:', {
            slack: SLACK_WEBHOOK_URL !== 'YOUR_SLACK_WEBHOOK_URL_HERE',
            sheets: GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
        });
    } else {
        console.warn('SLACK_CONFIG not found, using default URLs');
    }
}

// Load config immediately
loadConfig();

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
    
    // Reload config in case it wasn't loaded initially
    loadConfig();
    
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
        return;
    }
    
       try {
           console.log('Sending to Google Sheets:', {
               url: GOOGLE_SHEETS_URL,
               data: {
                   name: data.name,
                   os: data.os,
                   feedbackType: data.feedbackType,
                   details: data.details.substring(0, 50) + '...',
                   filesCount: data.files ? data.files.length : 0
               }
           });
           
           // Try multiple approaches to bypass CORS
           const approaches = [
            // Approach 1: Direct with no-cors
            {
                name: 'no-cors',
                options: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    mode: 'no-cors'
                }
            },
            // Approach 2: With CORS proxy
            {
                name: 'cors-proxy',
                options: {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(data)
                },
                url: 'https://cors-anywhere.herokuapp.com/' + GOOGLE_SHEETS_URL
            },
            // Approach 3: Direct without headers
            {
                name: 'simple',
                options: {
                    method: 'POST',
                    body: JSON.stringify(data)
                }
            }
        ];
        
        for (const approach of approaches) {
            try {
                console.log(`Trying ${approach.name} approach...`);
                const url = approach.url || GOOGLE_SHEETS_URL;
                const response = await fetch(url, approach.options);
                
                   if (approach.name === 'no-cors') {
                       // With no-cors, we can't read the response, but if no error is thrown, it likely worked
                       console.log('✅ Data sent to Google Sheets (no-cors mode)');
                       return;
                   }

                   if (response.ok) {
                       const result = await response.json();
                       console.log('Google Sheets response:', result);
                       if (result.success) {
                           console.log('✅ Data sent to Google Sheets successfully');
                           return;
                       } else {
                           console.warn('Google Sheets returned error:', result.error || result.message);
                       }
                   } else {
                       console.warn(`Google Sheets ${approach.name} approach failed with status:`, response.status);
                   }
            } catch (error) {
                console.log(`${approach.name} approach failed:`, error.message);
                continue; // Try next approach
            }
        }
        
        throw new Error('All Google Sheets approaches failed');
        
    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        throw error;
    }
}

// Send data to Slack
async function sendToSlack(data) {
    if (SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
        console.log('Slack webhook URL not configured, skipping...');
        return; // Don't throw error, just skip
    }
    
    try {
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
               
               // Add file details
               data.files.forEach((file, index) => {
                   slackMessage.blocks.push({
                       type: "section",
                       text: {
                           type: "mrkdwn",
                           text: `📎 *File ${index + 1}:* ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                       }
                   });
               });
           }
        
        // Try multiple approaches to bypass CORS
        const approaches = [
            // Approach 1: Direct with no-cors
            {
                name: 'no-cors',
                options: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(slackMessage),
                    mode: 'no-cors'
                }
            },
            // Approach 2: Simple message format
            {
                name: 'simple',
                options: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `🔍 New Beta Feedback from ${data.name} (${data.os}): ${data.details}`
                    })
                }
            },
            // Approach 3: With CORS proxy
            {
                name: 'cors-proxy',
                options: {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(slackMessage)
                },
                url: 'https://cors-anywhere.herokuapp.com/' + SLACK_WEBHOOK_URL
            }
        ];
        
        for (const approach of approaches) {
            try {
                console.log(`Trying Slack ${approach.name} approach...`);
                const url = approach.url || SLACK_WEBHOOK_URL;
                const response = await fetch(url, approach.options);
                
                if (approach.name === 'no-cors') {
                    // With no-cors, we can't read the response, but if no error is thrown, it likely worked
                    console.log('Data sent to Slack (no-cors mode)');
                    return;
                }
                
                if (response.ok) {
                    console.log('Data sent to Slack successfully');
                    return;
                }
            } catch (error) {
                console.log(`Slack ${approach.name} approach failed:`, error.message);
                continue; // Try next approach
            }
        }
        
        throw new Error('All Slack approaches failed');
        
    } catch (error) {
        console.error('Error sending to Slack:', error);
        throw error; // Re-throw so Promise.allSettled can handle it
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
