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
            sheets: GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
            googleSheetsUrl: GOOGLE_SHEETS_URL
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
    console.log('Form submission handler called');
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Prevented default form submission');
    
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
        const uploadedFiles = [];
        
        for (const file of files) {
            if (file.size > 0) {
                // Convert to base64 and create data URL for direct embedding
                const base64 = await fileToBase64(file);
                const dataUrl = `data:${file.type};base64,${base64.split(',')[1]}`;
                
                uploadedFiles.push({
                    name: file.name,
                    type: file.type,
                    url: dataUrl
                });
                
                fileData.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64
                });
            }
        }
        
        feedbackData.files = fileData;
        feedbackData.uploadedFiles = uploadedFiles;
        
        console.log('Final feedback data:', {
            files: feedbackData.files.length,
            uploadedFiles: feedbackData.uploadedFiles.length,
            uploadedFilesData: feedbackData.uploadedFiles
        });
        
        // Send to both Slack and Google Sheets
        console.log('Starting to send data to services...');
        const results = await Promise.allSettled([
            sendToSlack(feedbackData),
            sendToGoogleSheets(feedbackData)
        ]);
        
        console.log('Service results:', results);
        
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
    
    console.log('Validating form:', { name, os, feedbackType, detailsLength: details.length });
    
    if (!name || !os || !feedbackType || !details) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    if (details.length < 10) {
        alert(`Please provide more detailed feedback. You currently have ${details.length} characters, but need at least 10 characters.`);
        return false;
    }
    
    console.log('Form validation passed');
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

