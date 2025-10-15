// Simple test script
console.log('Test script loaded');

// Test form submission
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    const form = document.getElementById('feedbackForm');
    if (form) {
        console.log('Form found');
        form.addEventListener('submit', function(e) {
            console.log('Form submitted');
            e.preventDefault();
            alert('Form submission prevented - JavaScript is working!');
        });
    } else {
        console.log('Form not found');
    }
});