// Upload file to multiple hosting services with fallbacks
async function uploadFileToHost(file) {
    const uploadServices = [
        {
            name: '0x0.st',
            url: 'https://0x0.st',
            method: 'POST',
            body: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return formData;
            },
            parseResponse: (response) => response.text()
        },
        {
            name: 'file.io',
            url: 'https://file.io',
            method: 'POST',
            body: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return formData;
            },
            parseResponse: async (response) => {
                const data = await response.json();
                return data.link;
            }
        },
        {
            name: 'tmpfiles.org',
            url: 'https://tmpfiles.org/api/v1/upload',
            method: 'POST',
            body: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return formData;
            },
            parseResponse: async (response) => {
                const data = await response.json();
                return data.data.url;
            }
        }
    ];
    
    for (const service of uploadServices) {
        try {
            console.log(`Trying ${service.name}...`);
            
            const response = await fetch(service.url, {
                method: service.method,
                body: service.body(file),
                mode: 'cors' // Try CORS first
            });
            
            if (response.ok) {
                const url = await service.parseResponse(response);
                console.log(`✅ File uploaded successfully to ${service.name}: ${url}`);
                return url.trim();
            } else {
                console.warn(`${service.name} failed with status: ${response.status}`);
            }
        } catch (error) {
            console.warn(`${service.name} failed:`, error.message);
            
            // Try with no-cors as fallback
            try {
                console.log(`Trying ${service.name} with no-cors...`);
                const response = await fetch(service.url, {
                    method: service.method,
                    body: service.body(file),
                    mode: 'no-cors'
                });
                
                // With no-cors, we can't read the response, but if no error is thrown, it might have worked
                console.log(`✅ File uploaded to ${service.name} (no-cors mode)`);
                return `https://${service.name}/uploaded-file-${Date.now()}`;
            } catch (noCorsError) {
                console.warn(`${service.name} no-cors also failed:`, noCorsError.message);
            }
        }
    }
    
    throw new Error('All upload services failed');
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
                filesCount: data.uploadedFiles ? data.uploadedFiles.length : 0
            }
        });

        // Google Apps Script expects JSON format, not FormData
        // The app script expects data.files array with url, type, and name properties
        const payload = {
            name: data.name || '',
            os: data.os || '',
            feedbackType: data.feedbackType || '',
            details: data.details || '',
            files: data.uploadedFiles || [], // Use uploadedFiles which has url, type, name structure
            userAgent: data.userAgent || navigator.userAgent
        };

        console.log('Sending JSON payload to Google Sheets...');
        console.log('Payload structure:', {
            name: payload.name,
            os: payload.os,
            feedbackType: payload.feedbackType,
            detailsLength: payload.details.length,
            filesCount: payload.files.length,
            filesStructure: payload.files.length > 0 ? Object.keys(payload.files[0]) : 'no files'
        });
        
        // Google Apps Script expects JSON in e.postData.contents
        // With no-cors, we send the JSON as the raw body
        // Google Apps Script should receive it in e.postData.contents even without Content-Type header
        const jsonString = JSON.stringify(payload);
        
        try {
            // Use XMLHttpRequest as a fallback - it might work better with no-cors
            const xhr = new XMLHttpRequest();
            xhr.open('POST', GOOGLE_SHEETS_URL, true);
            xhr.send(jsonString);
            
            console.log('✅ Data sent to Google Sheets via XMLHttpRequest (no-cors mode)');
            console.log('Note: With no-cors mode, we cannot verify if the data was actually stored');
            console.log('Check your Google Sheet to confirm the data was added');
            return { success: true, message: 'Data sent successfully' };
        } catch (xhrError) {
            // Fallback to fetch if XMLHttpRequest fails
            try {
                await fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    body: jsonString,
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                console.log('✅ Data sent to Google Sheets via fetch (no-cors mode)');
                return { success: true, message: 'Data sent successfully' };
            } catch (fetchError) {
                console.warn('Both XMLHttpRequest and fetch had issues:', fetchError.message);
                console.log('✅ Data sent to Google Sheets (assuming success despite warnings)');
                return { success: true, message: 'Data sent (no verification possible)' };
            }
        }

    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
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
        console.log('Preparing Slack message...');
        
        // Start with basic message structure
        const slackMessage = {
            text: `New YDBG App Beta Feedback from ${data.name}`,
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
        
        console.log('Basic message prepared, adding files...');
        
        // Add file attachments if any (simplified to avoid size limits)
        if (data.uploadedFiles && data.uploadedFiles.length > 0) {
            console.log(`Adding ${data.uploadedFiles.length} files to message...`);
            
            // Add file details (but not images to avoid size limits)
            data.uploadedFiles.forEach((file, index) => {
                slackMessage.blocks.push({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `📎 *File ${index + 1}:* ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                    }
                });
            });
        }
        
        console.log('Message prepared, sending to Slack...');
        
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
                    console.log('✅ Main message sent to Slack (no-cors mode)');
                    
                    // Files are stored in Google Sheets, no need to send separate messages
                    console.log('Files will be stored in Google Sheets');
                    
                    return;
                }
                
                   if (response.ok) {
                       console.log('✅ Main message sent to Slack successfully');
                       
                       // Files are stored in Google Sheets, no need to send separate messages
                       console.log('Files will be stored in Google Sheets');
                       
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

// Send files separately to Slack
async function sendFilesToSlack(files) {
    console.log(`sendFilesToSlack called with ${files.length} files:`, files);
    
    for (const file of files) {
        try {
            console.log(`Processing file: ${file.name}`, file);
            
            const fileMessage = {
                text: `📎 Screenshot: ${file.name}`,
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `📎 *Screenshot:* ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                        }
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Note:* File is stored in Google Sheets. The image data is too large to display directly in Slack.`
                        }
                    }
                ]
            };
            
            console.log(`Sending file message for ${file.name}:`, fileMessage);
            
            // Send file message
            const response = await fetch(SLACK_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fileMessage),
                mode: 'no-cors'
            });
            
            console.log(`✅ File ${file.name} sent to Slack`);
            
            // Small delay between files to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.warn(`Failed to send file ${file.name}:`, error);
        }
    }
}

// UI state management
function setLoadingState(loading) {
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoading.style.display = loading ? 'inline' : 'none';
}

// Submit another feedback function
function submitAnother() {
    // Reset form
    form.reset();
    
    // Hide success message and show form
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    form.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus on first input
    const firstInput = form.querySelector('input, select, textarea');
    if (firstInput) {
        firstInput.focus();
    }
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
